/// <reference path="visitor.ts" />

module eiffel.semantics {
  import sym = eiffel.symbols;

  export function analyze(asts: ast.Class[]): AnalysisResult {
    var analysisContext = new AnalysisContext();
    asts.forEach(function (ast) {
      ast.accept(new FeatureDiscovery(analysisContext.classSymbols), null);
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
  }

  class FeatureDiscovery extends ast.Visitor<symbols.ClassSymbol, any> {
    classSymbols:LookupTable<sym.ClassSymbol>;


    constructor(classSymbols: LookupTable<sym.ClassSymbol>) {
      super();
      this.classSymbols = classSymbols;
    }

    vClass(_class:eiffel.ast.Class, arg:symbols.ClassSymbol):any {
      var name = _class.name.name;
      var classSymbol = new symbols.ClassSymbol(name);

      this.classSymbols[name] = classSymbol;
      return this.vChildren(_class, classSymbol);
    }

    vFeature(feature:eiffel.ast.Feature, arg:symbols.ClassSymbol):any {
      return super.vFeature(feature, arg);
    }


    vAttr(attr:eiffel.ast.Attribute, arg:symbols.ClassSymbol):any {
      console.log(attr);
      return super.vAttr(attr, arg);
    }

    vFunction(func:eiffel.ast.Function, arg:symbols.ClassSymbol):any {
      console.log(func);
      var functionName = func.name.name;
      var sym = new symbols.FunctionSymbol();
      func.sym = sym;
      arg.functions[functionName] = sym;
      return super.vFunction(func, arg);
    }

    vProcedure(procedure:eiffel.ast.Procedure, arg:symbols.ClassSymbol):any {
      console.log(procedure);
      return super.vProcedure(procedure, arg);
    }

    vConstantAttribute(constantAttribute:eiffel.ast.ConstantAttribute, arg:symbols.ClassSymbol):any {
      return super.vConstantAttribute(constantAttribute, arg);
    }
  }

  export interface AnalysisResult {
    asts: eiffel.ast.Class[];
    errors: any[];
    context: AnalysisContext;
  }
}
