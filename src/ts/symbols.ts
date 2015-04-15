module eiffel.symbols {
    export class Symbol {

      constructor(name: string) {
        this.name = name;
        this.lowerCaseName = name.toLowerCase();
      }

      name: string;
      lowerCaseName: string;
    }

  export class FeatureSymbol extends Symbol {
    constructor(name:string, alias:string, isFrozen:boolean) {
      super(name);
      this.alias = alias;
      this.isFrozen = isFrozen;
    }

    alias: string;
    isFrozen: boolean;
  }

    export class RoutineSymbol extends FeatureSymbol {
      constructor(name: string, alias: string, frozen: boolean, ast:ast.Routine) {
        super(name, alias, frozen);
        this.ast = ast;
      }

      locals: VariableSymbol[] = [];
      localsAndParamsByName: LookupTable<VariableSymbol> = {};
      paramsInOrder: VariableSymbol[] = [];
      ast: ast.Routine;
    }

    export class FunctionSymbol extends RoutineSymbol {
      constructor(name: string, alias: string, frozen: boolean, ast:ast.Function) {
        super(name, alias, frozen, ast);
        this.ast = ast;
      }

      ast: ast.Function;
    }

    export class ProcedureSymbol extends RoutineSymbol {


      constructor(name:string, alias: string, frozen: boolean, ast:ast.Procedure) {
        super(name, alias, frozen, ast);
        this.ast = ast;
      }

      ast: ast.Procedure;
    }

  export class AttributeSymbol extends FeatureSymbol {

    constructor(name: string, alias: string, frozen: boolean, attr:ast.VarOrConstAttribute) {
      super(name, alias, frozen);
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

    isEffective: boolean;
    isExpanded: boolean;
    isFrozen: boolean;
    isDeferred: boolean;


    hasSymbol(name: string): boolean {
      var lcName = name.toLowerCase();
      if (this.routines.hasOwnProperty(lcName)) {
        return true;
      }
      if (this.attributes.hasOwnProperty(lcName)) {
        return true;
      }
      return false;
    }

    resolveSymbol(name: string): Symbol {
      var lcName = name.toLowerCase();
      if (this.routines.hasOwnProperty(lcName)) {
        return this.routines[lcName];
      }
      if (this.attributes.hasOwnProperty(lcName)) {
        return this.attributes[lcName];
      }
      throw new Error("Symbol " + name + " does not exist in class " + this.name + ".");
    }
  }
}
