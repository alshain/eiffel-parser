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
    localsAndParamsByName: LookupTable<VariableSymbol> = new Map<string, VariableSymbol>();
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
    functions: LookupTable<FunctionSymbol> = new Map<string, FunctionSymbol>();
    procedures: LookupTable<ProcedureSymbol> = new Map<string, ProcedureSymbol>();
    routines: LookupTable<RoutineSymbol> = new Map<string, RoutineSymbol>();
    attributes: LookupTable<AttributeSymbol> = new Map<string, AttributeSymbol>();
    creationProcedures: LookupTable<ProcedureSymbol> = new Map<string, ProcedureSymbol>();
    hasCyclicInheritance: boolean = false;
    inheritsFromCyclicInheritance: boolean = false;

    isEffective: boolean;
    isExpanded: boolean;
    isFrozen: boolean;
    isDeferred: boolean;

    genericParametersInOrder: ClassSymbol[] = [];
    genericParametersByName: LookupTable<ClassSymbol> = new Map<string, ClassSymbol>();

    genericParameterWithName(name: string) {
      var lcName = name.toLowerCase();
      if (this.hasGenericParameterWithName(name)) {
        return this.genericParametersByName.get(lcName);
      }
      else {
        throw new Error("No Generic Parameter by name " + name + " in class " + this.name);
      }
    }

    hasGenericParameterWithName(name: string) {
      return this.genericParametersByName.has(name.toLowerCase());
    }



    hasSymbol(name: string): boolean {
      var lcName = name.toLowerCase();
      if (this.routines.has(lcName)) {
        return true;
      }
      if (this.attributes.has(lcName)) {
        return true;
      }
      return false;
    }

    resolveSymbol(name: string): Symbol {
      var lcName = name.toLowerCase();
      if (this.routines.has(lcName)) {
        return this.routines.get(lcName);
      }
      if (this.attributes.has(lcName)) {
        return this.attributes.get(lcName);
      }
      throw new Error("Symbol " + name + " does not exist in class " + this.name + ".");
    }
  }

  export class TypeInstance {

    constructor(baseType:eiffel.symbols.ClassSymbol, typeParameters:eiffel.symbols.TypeInstance[]) {
      this.baseType = baseType;
      this.typeParameters = typeParameters;
    }

    baseType: ClassSymbol;
    typeParameters: TypeInstance[];

    /**
     * Performs generic substitution of a formal generic parameter with its corresponding type instance
     *
     * Returns type if it isn't a generic parameter
     */
    substitute(typeInstance: TypeInstance): TypeInstance {
      var substSymbol = function(symbol: ClassSymbol): ClassSymbol {


        if (this.baseType.hasGenericParameterWithName(symbol.name)) {
          var typeParamIndex = this.baseType.genericParametersInOrder.indexOf(symbol);
          return this.typeParameters[typeParamIndex];
        }
        else {
          return symbol;
        }
      };

      var substBaseSymbol = substSymbol(typeInstance.baseType);
      var substTypeParams = typeInstance.typeParameters.map(this.substitute, this);

      return new TypeInstance(substBaseSymbol, substTypeParams);
    }
  }
}
