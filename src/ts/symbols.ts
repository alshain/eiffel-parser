module eiffel.symbols {
  import LookupTable = eiffel.util.LookupTable;

    export class EiffelSymbol {

      constructor(name: string, fullyQualifiedName: string) {
        this.name = name;
        this.fullyQualifiedName = fullyQualifiedName;
        this.lowerCaseName = name.toLowerCase();
      }

      name: string;
      fullyQualifiedName: string;
      lowerCaseName: string;

      setName(name: string) {
        this.name = name;
        this.lowerCaseName = name.toLowerCase();
      }

      toString() {
        return this.constructor.name + ": " + this.name;
      }
    }

  export class FeatureSymbol extends EiffelSymbol {
    constructor(name:string, alias:string, isFrozen:boolean, ast: eiffel.ast.Feature) {
      super(name, name);
      this.alias = alias;
      this.isFrozen = isFrozen;
      this.isDeferred = false;
      this.ast = ast;
      this.isCommand = this.ast.rawType == null;
      this.isAttribute = this instanceof AttributeSymbol;
      this.substitutions = new Substitution();
    }

    ast: eiffel.ast.Feature;
    alias: string;
    isFrozen: boolean;
    isDeferred: boolean;
    isCommand: boolean;
    isAttribute: boolean;
    substitutions: Substitution;

    typeInstance: TypeInstance;

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
    ast: ast.Routine;
  }

  export class FunctionSymbol extends RoutineSymbol {
    constructor(name: string, alias: string, frozen: boolean, ast:ast.Function) {
      super(name, alias, frozen, ast);
    }

    ast: ast.Function;

    duplicate() {
      var sym = new FunctionSymbol(this.name, this.alias, this.isFrozen, this.ast);

      sym.typeInstance = this.typeInstance;
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

      sym.typeInstance = this.typeInstance;
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

      sym.typeInstance = this.typeInstance;
      sym.renamedFrom = this.renamedFrom;
      sym.routineId = this.routineId;
      sym.routineIds = this.routineIds;
      sym.seeds = this.seeds;
      sym.precursors = this.precursors;

      return sym;
    }
  }

  export class VariableSymbol extends EiffelSymbol {
    constructor(name:string, ast:ast.VarDeclEntry, type: TypeInstance) {
      super(name, name);
      this.ast = ast;
    }

    ast: ast.VarDeclEntry;
    type: TypeInstance;
  }

  export class ParentSymbol {

    constructor(ast: eiffel.ast.Parent, groupAst: ast.ParentGroup, parentType: eiffel.symbols.TypeInstance) {
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

    inheritFeatures(): FeatureSymbol[] {
      var result = [];
      var finalFeatures = this.parentType.baseType.finalFeatures;
      finalFeatures.forEach(function (featureSymbol, name) {

      });
      return null;
    }

  }

  export class ClassSymbol extends EiffelSymbol {
    constructor(name:string, fullyQualifiedName: string, ast: ast.Class) {
      super(name, fullyQualifiedName);
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

    genericParametersInOrder: GenericParameterSymbol[] = [];
    genericParametersByName: LookupTable<GenericParameterSymbol> = new Map<string, GenericParameterSymbol>();

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

  /*export class FeatureInstance {
    baseFeature: FeatureSymbol;
    source: TypeInstance;
    signature: Signature;


    constructor(baseFeature:eiffel.symbols.FeatureSymbol, source:eiffel.symbols.TypeInstance, signature:eiffel.symbols.Signature) {
      this.baseFeature = baseFeature;
      this.source = source;
      this.signature = signature;

      var args = baseFeature.parameters.map(x => x.type.substitute(source));
      var retType = (baseFeature.isCommand) ? null : baseFeature.typeInstance.substitute(source);
      this.signature = new Signature(args, retType);
    }
  }*/

  export class Signature {
    arguments: TypeInstance[];
    returnType: TypeInstance;
    identity: Symbol;


    constructor(arguments: eiffel.symbols.TypeInstance[], returnType:eiffel.symbols.TypeInstance) {
      this.arguments = arguments;
      this.returnType = returnType;
      var sigString = this.arguments.map(x => x.toString()).join(", ");
      if (returnType !== null) {
        sigString += ": " + returnType.toString();
      }
      console.log(sigString);
      this.identity = Symbol.for(sigString);
    }

    equals(other: Signature) {
      var thisHasReturnType = this.returnType !== null;
      var otherHasReturnType = other.returnType !== null;
      if (thisHasReturnType !== otherHasReturnType) {
        return false;
      }

      if (thisHasReturnType && otherHasReturnType && !this.returnType.equals(other.returnType)) {
        return false;
      }

      if (this.arguments.length !== other.arguments.length) {
        return false;
      }

      var zipped = eiffel.util.zip(this.arguments, other.arguments);
      return _.every(zipped, (x_y) => x_y[0].equals(x_y[0]));
    }

    /**
     * VNCS, 8.14.4
     * @param other
     */
    conformsTo(other: Signature) {
      // VNCS_1
      if (this.arguments.length != other.arguments.length) {
        return false;
      }

      var zipped = eiffel.util.zip(this.arguments, other.arguments);
      var point_2 = true;
      zipped.forEach(function (t1__t2) {
        var bi = t1__t2[0];
        var ai = t1__t2[1];
        if (!bi.conformsTo(ai)) {
          point_2 = false;
        }
      });

    }
  }

  /**
   * Type with kind *
   * Either a TypeInstance or a GenericParameterSymbol
   */
  export interface ActualType {
    hasFeatureWithName(name: string): boolean;
    featureWithName(name: string): FeatureInstance;

    canCallFeatureWith(name: string, argType: ActualType[]);
    callFeatureWith(name: string, argType: ActualType[]): ActualType;

    substitute(substitution: Substitution): ActualType;

  }

  export class GenericParameterSymbol extends EiffelSymbol implements ActualType {
    substitute(substitution: eiffel.symbols.Substitution):eiffel.symbols.ActualType {
      return substitution.substituteTypeParam(this);
    }
    definingClass: ClassSymbol;


    constructor(name: string, fullyQualifiedName: string, definingClass: eiffel.symbols.ClassSymbol) {
      super(name, fullyQualifiedName);
      this.definingClass = definingClass;
    }

    hasFeatureWithName(name:string):boolean {
      return undefined;
    }

    featureWithName(name:string):eiffel.symbols.FeatureInstance {
      return undefined;
    }

    canCallFeatureWith(name:string, argType:eiffel.symbols.ActualType[]) {
    }

    callFeatureWith(name:string, argType:eiffel.symbols.ActualType[]):eiffel.symbols.ActualType {
      return undefined;
    }


  }


  export class Substitution {
    constructor() {
      this.substitutions = new Map<GenericParameterSymbol, ActualType>();
    }
    substitutions: Map<GenericParameterSymbol, ActualType>;

    newSubstituitionWith(modifications: Substitution) {
      var newSubs = new Map<GenericParameterSymbol, GenericParameterSymbol |TypeInstance>();
      this.substitutions.forEach(function (v, k) {
        if (v instanceof GenericParameterSymbol) {
          if (modifications.substitutions.has(v)) {
            newSubs.set(k, modifications.substitutions.get(v));
          }
          else {
            // include in new subs without modification
            newSubs.set(k, v);
          }
        }
        else {
          // Do nothing, there can't be a replacement for v in modifications
        }
      });
      return new Substitution();

    }

    substituteTypeParam(type: GenericParameterSymbol) {
      if (this.substitutions.has(type)) {
        return this.substitutions.get(type);
      }
      else {
        return type;
      }
    }

    addSubstitution(genericParam: GenericParameterSymbol, type: ActualType) {
      this.substitutions.set(genericParam, type);
    }

    hasSubstitutionFor(genericParam: GenericParameterSymbol): boolean {
      return
    }
  }

  export class TypeInstance implements ActualType {
    toString() {
      return this.repr;
    }
    constructor(baseType: ClassSymbol, typeParameters: ActualType[], sourceClass: ClassSymbol, substitution: Substitution) {
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
      this.substitutions = substitution;

      this.repr = this.baseType.fullyQualifiedName;
      if (this.typeParameters.length >= 1) {
        this.repr += "[" + _.pluck(this.typeParameters, "repr").join(", ") + "]";
      }

    }


    baseType: ClassSymbol;
    typeParameters: ActualType[];
    sourceClass: ClassSymbol;
    substitutions: Substitution;
    repr: string;

    /**
     * Performs generic substitution of a formal generic parameter with its corresponding type instance
     *
     * Returns type if it isn't a generic parameter
     */
    substitute(substitution: Substitution): TypeInstance {
      var substTypeParams = this.typeParameters.map(x => x.substitute(substitution));

      return new TypeInstance(this.baseType, <TypeInstance[]> substTypeParams, this.sourceClass, this.substitutions.newSubstituitionWith(substitution));
    }

    featureWithName(name: string, client: ClassSymbol) {
      if (this.hasFeatureWithName(name, client)) {
        //new FeatureInstance(this.baseType.f)
      }
    }

    hasFeatureWithName(name: string, client: ClassSymbol) {
      if (client === null) {
        return this.baseType.finalFeatures.has(name);
      }
      else {
        console.error("Client based feature availability not implemented");
        debugger;
      }
    }

    canCallFeatureWith(name: string, paramTypes: TypeInstance[], client: ClassSymbol) {
      if (!this.hasFeatureWithName(name, client)) {
        console.error("Feature " + name + " does not exist on " + this.baseType.fullyQualifiedName + " for client: " + client, client, "this", this);
        debugger;
        return false;
      }

      else {

      }
    }

    callFeatureWith(name:string, argType:eiffel.symbols.ActualType[]):eiffel.symbols.ActualType {
      return undefined;
    }

    typeForCall(name: string): ActualType {

      // this.baseType.finalFeatures.has(name)
      return null;
    }

    compatibleWith(other: TypeInstance, currentClass: TypeInstance): boolean {
      return this.conformsTo(other, currentClass) || this.convertsTo(other, currentClass);
    }

    conformsTo(other: TypeInstance, currentClass: TypeInstance): boolean {
      // TODO honor client restrictions
      return false;
    }

    convertsTo(other: TypeInstance, currentClass: TypeInstance): boolean {
      // TODO honor client restrictions
      return false;
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

    /*clone() {
      var clonedParameters = this.typeParameters.map(typeParam => typeParam.clone());

      return new TypeInstance(this.baseType, clonedParameters, this.sourceClass);
    }*/
  }
}
