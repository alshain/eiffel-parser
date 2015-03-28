module eiffel {
    export interface Symbol {
        name: String;
    }

    export interface RoutineSymbol extends Symbol {

    }

    export interface FunctionSymbol extends RoutineSymbol {
        rawReturnType: Type;
    }

    export interface ClassSymbol extends Symbol {

    }
}
