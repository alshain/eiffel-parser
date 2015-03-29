/// <reference path="visitor.ts" />

module eiffel.semantics {
  import sym = eiffel.symbols;

  export function analyze(asts: ast.Class[]): AnalysisResult {
    var analysisContext = new AnalysisContext();
    asts.forEach(function (ast) {
      ast.accept(new FeatureDiscovery(analysisContext.classSymbols), null);
    });
    return null;
  }

  class AnalysisContext {
    classSymbols: LookupTable<sym.ClassSymbol> = {};
  }

  class FeatureDiscovery extends ast.Visitor<ast.Class, any> {
    classSymbols:LookupTable<sym.ClassSymbol>;


    constructor(classSymbols: LookupTable<sym.ClassSymbol>) {
      super();
      this.classSymbols = classSymbols;
    }

    vClass(_class:eiffel.ast.Class, arg:eiffel.ast.Class):any {
      console.log(_class.name.name);
      console.log(_class);
      return this.vChildren(_class, _class);
    }

    vFeature(feature:eiffel.ast.Feature, arg:eiffel.ast.Class):any {
      return super.vFeature(feature, arg);
    }


    vAttr(attr:eiffel.ast.Attribute, arg:eiffel.ast.Class):any {
      console.log(attr);
      return super.vAttr(attr, arg);
    }

    vFunction(func:eiffel.ast.Function, arg:eiffel.ast.Class):any {
      console.log(func);
      return super.vFunction(func, arg);
    }

    vProcedure(procedure:eiffel.ast.Procedure, arg:eiffel.ast.Class):any {
      console.log(procedure);
      return super.vProcedure(procedure, arg);
    }

    vConstantAttribute(constantAttribute:eiffel.ast.ConstantAttribute, arg:eiffel.ast.Class):any {
      return super.vConstantAttribute(constantAttribute, arg);
    }
  }

  export interface AnalysisResult {
    ast: eiffel.ast.Class[];
    errors: any[];
  }
}
