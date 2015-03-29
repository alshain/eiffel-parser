/// <reference path="visitor.ts" />

module eiffel.semantics {
  import sym = eiffel.symbols;

  export function analyze(asts: ast.Class[]): AnalysisResult {
    var analysisContext = new AnalysisContext();
    asts.forEach(function (ast) {
      ast.accept(new FeatureDiscovery(analysisContext), null);
    });
    var newVar = {
        asts: asts,
        errors: [],
        context: analysisContext,
      };
    console.log(newVar);
    return newVar;
  }

  class AnalysisContext {
    classSymbols: LookupTable<sym.ClassSymbol> = {};
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

    error(message: string, kind: SemanticErrors) {
      this.analysisContext.errors.push(SemanticErrors[kind] + message);
    }
  }

  enum SemanticErrors {
    DuplicateFeatureName,
    DuplicateParameterName,
    DuplicateClassName,
  }

  class FeatureDiscovery extends SemanticVisitor<symbols.ClassSymbol, any> {
    vClass(_class:eiffel.ast.Class, _:symbols.ClassSymbol):any {
      var name = _class.name.name;
      var classSymbol = new symbols.ClassSymbol(name);

      this.classSymbols[name] = classSymbol;
      return this.vChildren(_class, classSymbol);
    }

    vFeature(feature:eiffel.ast.Feature, classSymbol:symbols.ClassSymbol):any {
      return super.vFeature(feature, classSymbol);
    }


    vAttr(attr:eiffel.ast.Attribute, classSymbol:symbols.ClassSymbol):any {
      var name = attr.name.name;
      this.errorOnDuplicateFeature(classSymbol, name);

      var attributeSymbol = new symbols.AttributeSymbol(name, attr);

      attr.sym = attributeSymbol;
      classSymbol.attributes[name] = attributeSymbol;

      return super.vAttr(attr, classSymbol);
    }

    vFunction(func:eiffel.ast.Function, classSymbol:symbols.ClassSymbol):any {
      console.log(func);
      var functionName = func.name.name;
      this.errorOnDuplicateFeature(classSymbol, functionName);

      var sym = new symbols.FunctionSymbol();

      func.sym = sym;
      classSymbol.functions[functionName] = sym;
      classSymbol.routines[functionName] = sym;

      return super.vFunction(func, classSymbol);
    }

    private errorOnDuplicateFeature(classSymbol, featureName) {
      if (classSymbol.hasSymbol(featureName)) {
        this.error("Feature with name " + featureName + " already exists", SemanticErrors.DuplicateFeatureName);
      }
    }

    vProcedure(procedure:eiffel.ast.Procedure, classSymbol:symbols.ClassSymbol):any {
      console.log(procedure);
      var procedureName = procedure.name.name;
      this.errorOnDuplicateFeature(classSymbol, procedureName);

      var sym = new symbols.FunctionSymbol();

      procedure.sym = sym;
      classSymbol.procedures[procedureName] = sym;
      classSymbol.routines[procedureName] = sym;

      return super.vProcedure(procedure, classSymbol);
    }

    vConstantAttribute(constantAttribute:eiffel.ast.ConstantAttribute, classSymbol:symbols.ClassSymbol):any {
      console.log(constantAttribute);
      var name = constantAttribute.name.name;
      this.errorOnDuplicateFeature(classSymbol, name);

      var attributeSymbol = new symbols.AttributeSymbol(name, constantAttribute);

      constantAttribute.sym = attributeSymbol;
      classSymbol.attributes[name] = attributeSymbol;

      return super.vConstantAttribute(constantAttribute, classSymbol);
    }
  }

  export interface AnalysisResult {
    asts: eiffel.ast.Class[];
    errors: any[];
    context: AnalysisContext;
  }
}
