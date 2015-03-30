/// <reference path="visitor.ts" />
declare var __eiffel_builtin;
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
      routine.ast.locals.forEach(function (varDeclLists:eiffel.ast.VarDeclList[]) {
        varDeclLists.forEach(function (parameterList) {
          parameterList.varDecls.forEach(function (varDecl) {
            var varName = varDecl.name.name;
            var variableSymbol = new symbols.VariableSymbol(varName, varDecl);
            routine.locals.push(variableSymbol);
            routine.localsAndParamsByName[varName] = variableSymbol;
          });
        });
      });
    });
  };

  export function analyze(...manyAsts: ast.Class[][]): AnalysisResult {
    var builtinSources = __eiffel_builtin.map(function (x) {
      return x.content;
    });
    Array.prototype.push.apply(manyAsts, builtinSources.map(function(source) { return eiffel.parser.parse(source)}));
    var asts: ast.Class[] = Array.prototype.concat.apply([], manyAsts);
    var analysisContext = new AnalysisContext();
    createClassSymbols(asts, analysisContext);
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

  class TypeConnector extends SemanticVisitor<any, any> {


  }


    export interface AnalysisResult {
    asts: eiffel.ast.Class[];
    errors: any[];
    context: AnalysisContext;
  }
}
