module eiffel.symbols {
  import LookupTable = eiffel.util.LookupTable;

    export class Symbol {

      constructor(name: string) {
        this.name = name;
        this.lowerCaseName = name.toLowerCase();
      }

      name: string;
      lowerCaseName: string;
    }

  export class FeatureSymbol extends Symbol {
    constructor(name:string, alias:string, isFrozen:boolean, ast: eiffel.ast.Feature) {
      super(name);
      this.alias = alias;
      this.isFrozen = isFrozen;
      this.ast = ast;
      this.isCommand = this.ast.rawType == null;
    }

    typeInstance: TypeInstance;

    ast: eiffel.ast.Feature;
    alias: string;
    isFrozen: boolean;
    isCommand: boolean;
  }

  export class RoutineSymbol extends FeatureSymbol {
    constructor(name: string, alias: string, frozen: boolean, ast:ast.Routine) {
      super(name, alias, frozen, ast);
    }

    locals: VariableSymbol[] = [];
    localsAndParamsByName: LookupTable<VariableSymbol> = new Map<string, VariableSymbol>();
    paramsInOrder: VariableSymbol[] = [];
    ast: ast.Routine;
  }

  export class FunctionSymbol extends RoutineSymbol {
    constructor(name: string, alias: string, frozen: boolean, ast:ast.Function) {
      super(name, alias, frozen, ast);
    }

    ast: ast.Function;
  }

  export class ProcedureSymbol extends RoutineSymbol {


    constructor(name:string, alias: string, frozen: boolean, ast:ast.Procedure) {
      super(name, alias, frozen, ast);
    }

    ast: ast.Procedure;
  }

  export class AttributeSymbol extends FeatureSymbol {

    constructor(name: string, alias: string, frozen: boolean, attr:ast.VarOrConstAttribute) {
      super(name, alias, frozen, attr);
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
    declaredFeatures: LookupTable<FeatureSymbol> = new Map<string, FeatureSymbol>();
    declaredFunctions: LookupTable<FunctionSymbol> = new Map<string, FunctionSymbol>();
    declaredProcedures: LookupTable<ProcedureSymbol> = new Map<string, ProcedureSymbol>();
    declaredRoutines: LookupTable<RoutineSymbol> = new Map<string, RoutineSymbol>();
    declaredAttributes: LookupTable<AttributeSymbol> = new Map<string, AttributeSymbol>();
    creationProcedures: LookupTable<ProcedureSymbol> = new Map<string, ProcedureSymbol>();
    inheritedFeatures: FeatureSymbol[] = [];
    possibleFinalFeatures: LookupTable<FeatureSymbol>;
    finalFeatures: LookupTable<FeatureSymbol> = new Map<string, FeatureSymbol>();

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
      if (this.declaredRoutines.has(lcName)) {
        return true;
      }
      if (this.declaredAttributes.has(lcName)) {
        return true;
      }
      return false;
    }

    resolveSymbol(name: string): FeatureSymbol {
      var lcName = name.toLowerCase();
      if (this.declaredRoutines.has(lcName)) {
        return this.declaredRoutines.get(lcName);
      }
      if (this.declaredAttributes.has(lcName)) {
        return this.declaredAttributes.get(lcName);
      }
      throw new Error("Symbol " + name + " does not exist in class " + this.name + ".");
    }
  }

  export class FinalFeature {
    name: string;
    originalName: string;
    source: TypeInstance;
  }

  export class TypeInstance {


    constructor(baseType: ClassSymbol, typeParameters: TypeInstance[], sourceClass: ClassSymbol) {
      this.baseType = baseType;
      this.typeParameters = typeParameters;
      this.sourceClass = sourceClass;
    }

    baseType: ClassSymbol;
    typeParameters: TypeInstance[];
    sourceClass: ClassSymbol;

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

      return new TypeInstance(substBaseSymbol, substTypeParams, this.sourceClass);
    }

    equals(other: TypeInstance) {
      if (this.baseType != other.baseType) {
        return false;
      }

      else {
        if (this.typeParameters.length != other.typeParameters.length) {
          throw new Error("Invalid State: both should have same amount of type parameters");
        }

        var isDifferent = false;
        this.typeParameters.forEach(function (typeParam, i) {
          if (typeParam.equals(other.typeParameters[i])) {
            isDifferent = true;
          }
        });

        return isDifferent;
      }
    }

    differentGenericDerivationThan(other: TypeInstance) {
      if (this.baseType != other.baseType) {
        return false;
      }

      else {
        if (this.typeParameters.length != other.typeParameters.length) {
          throw new Error("Invalid State: both should have same amount of type parameters");
        }

        var isDifferent = false;
        this.typeParameters.forEach(function (typeParam, i) {
          if (!typeParam.equals(other.typeParameters[i])) {
            isDifferent = true;
          }
        });

        return isDifferent;
      }
    }
  }
}
