module eiffel.symbols {
    export class Symbol {

      constructor(name: string) {
        this.name = name;
      }

      name: string;
    }

    export class RoutineSymbol extends Symbol {
      constructor(name: string, ast:ast.Routine) {
        super(name);
        this.ast = ast;
      }

      ast: ast.Routine;
    }

    export class FunctionSymbol extends RoutineSymbol {
      constructor(name: string, ast:ast.Function) {
        super(name, ast);
        this.ast = ast;
      }

      ast: ast.Function;
    }

    export class ProcedureSymbol extends RoutineSymbol {


      constructor(name:string, ast:ast.Procedure) {
        super(name, ast);
        this.ast = ast;
      }

      ast: ast.Procedure;
    }

  export class AttributeSymbol extends Symbol {

    constructor(name: string, attr:ast.VarOrConstAttribute) {
      super(name);
      this.ast = attr;
    }

    ast: ast.VarOrConstAttribute;
  }

  export class ClassSymbol extends Symbol {
    constructor(name:string, ast: ast.Class) {
      super(name);
      this.ast = ast;
    }

    ast: ast.Class;
    functions: LookupTable<FunctionSymbol> = {};
    procedures: LookupTable<ProcedureSymbol> = {};
    routines: LookupTable<RoutineSymbol> = {};
    attributes: LookupTable<AttributeSymbol> = {};


    hasSymbol(name: string): boolean {
      if (this.routines.hasOwnProperty(name)) {
        return true;
      }
      if (this.attributes.hasOwnProperty(name)) {
        return true;
      }
      return false;
    }

    resolveSymbol(name: string): Symbol {
      if (this.routines.hasOwnProperty(name)) {
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
