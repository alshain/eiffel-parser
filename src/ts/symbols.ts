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

  export class AttributeSymbol extends Symbol {

      attr: ast.VarOrConstAttribute;
  }

    export class ClassSymbol extends Symbol {


      constructor(name:string) {
        super();
        this.name = name;
      }

      name: string;

      functions: LookupTable<FunctionSymbol> = {};
      procedures: LookupTable<ProcedureSymbol> = {};
      attributes: LookupTable<AttributeSymbol> = {};


      hasSymbol(name: string): boolean {
        if (this.functions.hasOwnProperty(name)) {
          return true;
        }
        if (this.procedures.hasOwnProperty(name)) {
          return true;
        }
        if (this.attributes.hasOwnProperty(name)) {
          return true;
        }
        return false;
      }

      resolveSymbol(name: string): Symbol {
        if (this.functions.hasOwnProperty(name)) {
          return this.functions[name];
        }
        if (this.procedures.hasOwnProperty(name)) {
          return this.procedures[name];
        }
        if (this.attributes.hasOwnProperty(name)) {
          return this.attributes[name];
        }
        throw new Error("Symbol " + name + " does not exist in class " + this.name + ".");
      }
    }
}
