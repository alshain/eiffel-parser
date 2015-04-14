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

      analysisContext.classSymbols[name] = classSymbol;
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
          routine.localsAndParamsByName[varName] = variableSymbol;
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
            routine.localsAndParamsByName[varName] = variableSymbol;
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

    analysisContext.allClasses.forEach(function (classSymbol) {
      classSymbol.ast.creationClause.forEach(function (identifier) {
        var name: string = identifier.name;
        if (classSymbol.procedures.hasOwnProperty(name)) {
          classSymbol.creationProcedures[name] = classSymbol.procedures[name];
        }
        else if (classSymbol.functions.hasOwnProperty(name)) {
            analysisContext.errors.push("Functions cannot be used as creation procedures " + name);
        }
        else {
          analysisContext.errors.push("There is not procedure with name " + name);
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
    classSymbols: LookupTable<sym.ClassSymbol> = {};
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

    errors: string[] = [];
  }

  class SemanticVisitor<A, R> extends ast.Visitor<A, R> {
    classSymbols:LookupTable<sym.ClassSymbol>;
    analysisContext: AnalysisContext;


    constructor(analysisContext: AnalysisContext) {
      super();
      this.analysisContext = analysisContext;
      this.classSymbols = analysisContext.classSymbols;
    }

    error(message: string, kind: SemanticErrorKind) {
      this.analysisContext.errors.push(SemanticErrorKind[kind] + message);
    }
  }

  enum SemanticErrorKind {
    DuplicateFeatureName,
    DuplicateParameterName,
    DuplicateClassName,
  }

  class FeatureDiscovery extends SemanticVisitor<any, any> {

    constructor(analysisContext: AnalysisContext, classSymbol:symbols.ClassSymbol) {
      super(analysisContext);
      this.classSymbol = classSymbol;
    }

    classSymbol: symbols.ClassSymbol;

    vAttr(attr:eiffel.ast.Attribute, _:any):any {
      var name = attr.name.name;
      this.errorOnDuplicateFeature(this.classSymbol, name);

      var attributeSymbol = new symbols.AttributeSymbol(name, attr);

      attr.sym = attributeSymbol;
      this.classSymbol.attributes[name] = attributeSymbol;

      //return super.vAttr(attr, this.classSymbol);
    }

    vFunction(func:eiffel.ast.Function, _:any):any {
      var functionName = func.name.name;
      this.errorOnDuplicateFeature(this.classSymbol, functionName);

      var sym = new symbols.FunctionSymbol(functionName, func);

      func.sym = sym;
      this.classSymbol.functions[functionName] = sym;
      this.classSymbol.routines[functionName] = sym;
      this.analysisContext.allFunctions.push(sym);
      this.analysisContext.allRoutines.push(sym);

      //return super.vFunction(func, this.classSymbol);
    }

    private errorOnDuplicateFeature(classSymbol, featureName) {
      if (classSymbol.hasSymbol(featureName)) {
        this.error("Feature with name " + featureName + " already exists", SemanticErrorKind.DuplicateFeatureName);
      }
    }

    vProcedure(procedure:eiffel.ast.Procedure, _:any):any {
      var procedureName = procedure.name.name;
      this.errorOnDuplicateFeature(this.classSymbol, procedureName);

      var sym = new symbols.ProcedureSymbol(procedureName, procedure);

      procedure.sym = sym;
      this.classSymbol.procedures[procedureName] = sym;
      this.classSymbol.routines[procedureName] = sym;
      this.analysisContext.allProcedures.push(sym);
      this.analysisContext.allRoutines.push(sym);

      //return super.vProcedure(procedure, this.classSymbol);
    }

    vConstantAttribute(constantAttribute:eiffel.ast.ConstantAttribute, _:any):any {
      var name = constantAttribute.name.name;
      this.errorOnDuplicateFeature(this.classSymbol, name);

      var attributeSymbol = new symbols.AttributeSymbol(name, constantAttribute);

      constantAttribute.sym = attributeSymbol;
      this.classSymbol.attributes[name] = attributeSymbol;

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

  class TypeConnector extends SemanticVisitor<any, any> {


  }


    export interface AnalysisResult {
    asts: eiffel.ast.Class[];
    errors: any[];
    context: AnalysisContext;
  }
}
