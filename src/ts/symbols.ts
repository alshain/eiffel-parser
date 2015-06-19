module eiffel.symbols {
  import LookupTable = eiffel.util.LookupTable;

  function duplicate(arg) {
    if (arg != null) {
      return arg.duplicate();
    }
    else {
      return arg;
    }
  }

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
      this.isCommand = this.ast.rawType === null;
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
    pretenders: FeaturePretenders;

    typeInstance: ActualType;

    renamedFrom: FeatureSymbol = null;
    routineId: RoutineId = null;
    routineIds: Set<RoutineId> = new Set<RoutineId>();
    seeds: Set<FeatureSymbol> = new Set<FeatureSymbol>();
    precursors: Set<FeatureSymbol> = new Set<FeatureSymbol>();
    signature: Signature;
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

      sym.isDeferred = this.isDeferred;
      sym.typeInstance = this.typeInstance;
      sym.renamedFrom = this.renamedFrom;
      sym.routineId = this.routineId;
      sym.routineIds = this.routineIds;
      sym.seeds = this.seeds;
      sym.precursors = this.precursors;
      sym.signature = duplicate(this.signature);


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

      sym.isDeferred = this.isDeferred;
      sym.typeInstance = this.typeInstance;
      sym.renamedFrom = this.renamedFrom;
      sym.routineId = this.routineId;
      sym.routineIds = this.routineIds;
      sym.seeds = this.seeds;
      sym.precursors = this.precursors;
      sym.signature = duplicate(this.signature);

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
    constructor(name:string, ast:ast.VarDeclEntry, type: ActualType) {
      super(name, name);
      this.ast = ast;
      this.type = type;
    }

    ast: ast.VarDeclEntry;
    type: ActualType;
  }

  export class FinalFeature {
    implementation: FeatureSymbol;
  }

  export class PretenderSource {
    parentSymbol: ParentSymbol;
    feature: FeatureSymbol;
    wasUndefined: boolean;
    wasRedefined: boolean;
    wasSelected: boolean;
  }

  export class FeaturePretenders {
    effective: PretenderSource[];
    deferred: PretenderSource[];
    redefined: PretenderSource[];
    selected: PretenderSource[];


    constructor() {
      this.effective = [];
      this.deferred = [];
      this.redefined = [];
      this.selected = [];
    }

    all() {
      return this.effective.concat(this.deferred).concat(this.redefined);
    }
  }

  export class InheritedFeature {
    sourceFeature: FinalFeature;
    renamed: boolean;
    undefined: boolean;
    redefined: boolean;
  }

  export class FeatureCombination {
    inputs: InheritedFeature[];
    output: any;
  }

  export class ParentSymbol {

    constructor(ast: eiffel.ast.Parent, groupAst: ast.ParentGroup, parentType: eiffel.symbols.TypeInstance, owningClass: ClassSymbol) {
      this.ast = ast;
      this.groupAst = groupAst;
      this.parentType = parentType;
      this.isNonConforming = groupAst.conforming != null;
      this.owningClass = owningClass;
    }

    ast: ast.Parent;
    groupAst: ast.ParentGroup;
    isNonConforming: boolean;
    parentType: TypeInstance;
    owningClass: ClassSymbol;

    renames: eiffel.ast.Rename[] = [];
    undefines: eiffel.ast.Identifier[] = [];
    redefines: eiffel.ast.Identifier[] = [];
    selects: eiffel.ast.Identifier[] = [];

    toString() {
      return "Parent: " + this.ast.rawType;
    }

    inheritFeatures(): Map<string, FeatureSymbol> {
      var result = new Map<string, FeatureSymbol>();
      var finalFeatures = this.parentType.baseType.finalFeatures;
      finalFeatures.forEach((featureSymbol: FeatureSymbol, name) => {
        var duplicate = featureSymbol.duplicate();
        duplicate.substitutions = this.parentType.substitutions;
        result.set(name.toLowerCase(), duplicate);
      });

      return result;
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
    inheritedFeatures: Map<string, FeatureSymbol> = new Map<string, FeatureSymbol>();

    typeInstance: TypeInstance;

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
    arguments: ActualType[];
    returnType: ActualType;
    identity: Symbol;


    constructor(arguments: eiffel.symbols.ActualType[], returnType:eiffel.symbols.ActualType) {
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

    substitute(subst: Substitution): Signature {
      var substParamTypes: ActualType[] = this.arguments.map(x => x.substitute(subst));
      return new Signature(substParamTypes, subst.substitute(this.returnType));
    }

    duplicate(): Signature {
      var newRetType = duplicate(this.returnType);
      return new Signature(this.arguments.map(x => x.duplicate()), newRetType);
    }
  }

  /**
   * Type with kind *
   * Either a TypeInstance or a GenericParameterSymbol
   */
  export interface ActualType {
    hasFeatureWithName(name: string): boolean;

    canCallFeatureWith(name: string, argType: ActualType[]);
    callFeatureWith(name: string, argType: ActualType[]): ActualType;

    substitute(substitution: Substitution): ActualType;
    duplicate(): ActualType;
    equals(other: ActualType): boolean;

    toString(): string;
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

    featureWithName(name:string):eiffel.symbols.FeatureSymbol {
      return undefined;
    }

    canCallFeatureWith(name:string, argType:eiffel.symbols.ActualType[]) {
    }

    callFeatureWith(name:string, argType:eiffel.symbols.ActualType[]):eiffel.symbols.ActualType {
      return undefined;
    }

    duplicate(): GenericParameterSymbol {
      // This is a symbol whose identity is important.
      // It's basically immutable, so return same instance again.
      return this;
    }

    equals(other: ActualType) {
      return this === other;
    }

    toString(): string {
      return this.fullyQualifiedName;
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
      return;
    }

    duplicate(): Substitution {
      var result = new Substitution();
      this.substitutions.forEach((v, k) => {result.addSubstitution(k, v)});
      return result;
    }

    substitute(arg) {
      if (arg != null) {
        return arg.substitute(this);
      }
      else {
        return null;
      }
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
        this.repr += "[" + this.typeParameters.map(x => x.toString()).join(", ") + "]";
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

    featureWithName(name: string, client?: ClassSymbol) {
      if (this.hasFeatureWithName(name, client)) {
        //new FeatureInstance(this.baseType.f)
      }
    }

    hasFeatureWithName(name: string, client?: ClassSymbol): boolean {
      if (client === null) {
        return this.baseType.finalFeatures.has(name);
      }
      else {
        console.error("Client based feature availability not implemented");
        debugger;
      }
    }

    canCallFeatureWith(name: string, paramTypes: TypeInstance[], client?: ClassSymbol) {
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
    duplicate(): TypeInstance {
      return new TypeInstance(this.baseType, this.typeParameters.map(x => x.duplicate()), this.sourceClass, this.substitutions.duplicate());
    }
  }
}
