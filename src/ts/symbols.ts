module eiffel.symbols {
    export class Symbol {
        name: String;
    }

    export class RoutineSymbol extends Symbol {

    }

    export class FunctionSymbol extends RoutineSymbol {
      rawReturnType: eiffel.ast.Type;

    }

    export class ProcedureSymbol extends RoutineSymbol {
      rawReturnType: eiffel.ast.Type;
    }

    export class ClassSymbol extends Symbol {
      functions: LookupTable<FunctionSymbol> = {};
      procedures: LookupTable<ProcedureSymbol> = {};
    }
}
