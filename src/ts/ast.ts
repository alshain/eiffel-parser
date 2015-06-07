/// <reference path="visitor.ts" />
/// <reference path="../../typings/tsd.d.ts" />

module eiffel.ast {
  import sym = eiffel.symbols;
  import TypeInstance = sym.TypeInstance;
  import LookupTable = eiffel.util.LookupTable;

  export interface VisitorAcceptor extends AST {
    children: AST[];
    accept<A, R>(visitor:Visitor<A, R>, arg:A): R;
  }

  export class Source {
    fileName: string;
    clazz: Class;
    feature: Feature;
  }

  function duplicateAll<E extends AST>(es: E[]): E[] {
    return <E[]> <any> es.map(function (ast) {
      return ast.deepClone();
    });
  }

  export class AST {
    constructor(impl:VisitorAcceptor) {
      this._acceptor = impl;
      this.children = [];
    }

    children:AST[];
    source: Source;
    _acceptor:VisitorAcceptor;

    deepClone() {
      console.error("Should not call this method, missing override in: " + this.constructor.name);
      debugger;
    }
  }

  export class Identifier extends AST implements VisitorAcceptor {
    constructor(name:string, start:eiffel.ast.Pos, end:eiffel.ast.Pos) {
      super(this);

      this.name = name;
      this.start = start;
      this.end = end;
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vIdentifier(this, arg);
    }

    name:string;
    start:Pos;
    end:Pos;

    deepClone() {
      return new Identifier(this.name, this.start.deepClone(), this.end.deepClone());
    }
  }
  export class Token extends AST implements VisitorAcceptor {
    constructor(text:string, start: eiffel.ast.Pos, end: eiffel.ast.Pos) {
      super(this);
      this.text = text;
      this.start = start;
      this.end = end;
    }

    text: string;
    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vToken(this, arg);
    }

    deepClone() {
      return new Token(this.text, this.start.deepClone(), this.end.deepClone());
    }
  }

  export class Pos {
    constructor(offset) {
      this.offset = offset;
    }

    // Zero based index respective to start of input
    offset:number;
    // 1 based line number
    line:number;
    // 1 based column number
    column:number;

    deepClone() {
      return new Pos(this.offset);
    }
  }

  export class Class extends AST implements VisitorAcceptor {
    constructor(
      name: Identifier,
      deferred: Token,
      frozen: Token,
      expanded: Token,
      note: any, parentGroups: ParentGroup[],
      generics: FormalGenericParameter[],
      creationClause: Identifier[],
      featureLists: FeatureList[]
    ) {
      super(this);
      this.name = name;
      this.deferred = deferred;
      this.frozen = frozen;
      this.expanded = expanded;
      this.children.push(name);

      this.genericParameters = generics;
      this.parentGroups = parentGroups;
      Array.prototype.push.apply(this.children, parentGroups);

      this.creationClause = creationClause;
      Array.prototype.push.apply(this.children, creationClause);

      this.featureLists = featureLists;
      Array.prototype.push.apply(this.children, featureLists);

      this.dictionary = new Map<any, eiffel.ast.AST[]>();
    }

    children:AST[];

    name:Identifier;
    deferred: Token;
    frozen: Token;
    expanded: Token;
    genericParameters: FormalGenericParameter[];
    parentGroups:ParentGroup[];
    creationClause:Identifier[];
    featureLists:FeatureList[];

    dictionary: Map<any, eiffel.ast.AST[]>;

    byType<T extends AST>(prototype: {new(): T;}): T[] {
      return <T[]> this.dictionary.get(prototype);
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vClass(this, arg);
    }

    duplicate() {
      return new Class(this.name.deepClone(), this.deferred.deepClone(),
        this.frozen.deepClone(), this.expanded.deepClone(), null,
        duplicateAll(this.parentGroups),
        duplicateAll(this.genericParameters),
        duplicateAll(this.creationClause),
        duplicateAll(this.featureLists)
      );
    }
  }

  export class FormalGenericParameter extends AST implements VisitorAcceptor {
    name: Identifier;
    constraints: TypeConstraint[];
    creators: Identifier[];
    sym: eiffel.symbols.ClassSymbol;


    constructor(name:eiffel.ast.Identifier, constraints:eiffel.ast.TypeConstraint[], creators:eiffel.ast.Identifier[]) {
      super(this);
      this.name = name;
      this.constraints = constraints;
      this.creators = creators;


      this.children.push(name);
      Array.prototype.push.apply(this.children, constraints);
      Array.prototype.push.apply(this.children, creators);
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vFormalGenericParameter(this, arg);
    }

    deepClone() {
      return new FormalGenericParameter(this.name.deepClone(), duplicateAll(this.constraints), duplicateAll(this.creators));
    }
  }

  export class TypeConstraint extends AST implements VisitorAcceptor {
    constructor(rt:eiffel.ast.Type, rename:eiffel.ast.Rename) {
      super(this);
      this.rt = rt;
      this.rename = rename;

      this.children.push(rt, rename);
    }

    rt: Type;
    rename: Rename;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vTypeConstraint(this, arg);
    }

    deepClone() {
      return new TypeConstraint(this.rt.deepClone(), this.rename.deepClone());
    }
  }

  export class FeatureList extends AST implements VisitorAcceptor {
    constructor(exports: Identifier[], features: Feature[]) {
      super(this);
      this.exports = exports;
      Array.prototype.push.apply(this.children, exports);
      this.features = features;
      Array.prototype.push.apply(this.children, features);
    }

    exports:Identifier[];
    features:Feature[];

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vFeatureList(this, arg);
    }

    deepClone() {
      return new FeatureList(duplicateAll(this.exports), duplicateAll(this.features));
    }
  }

  export class IdentifierAccess extends AST implements Expression {
    constructor(identifier: Identifier) {
      super(this);
      this.identifier = identifier;
      this.start = identifier.start;
      this.end = identifier.end;
    }
    identifier:eiffel.ast.Identifier;
    start: Pos;
    end: Pos;

    sym: TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vIdentifierAccess(this, arg);
    }

    deepClone() {
      return new IdentifierAccess(this.identifier.deepClone());
    }
  }

  export interface Feature extends AST, VisitorAcceptor {
    frozenNamesAndAliases: FrozenNameAlias[];
    rawType: Type;
  }

  export class ExtendedFeatureName extends AST implements VisitorAcceptor{
    constructor(name:eiffel.ast.Identifier, alias:eiffel.ast.Alias) {
      super(this);
      this.name = name;
      this.alias = alias;
    }
    name: Identifier;
    alias: Alias;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vExtendedFeatureName(this, arg);
    }

    deepClone() {
      return new ExtendedFeatureName(this.name.deepClone(), this.alias.deepClone());
    }
  }

  export class FrozenNameAlias extends ExtendedFeatureName {
    constructor(name: eiffel.ast.Identifier, alias: eiffel.ast.Alias, frozen: boolean) {
      super(name, alias);
      this.frozen = frozen;
    }

    frozen: boolean;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vFrozenNameAlias(this, arg);
    }
  }

  export class Routine extends AST implements Feature {
    constructor(frozenNamesAndAliases: FrozenNameAlias[], parameters: VarDeclList[], rawType: Type, bodyElements: AST[]) {
      super(this);
      this.frozenNamesAndAliases = frozenNamesAndAliases;
      this.parameters = parameters;
      this.bodyElements = bodyElements;

      Array.prototype.push.apply(this.children, _.pluck(frozenNamesAndAliases, "name"));
      Array.prototype.push.apply(this.children, parameters);
      Array.prototype.push.apply(this.children, this.aliases);
      Array.prototype.push.apply(this.children, bodyElements);
    }

    rawType:eiffel.ast.Type;
    frozenNamesAndAliases: FrozenNameAlias[];
    parameters: VarDeclList[];
    sym: eiffel.symbols.RoutineSymbol;
    aliases: Alias[];
    bodyElements: AST[];

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vRoutine(this, arg);
    }

    deepClone() {
      return new Routine(duplicateAll(this.frozenNamesAndAliases), duplicateAll(this.parameters), this.rawType.deepClone(), duplicateAll(this.bodyElements));
    }
  }

  export class LocalsBlock extends AST implements VisitorAcceptor {
    constructor(linesOfVarDeclLists: VarDeclList[][]) {
      super(this);
      this.linesOfVarDeclLists = linesOfVarDeclLists;
      this.varDeclLists = _.flatten(linesOfVarDeclLists);
      Array.prototype.push.apply(this.children, this.varDeclLists);
    }

    varDeclLists: VarDeclList[];
    linesOfVarDeclLists: VarDeclList[][];

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vLocalsBlock(this, arg);
    }

    deepClone() {
      return new LocalsBlock(this.linesOfVarDeclLists.map(duplicateAll));
    }
  }


  export class External extends AST implements VisitorAcceptor {
    start: eiffel.ast.Pos;
    end: eiffel.ast.Pos;
    constructor(expressions: Expression[], start: Pos, end: Pos) {
      super(this);
      this.expressions = expressions;
      this.start = start;
      this.end = end;
    }

    expressions: Expression[];

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vExternal(this, arg);
    }

    deepClone() {
      return new External(duplicateAll(this.expressions), this.start.deepClone(), this.end.deepClone());
    }

  }

  export class Obsolete extends AST implements VisitorAcceptor {
    constructor(expression: Expression, start: Pos, end: Pos) {
      super(this);
      this.expression = expression;
      this.start = start;
      this.end = end;
    }

    expression: Expression;
    start: eiffel.ast.Pos;
    end: eiffel.ast.Pos;


    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vObsolete(this, arg);
    }

    deepClone() {
      return new Obsolete(this.expression, this.start.deepClone(), this.end.deepClone());
    }
  }

  export class VarDeclList extends AST implements VisitorAcceptor {
    constructor(varDecls: VarDeclEntry[], rawType: Type)  {
      super(this);
      this.varDecls = varDecls;
      this.rawType = rawType;
      varDecls.forEach(function (varDecl: VarDeclEntry) {
        varDecl.varDeclList = this;
      });
      Array.prototype.push.apply(this.children, varDecls);
      this.children.push(rawType);
    }

    rawType: Type;
    varDecls: VarDeclEntry[];

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vVarDeclList(this, arg);
    }

    deepClone() {
      return new VarDeclList(duplicateAll(this.varDecls), this.rawType.deepClone());
    }
  }

  export class VarDeclEntry extends AST implements VisitorAcceptor {

    constructor(name:eiffel.ast.Identifier) {
      super(this);
      this.name = name;
      this.children.push(name);
    }

    name: Identifier;
    varDeclList: VarDeclList;
    sym: symbols.VariableSymbol;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vVarDeclEntry(this, arg);
    }

    deepClone() {
      return new VarDeclEntry(this.name.deepClone());
    }
  }

  export class Type extends AST implements VisitorAcceptor {
    end: eiffel.ast.Pos;
    start : eiffel.ast.Pos;
    constructor(name: Identifier, parameters: Type[], detachable: boolean, start: Pos, end: Pos) {
      super(this);
      this.name = name;
      this.parameters = parameters;
      this.detachable = detachable;
      this.start = start;
      this.end = end;
      this.children.push(name);
      Array.prototype.push.apply(this.children, parameters);
    }

    name:Identifier;
    parameters:Type[];
    detachable: boolean;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vType(this, arg);
    }

    toString() {
      var text = this.name.name;
      if (this.parameters !== null) {
        text += "[" + this.parameters.join(", ") + "]";
      }
      return text;
    }

    deepClone() {
      return new Type(this.name.deepClone(), duplicateAll(this.parameters), this.detachable, this.start.deepClone(), this.end.deepClone());
    }
  }

  export class TupleExpression extends AST implements Expression {
    constructor(expressions: eiffel.ast.Expression[], start: Pos, end: Pos) {
      super(this);
      this.expressions = expressions;
      this.start = start;
      this.end = end;

      Array.prototype.push.apply(this.children, expressions);
    }

    expressions: Expression[];
    sym: TypeInstance;
    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vTupleExpression(this, arg);
    }

    deepClone() {
      return new TupleExpression(duplicateAll(this.expressions), this.start.deepClone(), this.end.deepClone());
    }
  }

  export class TypeExpression extends AST implements Expression {
    constructor(rt: eiffel.ast.Type) {
      super(this);
      this.rt = rt;
    }

    rt: Type;
    sym: TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vTypeExpression(this, arg);
    }

    deepClone() {
      return new TypeExpression(this.rt.deepClone());
    }
  }

  export class Function extends Routine {
    sym: symbols.FunctionSymbol;
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vFunction(this, arg);
    }

    deepClone() {
      return new Function(duplicateAll(this.frozenNamesAndAliases), duplicateAll(this.parameters), this.rawType.deepClone(), duplicateAll(this.bodyElements));
    }
  }

  export class Procedure extends Routine {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vProcedure(this, arg);
    }

    deepClone() {
      return new Procedure(duplicateAll(this.frozenNamesAndAliases), duplicateAll(this.parameters), null, duplicateAll(this.bodyElements));
    }
  }

  export class RoutineInstructions extends AST implements VisitorAcceptor {

    constructor(instructions:eiffel.ast.Expression[]) {
      super(this);
      this.instructions = instructions;
    }

    instructions: Expression[];

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vRoutineInstructions(this, arg);
    }
  }

  export class DoBlock extends RoutineInstructions {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vDoBlock(this, arg);
    }

    deepClone() {
      return new DoBlock(duplicateAll(this.instructions));
    }
  }

  export class DeferredBlock extends RoutineInstructions {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vDeferredBlock(this, arg);
    }

    deepClone() {
      return new DeferredBlock(duplicateAll(this.instructions));
    }

  }

  export class OnceBlock extends RoutineInstructions {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vOnceBlock(this, arg);
    }

    deepClone() {
      return new OnceBlock(duplicateAll(this.instructions));
    }

  }

  export class Alias extends AST implements VisitorAcceptor {
    name:eiffel.ast.StringLiteral;
    start:eiffel.ast.Pos;
    end:eiffel.ast.Pos;

    constructor(name: StringLiteral, start: Pos, end: Pos) {
      super(this);
      this.name = name;
      this.start = start;
      this.end = end;

      this.children.push(name);
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vAlias(this, arg);
    }

    deepClone() {
      return new Alias(this.name.deepClone(), this.start.deepClone(), this.end.deepClone());
    }
  }

  export class CurrentExpression extends AST implements Expression {
    constructor(pos: Pos, end: Pos) {
      super(this);
      this.start = pos;
      this.end = end;
    }

    start: Pos;
    end: Pos;

    sym: TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vCurrentExpr(this, arg);
    }

    deepClone() {
      return new CurrentExpression(this.start.deepClone(), this.end.deepClone());
    }
  }

  export class ResultExpression extends AST implements Expression {
    constructor(pos: Pos, end: Pos) {
      super(this);
      this.start = pos;
      this.end = end;
    }

    start: Pos;
    end: Pos;

    sym: TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vResultExpression(this, arg);
    }

    deepClone() {
      return new ResultExpression(this.start.deepClone(), this.end.deepClone());
    }
  }

  export class AnchoredType extends AST implements VisitorAcceptor {
    constructor(expression: Expression) {
      super(this);
      this.expression = expression;
    }

    expression: Expression;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vAnchoredType(this, arg);
    }

    deepClone() {
      return new AnchoredType(this.expression.deepClone());
    }
  }


  export class VarOrConstAttribute extends AST implements Feature {
    constructor(frozenNamesAndAliases: FrozenNameAlias[], rawType: Type) {
      super(this);
      this.frozenNamesAndAliases = frozenNamesAndAliases;
      this.rawType = rawType;
      Array.prototype.push.apply(this.children, _.pluck(frozenNamesAndAliases, "name"));
      this.children.push(rawType);
    }

    frozenNamesAndAliases: FrozenNameAlias[];
    rawType: eiffel.ast.Type;
    sym: eiffel.symbols.AttributeSymbol;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vVarOrConstAttribute(this, arg);
    }

    deepClone() {
      return new VarOrConstAttribute(duplicateAll(this.frozenNamesAndAliases), this.rawType.deepClone());
    }
  }

  export class Attribute extends VarOrConstAttribute {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vAttr(this, arg);
    }
  }

  export class ConstantAttribute extends VarOrConstAttribute {
    constructor(frozenNamesAndAliases: FrozenNameAlias[], rawType: eiffel.ast.Type, value: eiffel.ast.Literal<any>) {
      super(frozenNamesAndAliases, rawType);
      this.value = value;
      this.children.push(value);
    }

    value: Literal<any>

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vConstantAttribute(this, arg);
    }

    deepClone() {
      return new ConstantAttribute(duplicateAll(this.frozenNamesAndAliases), this.rawType.deepClone(), this.value.deepClone());
    }
  }

  export class ParentGroup extends AST implements VisitorAcceptor {
    constructor(conforming: eiffel.ast.Identifier, parents: eiffel.ast.Parent[]) {
      super(this);

      this.conforming = conforming;
      this.parents = parents;
      this.children.push(conforming);
      Array.prototype.push.apply(this.children, parents);
    }

    conforming: Identifier;
    parents: Parent[];

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vParentGroup(this, arg);
    }

    deepClone() {
      return new ParentGroup(this.conforming.deepClone(), duplicateAll(this.parents));
    }
  }

  type Adaption = Undefines | Redefines | Renames | Selects | NewExports;

  export class Parent extends AST implements VisitorAcceptor {
    constructor(rt: Type, adaptions: Adaption[]) {
      super(this);
      this.rawType = rt;
      this.children.push(rt);

      this.adaptions = (adaptions == null) ? [] : adaptions;
      this.nullAdaptions = adaptions;
      Array.prototype.push.apply(this.children, adaptions);
    }

    rawType: Type;
    parentSymbol: sym.ParentSymbol;
    name:Identifier;
    adaptions: Adaption[];
    nullAdaptions: Adaption[];

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vParent(this, arg);
    }

    deepClone() {
      return new Parent(this.rawType.deepClone(), duplicateAll(this.adaptions));
    }
  }

  export class Rename extends AST implements VisitorAcceptor {
    constructor(oldName:eiffel.ast.Identifier, newName: ExtendedFeatureName) {
      super(this);
      this.oldName = oldName;
      this.newName = newName;
    }

    oldName: Identifier;
    newName: ExtendedFeatureName;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vRename(this, arg);
    }

    deepClone() {
      return new Rename(this.oldName.deepClone(), this.newName.deepClone());
    }
  }

  export class Renames extends AST implements VisitorAcceptor {
    constructor(t: Token, renames:eiffel.ast.Rename[]) {
      super(this);
      this.token = t;
      this.renames = renames;
    }

    renames: Rename[];
    token: eiffel.ast.Token;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vRenames(this, arg);
    }
  }

  export class Redefines extends AST implements VisitorAcceptor {
    constructor(t: Token, identifiers:eiffel.ast.Identifier[]) {
      super(this);
      this.token = t;
      this.identifiers = identifiers;
    }

    identifiers: Identifier[];
    token: eiffel.ast.Token;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vRedefines(this, arg);
    }

    deepClone() {
      return new Redefines(this.token.deepClone(), duplicateAll(this.identifiers));
    }
  }

  export class Selects extends AST implements VisitorAcceptor {
    constructor(t: Token, identifiers:eiffel.ast.Identifier[]) {
      super(this);
      this.token = t;
      this.identifiers = identifiers;
    }

    identifiers: Identifier[];
    token: eiffel.ast.Token;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vSelects(this, arg);
    }

    deepClone() {
      return new Selects(this.token.deepClone(), duplicateAll(this.identifiers));
    }
  }

  export class ExportChangeset extends AST implements VisitorAcceptor {
    constructor(access:eiffel.ast.Identifier[], featureSet:eiffel.ast.Identifier[]) {
      super(this);
      this.access = access;
      this.featureSet = featureSet;
    }

    access: Identifier[];
    featureSet: Identifier[];

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vExportChangeset(this, arg);
    }

    deepClone() {
      return new ExportChangeset(duplicateAll(this.access), duplicateAll(this.featureSet));
    }
  }

  export class NewExports extends AST implements VisitorAcceptor {
    constructor(t: Token, exportChangeset: eiffel.ast.ExportChangeset[]) {
      super(this);
      this.token = t;
      this.exportChangeset = exportChangeset;
    }

    exportChangeset: eiffel.ast.ExportChangeset[];
    token: eiffel.ast.Token;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vNewExports(this, arg);
    }

    deepClone() {
      return new NewExports(this.token.deepClone(), duplicateAll(this.exportChangeset));
    }
  }

  export class Undefines extends AST implements VisitorAcceptor {

    constructor(t: Token, identifiers:eiffel.ast.Identifier[]) {
      super(this);
      this.token = t;
      this.identifiers = identifiers;
    }

    identifiers: Identifier[];
    token: eiffel.ast.Token;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vUndefines(this, arg);
    }

    deepClone() {
      return new Undefines(this.token.deepClone(), duplicateAll(this.identifiers));
    }
  }

  export class Literal<T> extends AST {
    constructor(vac: VisitorAcceptor, rawValue: string) {
      super(vac);
      this.rawValue = rawValue;
    }
    value: T;
    rawValue: string;
    end: eiffel.ast.Pos;
    start: eiffel.ast.Pos;

    deepClone() : Literal<T> {
      throw new Error("Should not call Literal<T>.deepClone() directly")
    }
  }

  export class CharLiteral extends Literal<string> implements VisitorAcceptor {
    constructor(value: string, start: Pos, end: Pos) {
      super(this, value);
      this.value = value;
      this.start = start;
      this.end = end;
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vCharLiteral(this, arg);
    }

    deepClone() {
      return new CharLiteral(this.rawValue, this.start.deepClone(), this.end.deepClone());
    }
  }

  export class BooleanLiteral extends Literal<boolean> implements VisitorAcceptor {
    constructor(value: string, start: Pos, end: Pos) {
      super(this, value);
      this.value = value.toLowerCase() === "true";
      this.start = start;
      this.end = end;
    }


    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vBooleanLiteral(this, arg);
    }

    deepClone() {
      return new BooleanLiteral(this.rawValue, this.start.deepClone(), this.end.deepClone());
    }
  }

  export class IntLiteral extends Literal<number> implements VisitorAcceptor {
    constructor(value: string, start: Pos, end: Pos) {
      super(this, value);
      this.value = parseInt(value);
      this.start = start;
      this.end = end;
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
        return visitor.vIntLiteral(this, arg);
    }

    deepClone() {
      return new IntLiteral(this.value + "", this.start.deepClone(), this.end.deepClone());
    }
  }

  export class RealLiteral extends Literal<number> implements VisitorAcceptor {
    constructor(value: string, start: Pos, end: Pos) {
      super(this, value);
      this.rawValue = value;
      this.value = parseFloat(value);
      this.start = start;
      this.end = end;
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vRealLiteral(this, arg);
    }

    deepClone() {
      return new RealLiteral(this.rawValue, this.start.deepClone(), this.end.deepClone());
    }
  }

  export class VoidLiteral extends Literal<any> implements VisitorAcceptor {
    constructor(start: Pos, end: Pos) {
      super(this, null);
      this.value = null;
      this.start = start;
      this.end = end;
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vVoidLiteral(this, arg);
    }

    deepClone() {
      return new VoidLiteral(this.start.deepClone(), this.end.deepClone());
    }
  }

  export class StringLiteral extends Literal<string> implements VisitorAcceptor{
    constructor(value: string, start: Pos, end: Pos) {
      super(this, value);
      this.value = value;
      this.start = start;
      this.end = end;
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vStringLiteral(this, arg);
    }

    deepClone() {
      return new StringLiteral(this.rawValue, this.start.deepClone(), this.end.deepClone());
    }
  }

  export class All extends AST implements VisitorAcceptor {
    constructor(allToken: eiffel.ast.Token) {
      super(this);
      this.allToken = allToken;
    }

    allToken: Token;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vAll(this, arg);
    }

    deepClone() {
      return new All(this.allToken.deepClone());
    }
  }

  export interface Instruction extends Expression {
  }

  export class Condition extends AST implements VisitorAcceptor {

    constructor(label: Identifier, condition: Expression) {
      super(this);
      this.condition = condition;
      this.label = label;
      this.children.push(label, condition);
    }

    condition:Expression;
    label:Identifier;

    accept<A, R>(visitor: Visitor<A, R>, arg:A):R {
      throw new Error("This should not be called");
    }

  }

  export class Precondition extends Condition implements VisitorAcceptor {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vPrecondition(this, arg);
    }

    deepClone() {
      return new Precondition(this.label.deepClone(), this.condition.deepClone());
    }
  }

  export class Postcondition extends Condition implements VisitorAcceptor {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vPostcondition(this, arg);
    }

    deepClone() {
      return new Postcondition(this.label.deepClone(), this.condition.deepClone());
    }
  }


  export class CheckInstruction extends AST implements Instruction {
    constructor(e: Expression) {
      super(this);
      this.expression = e;
    }

    expression: Expression;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vCheckInstruction(this, arg);
    }

    sym: eiffel.symbols.TypeInstance;

    deepClone() {
      return new CheckInstruction(this.expression.deepClone());
    }
  }

  export class Invariantcondition extends Condition implements VisitorAcceptor {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vInvariantcondition(this, arg);
    }
  }


  export class Assignment extends AST implements Instruction {

    constructor(left:eiffel.ast.Expression, right:eiffel.ast.Expression) {
      super(this);
      this.left = left;
      this.right = right;
      this.children.push(left, right);
    }

    left:Expression;
    right:Expression;
    sym:TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vAssignment(this, arg);
    }

    deepClone() {
      return new Assignment(this.left.deepClone(), this.right.deepClone());
    }
  }

  export class CreateInstruction extends AST implements Instruction {

    constructor(target:eiffel.ast.Identifier, method:eiffel.ast.Identifier, arguments:eiffel.ast.Expression[]) {
      super(this);
      this.target = target;
      this.method = method;
      this.arguments = arguments;

      this.children.push(target, method);
      Array.prototype.push.apply(this.children, arguments);
    }

    target:Identifier;
    method: Identifier;
    arguments: Expression[];
    sym:TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vCreateInstruction(this, arg);
    }

    deepClone() {
      return new CreateInstruction(this.target.deepClone(), this.method.deepClone(), duplicateAll(this.arguments));
    }
  }

  export class CreateExpression extends AST implements Instruction {

    constructor(rawType: Type, method:eiffel.ast.Identifier, arguments:eiffel.ast.Expression[]) {
      super(this);
      this.rawType = rawType;
      this.method = method;
      this.arguments = arguments;

      this.children.push(rawType, method);
      Array.prototype.push.apply(this.children, arguments);
    }

    rawType: Type;
    method: Identifier;
    arguments: Expression[];
    sym:TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vCreateExpression(this, arg);
    }

    deepClone() {
      return new CreateExpression(this.rawType.deepClone(), this.method.deepClone(), duplicateAll(this.arguments));
    }
  }

  export interface Expression extends AST, VisitorAcceptor {
    sym: TypeInstance;
    deepClone: () => Expression;
  }

  export class UnaryOp extends AST implements Expression {

    constructor(operator:eiffel.ast.UnaryOperator, operand:eiffel.ast.Expression, start: Pos, end: Pos) {
      super(this);
      this.operator = operator;
      this.operand = operand;
      this.start = start;
      this.end = end;

      this.children.push(operand);
    }

    operator:UnaryOperator;
    operand:Expression;
    sym:TypeInstance;

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vUnaryOp(this, arg);
    }

    deepClone() {
      return new UnaryOp(this.operator, this.operand.deepClone(), this.start.deepClone(), this.end.deepClone());
    }
  }

  export class BinaryOp extends AST implements Expression {

    constructor(operator: eiffel.ast.BinaryOperator, left: eiffel.ast.Expression, right:eiffel.ast.Expression, start: Pos, end: Pos) {
      super(this);
      this.operator = operator;
      this.left = left;
      this.right = right;
      this.start = start;
      this.end = end;

      this.children.push(left, right);
    }

    operator:BinaryOperator;
    left:Expression;
    right:Expression;

    start: Pos;
    end: Pos;

    sym:TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vBinaryOp(this, arg);
    }

    deepClone() {
      return new BinaryOp(this.operator, this.left.deepClone(), this.right.deepClone(), this.start.deepClone(), this.end.deepClone());
    }
  }


  export const enum UnaryOperator {
    Minus,
    Plus,
    Not,
    Old,
  }

  export const enum BinaryOperator {
    Minus,
    Plus,
    Multiplication,
    Division,
    IntegerDivision,
    Modulo,
    Exponential,
    DotDot,
    Identical,
    NotIdentical,
    IsEqual,
    NotIsEqual,
    LessThan,
    GreaterThan,
    LessOrEqual,
    GreaterOrEqual,
    And,
    AndThen,
    Or,
    OrElse,
    Xor,
    Implies,
  }

  var stringToUnaryOp:LookupTable<UnaryOperator> = new Map<string, UnaryOperator>([
    [<any>"-", UnaryOperator.Minus],
    [<any>"+", UnaryOperator.Plus],
    [<any>"not", UnaryOperator.Not],
    [<any>"old", UnaryOperator.Old],
  ]);


  var stringToBinaryOp:LookupTable<BinaryOperator> = new Map<string, BinaryOperator>([
    ["-", BinaryOperator.Minus],
    ["+", BinaryOperator.Plus],
    ["*", BinaryOperator.Multiplication],
    ["/", BinaryOperator.Division],
    ["//", BinaryOperator.IntegerDivision],
    ["\\\\", BinaryOperator.Modulo],
    ["^", BinaryOperator.Exponential],
    ["..", BinaryOperator.DotDot],
    ["=", BinaryOperator.Identical],
    ["/=", BinaryOperator.NotIdentical],
    ["~", BinaryOperator.IsEqual],
    ["/~", BinaryOperator.NotIsEqual],
    ["<", BinaryOperator.LessThan],
    [">", BinaryOperator.GreaterThan],
    ["<=", BinaryOperator.LessOrEqual],
    [">=", BinaryOperator.GreaterOrEqual],
    ["and", BinaryOperator.And],
    ["and then", BinaryOperator.AndThen],
    ["or", BinaryOperator.Or],
    ["or else", BinaryOperator.OrElse],
    ["xor", BinaryOperator.Xor],
    ["implies", BinaryOperator.Implies],
  ]);

  export class CallExpression extends AST implements Expression, VisitorAcceptor {
    constructor(operand:eiffel.ast.Expression, name:eiffel.ast.Identifier, parameters:eiffel.ast.Expression[]) {
      super(this);
      this.operand = operand;
      this.name = name;
      this.parameters = parameters;

      this.children.push(operand, name);
      Array.prototype.push.apply(this.children, parameters);
    }

    sym: TypeInstance;

    operand: Expression;
    name: Identifier;
    parameters: Expression[];

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vCallExpression(this, arg);
    }

    deepClone() {
      return new CallExpression(this.operand.deepClone(), this.name.deepClone(), duplicateAll(this.parameters));
    }
  }

  export class UnqualifiedCallExpression extends AST implements Expression, VisitorAcceptor {
    constructor(identifier: eiffel.ast.IdentifierAccess, parameters:eiffel.ast.Expression[]) {
      super(this);
      this.identifier = identifier;
      this.parameters = parameters;

      Array.prototype.push.apply(this.children, parameters);
    }

    sym: TypeInstance;

    operand: Expression;
    identifier: IdentifierAccess;
    parameters: Expression[];

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vUnqualifiedCallExpression(this, arg);
    }

    deepClone() {
      return new UnqualifiedCallExpression(this.identifier.deepClone(), duplicateAll(this.parameters));
    }
  }

  export class IndexExpression extends AST implements Expression, VisitorAcceptor {
    constructor(operand: eiffel.ast.Expression, argument: eiffel.ast.Expression) {
      super(this);
      this.operand = operand;
      this.argument = argument;

      this.children.push(operand, argument);
    }

    operand: Expression;
    argument: Expression;

    sym: TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vIndexExpression(this, arg);
    }

    deepClone() {
      return new IndexExpression(this.operand.deepClone(), this.argument.deepClone());
    }
  }

  export class AttachedExpression extends AST implements Expression, VisitorAcceptor {
    constructor(ofType: Type, expr: Expression, newVar: Identifier, start, end) {
      super(this);
      this.ofType = ofType;
      this.expr = expr;
      this.newVar = newVar;

      this.children.push(ofType, expr, newVar);
      this.start = start;
      this.end = end;
    }
    start: Pos;
    end: Pos;

    ofType: Type;
    expr: Expression;
    newVar: Identifier;

    sym: TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vAttachedExpression(this, arg);
    }

    deepClone() {
      return new AttachedExpression(this.ofType.deepClone(), this.expr.deepClone(), this.newVar.deepClone(), this.start.deepClone(), this.end.deepClone());
    }
  }

  export class FromLoop extends AST implements Instruction {
    constructor(initializerBlock: Instruction[], until: Expression, loopBlock: Instruction[], variant: Expression) {
      super(this);
      this.initializerBlock = initializerBlock;
      this.until = until;
      this.loopBlock = loopBlock;
      this.variant = variant;

      Array.prototype.push.apply(this.children, initializerBlock);
      this.children.push(until);
      Array.prototype.push.apply(this.children, loopBlock);
      this.children.push(variant);
    }

    initializerBlock:eiffel.ast.Instruction[];
    until:eiffel.ast.Expression;
    loopBlock:eiffel.ast.Instruction[];
    variant: eiffel.ast.Expression;

    sym: TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vFromLoop(this, arg);
    }

    deepClone() {
      return new FromLoop(duplicateAll(this.initializerBlock), this.until.deepClone(), duplicateAll(this.loopBlock), this.variant.deepClone());
    }
  }

  export class IfElse extends AST implements Instruction {
    constructor(condition: Expression, thenBlock: Instruction[], elseIfs: ElseIf[], elseBlock: Instruction[]) {
      super(this);
      this.condition = condition;
      this.thenBlock = thenBlock;
      this.elseIfs = elseIfs;
      this.elseBlock = elseBlock;

      this.children.push(condition);
      Array.prototype.push.apply(this.children, thenBlock);
      Array.prototype.push.apply(this.children, elseIfs);
      Array.prototype.push.apply(this.children, elseBlock);
    }

    condition:eiffel.ast.Expression;
    thenBlock:eiffel.ast.Instruction[];
    elseIfs:eiffel.ast.ElseIf[];
    elseBlock:eiffel.ast.Instruction[];
    sym: TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vIfElse(this, arg);
    }

    deepClone() {
      return new IfElse(this.condition.deepClone(), duplicateAll(this.thenBlock), duplicateAll(this.elseIfs), duplicateAll(this.elseBlock));
    }
  }

  export class ElseIf extends AST implements Instruction {
    constructor(condition: Expression, thenBlock: Instruction[]) {
      super(this);
      this.condition = condition;
      this.thenBlock = thenBlock;

      this.children.push(condition);
      Array.prototype.push.apply(this.children, thenBlock);
    }

    condition:eiffel.ast.Expression;
    thenBlock:eiffel.ast.Instruction[];

    sym: TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vElseIf(this, arg);
    }

    deepClone() {
      return new ElseIf(this.condition.deepClone(), duplicateAll(this.thenBlock));
    }

  }
}
