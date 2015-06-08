module eiffel.symbols {
  import LookupTable = eiffel.util.LookupTable;

    export class Symbol {

      constructor(name: string) {
        this.name = name;
        this.lowerCaseName = name.toLowerCase();
      }

      name: string;
      lowerCaseName: string;

      setName(name: string) {
        this.name = name;
        this.lowerCaseName = name.toLowerCase();
      }

      toString() {
        return this.constructor.name + ": " + this.name;
      }
    }

  export class FeatureSymbol extends Symbol {
    constructor(name:string, alias:string, isFrozen:boolean, ast: eiffel.ast.Feature) {
      super(name);
      this.alias = alias;
      this.isFrozen = isFrozen;
      this.isDeferred = false;
      this.ast = ast;
      this.isCommand = this.ast.rawType == null;
      this.isAttribute = this instanceof AttributeSymbol;
      this.identity = null;
    }

    ast: eiffel.ast.Feature;
    alias: string;
    isFrozen: boolean;
    isDeferred: boolean;
    isCommand: boolean;
    isAttribute: boolean;

    typeInstance: TypeInstance;

    identity: FeatureSymbol = null;
    renamedFrom: FeatureSymbol = null;
    routineId: RoutineId = null;
    routineIds: Set<RoutineId> = new Set<RoutineId>();
    seeds: Set<FeatureSymbol> = new Set<FeatureSymbol>();
    precursors: Set<FeatureSymbol> = new Set<FeatureSymbol>();
    parameters: VariableSymbol[] = [];
    parametersByName: Map<string, VariableSymbol> = new Map<string, VariableSymbol>();


    duplicate(): FeatureSymbol {
      console.error("Called duplicate on", this);
      if (true) {
        debugger;
        throw new Error("Duplicate has not been implemented");
      }

      return this;
    }

    hasSameSignature(other: FeatureSymbol) {
      console.error("Called duplicate on", this);
      if (true) {
        debugger;
        throw new Error("Duplicate has not been implemented");
      }

      return this;
    }
  }

  export class RoutineId {
    introducedBy: ClassSymbol;
    originalFeature: FeatureSymbol;
    version: Map<ClassSymbol, FeatureSymbol>;


    constructor(introducedBy:eiffel.symbols.ClassSymbol, originalFeature:eiffel.symbols.FeatureSymbol) {
      this.introducedBy = introducedBy;
      this.originalFeature = originalFeature;

      this.version = new Map<ClassSymbol, FeatureSymbol>();
      this.version.set(introducedBy, originalFeature);
    }
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

    duplicate() {
      var sym = new FunctionSymbol(this.name, this.alias, this.isFrozen, this.ast);
      sym.identity = this.identity;

      sym.typeInstance = this.typeInstance;
      sym.identity = this.identity;
      sym.renamedFrom = this.renamedFrom;
      sym.routineId = this.routineId;
      sym.routineIds = this.routineIds;
      sym.seeds = this.seeds;
      sym.precursors = this.precursors;

      return sym;
    }
  }

  export class ProcedureSymbol extends RoutineSymbol {
    constructor(name:string, alias: string, frozen: boolean, ast:ast.Procedure) {
      super(name, alias, frozen, ast);
    }

    ast: ast.Procedure;

    duplicate() {
      var sym = new ProcedureSymbol(this.name, this.alias, this.isFrozen, this.ast);
      sym.identity = this.identity;

      sym.typeInstance = this.typeInstance;
      sym.identity = this.identity;
      sym.renamedFrom = this.renamedFrom;
      sym.routineId = this.routineId;
      sym.routineIds = this.routineIds;
      sym.seeds = this.seeds;
      sym.precursors = this.precursors;

      return sym;
    }

    hasSameSignature(other: FeatureSymbol) {
      if (this.constructor !== other.constructor) {
        return null;
      }
      var otherProc = <ProcedureSymbol> other;


    }
  }

  export class AttributeSymbol extends FeatureSymbol {

    constructor(name: string, alias: string, frozen: boolean, attr:ast.VarOrConstAttribute) {
      super(name, alias, frozen, attr);
    }

    ast: ast.VarOrConstAttribute;

    duplicate() {
      var sym = new AttributeSymbol(this.name, this.alias, this.isFrozen, this.ast);
      sym.identity = this.identity;

      sym.typeInstance = this.typeInstance;
      sym.identity = this.identity;
      sym.renamedFrom = this.renamedFrom;
      sym.routineId = this.routineId;
      sym.routineIds = this.routineIds;
      sym.seeds = this.seeds;
      sym.precursors = this.precursors;

      return sym;
    }
  }

  export class VariableSymbol extends Symbol {

    constructor(name:string, ast:ast.VarDeclEntry) {
      super(name);
      this.ast = ast;
    }

    ast: ast.VarDeclEntry;
  }

  export class ParentSymbol {

    constructor(ast: eiffel.ast.Parent, groupAst:ast.ParentGroup, parentType:eiffel.symbols.TypeInstance) {
      this.ast = ast;
      this.groupAst = groupAst;
      this.parentType = parentType;
      this.isNonConforming = groupAst.conforming != null;
    }

    ast: ast.Parent;
    groupAst: ast.ParentGroup;
    isNonConforming: boolean;
    parentType: TypeInstance;

    renames: eiffel.ast.Rename[] = [];
    undefines: eiffel.ast.Identifier[] = [];
    redefines: eiffel.ast.Identifier[] = [];
    selects: eiffel.ast.Identifier[] = [];

    toString() {
      return "Parent: " + this.ast.rawType;
    }

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
    finalFeatures: LookupTable<FeatureSymbol> = new Map<string, FeatureSymbol>();

    routineIds: Map<FeatureSymbol, Map<ClassSymbol, FeatureSymbol>> = new Map<FeatureSymbol, Map<ClassSymbol, FeatureSymbol>>();

    ancestorTypes: TypeInstance[] = [];
    ancestorTypesByBaseType: Map<ClassSymbol, TypeInstance[]> = new Map<ClassSymbol, TypeInstance[]>();
    parentSymbols: ParentSymbol[] = [];

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

    toString() {
      var repr = this.name;
      if (this.genericParametersInOrder.length !== 0) {
        repr += "[";
        repr += this.genericParametersInOrder.map(x => x.name).join(", ");
        repr += "]";
      }
      return repr
    }
  }

  export class FinalFeature {
    name: string;
    originalName: string;
    source: TypeInstance;
  }

  export class TypeInstance {

    toString() {
      return this.repr;
    }
    constructor(baseType: ClassSymbol, typeParameters: TypeInstance[], sourceClass: ClassSymbol) {
      this.baseType = baseType;
      this.typeParameters = typeParameters;
      this.typeParameters.forEach(function (typeParam) {
        if (typeParam === undefined) {
          debugger;
        }
      });

      if (this.baseType instanceof TypeInstance) {
        debugger;
      }
      this.sourceClass = sourceClass;
      this.repr = this.baseType.name;
      if (this.typeParameters.length >= 1) {
        this.repr += "[" + _.pluck(this.typeParameters, "repr").join(", ") + "]";
      }
    }

    baseType: ClassSymbol;
    typeParameters: TypeInstance[];
    sourceClass: ClassSymbol;
    repr: string;

    /**
     * Performs generic substitution of a formal generic parameter with its corresponding type instance
     *
     * Returns type if it isn't a generic parameter
     */
    substitute(typeInstance: TypeInstance): TypeInstance {
      var substSymbol = (symbol: ClassSymbol) => {
        if (this.baseType.hasGenericParameterWithName(symbol.name)) {
          var formalGenericParam = this.baseType.genericParameterWithName(symbol.name);
          var indexOfGenericParam = this.baseType.genericParametersInOrder.indexOf(formalGenericParam);
          return this.typeParameters[indexOfGenericParam];
        }
        else {
          return symbol;
        }
      };

      var substBaseSymbol = substSymbol(typeInstance.baseType);
      var substTypeParams = typeInstance.typeParameters.map(this.substitute, this);

      if (substBaseSymbol instanceof TypeInstance) {
        if (substTypeParams.length >= 1) {
          throw new Error("Higher order polymorphism detected");
        }
        return substBaseSymbol;
      }
      else if (substBaseSymbol instanceof ClassSymbol) {
        return new TypeInstance(substBaseSymbol, <TypeInstance[]> substTypeParams, this.sourceClass);
      }
      else {
        console.error("This case should not happen", substBaseSymbol);
        debugger;
      }
    }

    equals(other: TypeInstance) {
      if (other == null) {
        return false;
      }
      
      if (this.baseType != other.baseType) {
        return false;
      }

      else {
        if (this.typeParameters.length != other.typeParameters.length) {
          throw new Error("Invalid State: both should have same amount of type parameters");
        }

        var isEqual = true;
        this.typeParameters.forEach(function (typeParam, i) {
          if (!typeParam.equals(other.typeParameters[i])) {
            isEqual = false;
          }
        });

        return isEqual;
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

    clone() {
      var clonedParameters = this.typeParameters.map(function (typeParam) {
        return typeParam.clone();
      });

      return new TypeInstance(this.baseType, clonedParameters, this.sourceClass);
    }
  }
}
