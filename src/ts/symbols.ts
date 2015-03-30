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

      locals: VariableSymbol[] = [];
      localsAndParamsByName: LookupTable<VariableSymbol> = {};
      paramsInOrder: VariableSymbol[] = [];
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

  export class VariableSymbol extends Symbol {

    constructor(name:string, ast:ast.VarDeclEntry) {
      super(name);
      this.ast = ast;
    }

    ast: ast.VarDeclEntry;
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
    creationProcedures: LookupTable<ProcedureSymbol> = {};


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
        return this.routines[name];
      }
      if (this.attributes.hasOwnProperty(name)) {
        return this.attributes[name];
      }
      throw new Error("Symbol " + name + " does not exist in class " + this.name + ".");
    }
  }
}
