/// <reference path="visitor.ts" />
/// <reference path="fromJS.d.ts" />

module eiffel.semantics {
  import sym = eiffel.symbols;

  var createClassSymbols = function (asts, analysisContext: AnalysisContext) {
    asts.forEach(function (ast:eiffel.ast.Class) {
      if (!(ast instanceof eiffel.ast.Class)) {
        console.error("Root AST node is not instance of Class", ast);
        throw new Error("Root AST node is not instance of Class");
      }

      var name = ast.name.name;
      var classSymbol = new symbols.ClassSymbol(name, ast);

      analysisContext.classSymbols.set(classSymbol.lowerCaseName, classSymbol);
      analysisContext.allClasses.push(classSymbol);
    });
  };

  var createFeatureSymbols = function (analysisContext: AnalysisContext) {
    analysisContext.allClasses.forEach(function (classSymbol) {
      classSymbol.ast.accept(new FeatureDiscovery(analysisContext, classSymbol), null);
    });
  };

  var createRoutineParamSymbols = function (allRoutines) {
    allRoutines.forEach(function (routine:symbols.RoutineSymbol) {
      routine.ast.parameters.forEach(function (parameterList:eiffel.ast.VarDeclList) {
        parameterList.varDecls.forEach(function (varDecl) {
          var varName = varDecl.name.name;
          var variableSymbol = new symbols.VariableSymbol(varName, varDecl);
          routine.paramsInOrder.push(variableSymbol);
          routine.localsAndParamsByName.set(varName, variableSymbol);
        });
      });
    });
  };

  var createRoutineLocalSymbols = function (analysisContext) {
    analysisContext.allRoutines.forEach(function (routine:symbols.RoutineSymbol) {
      var localsBlocks: eiffel.ast.LocalsBlock[] = <eiffel.ast.LocalsBlock[]> routine.ast.children.filter(function (child) {
        return child instanceof eiffel.ast.LocalsBlock;
      });

      localsBlocks.forEach(function (localBlock:eiffel.ast.LocalsBlock) {
        localBlock.varDeclLists.forEach(function (varsDecl) {
          varsDecl.varDecls.forEach(function (varDecl) {
            var varName = varDecl.name.name;
            var variableSymbol = new symbols.VariableSymbol(varName, varDecl);
            routine.locals.push(variableSymbol);
            routine.localsAndParamsByName.set(varName, variableSymbol);
          });
        });
      });
    });
  };

  var parseError = function parseError(builtinSource, e) {
    console.group("Parse Error: " + builtinSource.filename);
    console.log("Found", e.found);
    console.groupCollapsed("Expected");
    console.table(e.expected);
    console.groupEnd();
    console.group("Context");
    var lines = builtinSource.content.split(/\r?\n/);

    var context =
      lines[e.line - 4]
      + lines[e.line - 3] + "\n"
      + lines[e.line - 2] + "\n"
      + lines[e.line - 1] + "\n"
      + Array(e.column).join("-") + "^ -- Line: " + e.line + " Column: " + e.column + "\n"
      + lines[e.line + 0]
      + lines[e.line + 1]
      + lines[e.line + 2]
      + lines[e.line + 3];
    console.log(context);
    console.groupEnd();
    console.groupCollapsed("Source");
    console.log(builtinSource.content);
    console.groupEnd();
    console.log(e);
    console.groupEnd();
  };

  var initAstDictionary = function initAstDictionary(analysisContext) {
    analysisContext.allClasses.forEach(function (classSymbol) {
      classSymbol.ast.accept(new AstToDictionaryByPrototype(analysisContext), analysisContext.astDictionary);
    });
  };

  var initAstDictionaryByClass = function initAstDictionaryByClass(analysisContext) {
    analysisContext.allClasses.forEach(function (classSymbol) {
      classSymbol.ast.accept(new AstToDictionaryByPrototype(analysisContext), classSymbol.ast.dictionary);
    });
  };

  var requireValidClassForAnalysis = function requireClassForAnalysis(name: string, analysisContext: AnalysisContext, success: (symbol: eiffel.symbols.ClassSymbol, context: AnalysisContext) => any, failure: (context: AnalysisContext) => any): any {
    if (analysisContext.classSymbols.hasOwnProperty(name)) {
      return success(analysisContext.classWithName(name), analysisContext);
    }
    else {
      failure(analysisContext);
      return false;
    }
  }

  export function analyze(...manyAsts: ast.Class[][]): AnalysisResult {
    var parse = function parse(builtinSource: BuiltinSource) {
      try {
        return eiffel.parser.parse(builtinSource.content)
      }
      catch (e) {
        parseError(builtinSource, e);
        throw e;
      }
    };
    Array.prototype.push.apply(manyAsts, __eiffel_builtin.map(parse));
    var asts: ast.Class[] = Array.prototype.concat.apply([], manyAsts);
    var analysisContext = new AnalysisContext();
    createClassSymbols(asts, analysisContext);
    initAstDictionary(analysisContext);
    initAstDictionaryByClass(analysisContext);
    createFeatureSymbols(analysisContext);
    createRoutineParamSymbols(analysisContext.allRoutines);
    createRoutineLocalSymbols(analysisContext);

    var inheritanceBeingChecked: Set<eiffel.symbols.ClassSymbol> = new Set<eiffel.symbols.ClassSymbol>();
    var inheritanceChecked: Set<eiffel.symbols.ClassSymbol> = new Set<eiffel.symbols.ClassSymbol>();
    var inheritanceCycles: eiffel.symbols.ClassSymbol[][] = [];
    var hasValidHierarchy = function hasValidHierarchy(oneClass: eiffel.symbols.ClassSymbol, descendants: eiffel.symbols.ClassSymbol[]) {
      if (inheritanceBeingChecked.has(oneClass)) {
        oneClass.hasCyclicInheritance = true;
        inheritanceCycles.push(descendants.slice(0));
        return;
      }
      else if (inheritanceChecked.has(oneClass)) {

      }
      else {
        inheritanceBeingChecked.add(oneClass);
        oneClass.ast.parentGroups.forEach(function (parentGroup:eiffel.ast.ParentGroup) {
          parentGroup.parents.forEach(function (parent:eiffel.ast.Parent) {
            var parentName = parent.rawType.name.name;
            requireValidClassForAnalysis(parentName, analysisContext,
              function (parentSymbol: eiffel.symbols.ClassSymbol) {
                if (parentSymbol.hasCyclicInheritance) {
                  /**
                   * This implies that hasValidHierarchy() has already been called on parentSymbol
                   * Implying that all the cycles it participates in have already been identified
                   * Thus, this `oneClass` cannot be inside any such cycle.
                   *
                   */
                  oneClass.inheritsFromCyclicInheritance = true;

                }
                else {
                  descendants.push(oneClass);
                  hasValidHierarchy(parentSymbol, descendants);
                  descendants.pop();
                  oneClass.hasCyclicInheritance = parentSymbol.hasCyclicInheritance;
                  oneClass.inheritsFromCyclicInheritance = parentSymbol.inheritsFromCyclicInheritance;
                }
              },
              function failure(ac:AnalysisContext) {
                analysisContext.errors.unknownClass(parent.rawType.name);
              }
            );
          })
        });
        inheritanceBeingChecked.delete(oneClass);
        inheritanceChecked.add(oneClass);
      }
    };

    analysisContext.allClasses.forEach(function (oneClass: eiffel.symbols.ClassSymbol) {
      hasValidHierarchy(oneClass, []);
    });

    if (inheritanceCycles.length > 0) {
      analysisContext.errors.uncategorized("Cyclic inheritance detected");
      console.error("Cycles:", inheritanceCycles);
    };


    analysisContext.allClasses.map(function (oneClass) {
      oneClass.ast.genericParameters.forEach(function (genericParameter) {
        new eiffel.symbols.ClassSymbol(genericParameter.name.name, null);
      });
    });

    analysisContext.allClasses.forEach(function (classSymbol) {
      classSymbol.ast.creationClause.forEach(function (identifier) {
        var name: string = identifier.name;
        if (classSymbol.procedures.hasOwnProperty(name)) {
          classSymbol.creationProcedures.set(name, classSymbol.procedures.get(name));
        }
        else if (classSymbol.functions.hasOwnProperty(name)) {
            analysisContext.errors.uncategorized("Functions cannot be used as creation procedures " + name);
        }
        else {
          analysisContext.errors.uncategorized("There is not a procedure with name " + name);
        }
      })
    });



    var newVar = {
        asts: asts,
        errors: analysisContext.errors,
        context: analysisContext,
      };
    return newVar;
  }

  class AnalysisContext {
    classSymbols: LookupTable<sym.ClassSymbol> = new Map<string, sym.ClassSymbol>();
    allFunctions: symbols.FunctionSymbol[] = [];
    allProcedures: symbols.ProcedureSymbol[] = [];
    allRoutines: symbols.RoutineSymbol[] = [];
    allClasses: symbols.ClassSymbol[] = [];
    astDictionary: Map<any, eiffel.ast.AST[]> = new Map<any, eiffel.ast.AST[]>();

    allWithPrototype(prototype) {
      if (this.astDictionary.has(prototype)) {
        return this.astDictionary.get(prototype);
      }
      else {
        console.error("Prototype is not a key", prototype, this.astDictionary);
        throw new Error("Prototype is not a key" + prototype);
      }
    }

    classWithName(name: string): eiffel.symbols.ClassSymbol {
      var lowerCaseName = name.toLowerCase();
      if (this.classSymbols.has(lowerCaseName)) {
        return this.classSymbols.get(lowerCaseName);
      }
      else {
        throw new Error("There is no class with name: " + name);
      }
    }

    hasClass(name: string): boolean {
      var lowerCaseName = name.toLowerCase();
      return this.classSymbols.has(lowerCaseName);
    }

    errors: ErrorContext = new ErrorContext();
  }

  class ErrorContext {
    errors: string[] = [];

    add(kind: SemanticErrorKind, message: string, ast?: eiffel.ast.AST) {
      var entireMessage = SemanticErrorKind[kind] + ": " + message;
      console.error(entireMessage, ast);
      this.errors.push(entireMessage);
    }

    unknownClass(identifier: eiffel.ast.Identifier) {
      this.add(SemanticErrorKind.UnknownClass, identifier.name, identifier);
    }

    duplicateFeature(identifier: eiffel.ast.Identifier) {
      this.add(SemanticErrorKind.DuplicateFeatureName, identifier.name, identifier);
    }

    uncategorized(message: string): void {
      this.errors.push(message);
    }
  }

  class SemanticVisitor<A, R> extends ast.Visitor<A, R> {
    classSymbols:LookupTable<sym.ClassSymbol>;
    analysisContext: AnalysisContext;


    constructor(analysisContext: AnalysisContext) {
      super();
      this.analysisContext = analysisContext;
      this.classSymbols = analysisContext.classSymbols;
    }
  }

  export enum SemanticErrorKind {
    DuplicateFeatureName,
    DuplicateParameterName,
    DuplicateClassName,
    UnknownClass,
    InheritanceCycle,
  }

  class FeatureDiscovery extends SemanticVisitor<any, any> {

    constructor(analysisContext: AnalysisContext, classSymbol:symbols.ClassSymbol) {
      super(analysisContext);
      this.classSymbol = classSymbol;
    }

    classSymbol: symbols.ClassSymbol;

    vAttr(attr:eiffel.ast.Attribute, _:any):any {
      attr.frozenNamesAndAliases.map(function (fna) {
        var name = fna.name.name;
        var lcName = name.toLowerCase();
        this.errorOnDuplicateFeature(this.classSymbol, lcName, fna.name);

        var alias: string = null;
        if (fna.alias != null) {
          alias = fna.alias.name.value;
        }
        var attributeSymbol = new symbols.AttributeSymbol(name, alias, fna.frozen, attr);

        attr.sym = attributeSymbol;
        this.classSymbol.attributes.set(lcName, attributeSymbol);
      }, this);

      //return super.vAttr(attr, this.classSymbol);
    }

    vFunction(func:eiffel.ast.Function, _:any):any {
      func.frozenNamesAndAliases.map(function (fna) {
        var functionName = fna.name.name;
        var lcFunctionName = functionName.toLowerCase();
        this.errorOnDuplicateFeature(this.classSymbol, lcFunctionName, fna.name);

        var alias: string = null;
        if (fna.alias != null) {
          alias = fna.alias.name.value;
        }
        var sym = new symbols.FunctionSymbol(lcFunctionName, alias, fna.frozen, func);

        func.sym = sym;
        this.classSymbol.functions.set(lcFunctionName, sym);
        this.classSymbol.routines.set(lcFunctionName, sym);
        this.analysisContext.allFunctions.push(sym);
        this.analysisContext.allRoutines.push(sym);
      }, this);

      //return super.vFunction(func, this.classSymbol);
    }

    private errorOnDuplicateFeature(classSymbol, featureName, identifier) {
      if (classSymbol.hasSymbol(featureName)) {
        this.analysisContext.errors.duplicateFeature(identifier);
      }
    }

    vProcedure(procedure:eiffel.ast.Procedure, _:any):any {
      procedure.frozenNamesAndAliases.map(function (fna) {

        var procedureName = fna.name.name;
        var lcProcedureName = procedureName.toLowerCase();
        this.errorOnDuplicateFeature(this.classSymbol, lcProcedureName, fna.name);

        var alias: string = null;
        if (fna.alias != null) {
          alias = fna.alias.name.value;
        }
        var sym = new symbols.ProcedureSymbol(procedureName, alias, fna.frozen, procedure);

        procedure.sym = sym;
        this.classSymbol.procedures.set(lcProcedureName, sym);
        this.classSymbol.routines.set(lcProcedureName, sym);
        this.analysisContext.allProcedures.push(sym);
        this.analysisContext.allRoutines.push(sym);
      }, this);
      //return super.vProcedure(procedure, this.classSymbol);
    }

    vConstantAttribute(constantAttribute:eiffel.ast.ConstantAttribute, _:any):any {
      constantAttribute.frozenNamesAndAliases.map(function (fna) {

        var name = fna.name.name;
        var lcName = name.toLowerCase();
        this.errorOnDuplicateFeature(this.classSymbol, lcName, fna.name);

        var alias: string = null;
        if (fna.alias != null) {
          alias = fna.alias.name.value;
        }
        var attributeSymbol = new symbols.AttributeSymbol(name, alias, fna.frozen, constantAttribute);

        constantAttribute.sym = attributeSymbol;
        this.classSymbol.attributes.set(lcName, attributeSymbol);
      }, this);
      //return super.vConstantAttribute(constantAttribute, this.classSymbol);
    }
  }


  class AstToDictionaryByPrototype extends SemanticVisitor<any, any> {
    vDefault(ast:eiffel.ast.AST, arg:any):any {
      var prototype = Object.getPrototypeOf(ast);
      if (arg.has(prototype)) {
        arg.get(prototype).push(ast);
      }
    else {
        arg.set(prototype, [ast]);
      }
      return super.vDefault(ast, arg);
    }
  }


  class FeatureTypeConnector extends SemanticVisitor<any, any> {


  }


    export interface AnalysisResult {
    asts: eiffel.ast.Class[];
    errors: ErrorContext;
    context: AnalysisContext;
  }
}
