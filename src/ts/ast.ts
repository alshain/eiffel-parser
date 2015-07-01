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
    if (es == null) {
      return null;
    }
    return <E[]> <any> es.map(function (ast) {
      if (ast == null) {
        return null;
      }
      return ast.deepClone();
    });
  }

  function deepClone(e) {
    if (e == null) {
      return null;
    }
    else {
      return e.deepClone();
    }
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
      return new Identifier(this.name, deepClone(this.start), deepClone(this.end));
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
      return new Token(this.text, deepClone(this.start), deepClone(this.end));
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
      creationClauses: CreationClause[],
      featureLists: FeatureList[],
      start,
      end
    ) {
      super(this);
      this.name = name;
      this.deferred = deferred;
      this.frozen = frozen;
      this.expanded = expanded;
      this.children.push(name, deferred, frozen, expanded);

      this.parentGroups = parentGroups;
      Array.prototype.push.apply(this.children, parentGroups);

      this.genericParameters = generics;
      Array.prototype.push.apply(this.children, generics);

      this.creationClauses = creationClauses;
      Array.prototype.push.apply(this.children, creationClauses);

      this.featureLists = featureLists;
      Array.prototype.push.apply(this.children, featureLists);

      this.dictionary = new Map<any, eiffel.ast.AST[]>();

      this.start = start;
      this.end = end;
    }

    children:AST[];

    name:Identifier;
    deferred: Token;
    frozen: Token;
    expanded: Token;
    genericParameters: FormalGenericParameter[];
    parentGroups:ParentGroup[];
    creationClauses:CreationClause[];
    featureLists:FeatureList[];

    dictionary: Map<any, eiffel.ast.AST[]>;

    start: Pos;
    end: Pos;

    byType<T extends AST>(prototype: {new(): T;}): T[] {
      return <T[]> this.dictionary.get(prototype);
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vClass(this, arg);
    }

    duplicate() {
      return new Class(deepClone(this.name), deepClone(this.deferred),
        deepClone(this.frozen), deepClone(this.expanded), null,
        duplicateAll(this.parentGroups),
        duplicateAll(this.genericParameters),
        duplicateAll(this.creationClauses),
        duplicateAll(this.featureLists),
        deepClone(this.start),
        deepClone(this.end)
      );
    }
  }

  export class CreationClause extends AST implements VisitorAcceptor {
    clients: Identifier[];
    features: Identifier[];

    start: Pos;
    end: Pos;

    constructor(clients:eiffel.ast.Identifier[], features:eiffel.ast.Identifier[], start:eiffel.ast.Pos, end:eiffel.ast.Pos) {
      super(this);
      this.clients = clients;
      this.features = features;
      this.start = start;
      this.end = end;

      Array.prototype.push.apply(this.children, this.clients);
      Array.prototype.push.apply(this.children, this.features);

    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vCreationClause(this, arg);
    }

    deepClone() {
      return new CreationClause(duplicateAll(this.clients), duplicateAll(this.features), deepClone(this.start), deepClone(this.end))
    }
  }

  export class FormalGenericParameter extends AST implements VisitorAcceptor {
    name: Identifier;
    constraints: TypeConstraint[];
    creators: Identifier[];
    sym: eiffel.symbols.GenericParameterSymbol;


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
      return new FormalGenericParameter(deepClone(this.name), duplicateAll(this.constraints), duplicateAll(this.creators));
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
      return new TypeConstraint(deepClone(this.rt), deepClone(this.rename));
    }
  }

  export class FeatureList extends AST implements VisitorAcceptor {
    constructor(exports: Identifier[], features: Feature[], start: Pos, end: Pos) {
      super(this);
      this.exports = exports;
      Array.prototype.push.apply(this.children, exports);
      this.features = features;
      Array.prototype.push.apply(this.children, features);

      this.start = start;
      this.end = end;
    }

    exports:Identifier[];
    features:Feature[];

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vFeatureList(this, arg);
    }

    deepClone() {
      return new FeatureList(duplicateAll(this.exports), duplicateAll(this.features), deepClone(this.start), deepClone(this.end));
    }
  }

  export class IdentifierAccess extends AST implements Expression {
    constructor(identifier: Identifier) {
      super(this);
      this.identifier = identifier;
      this.start = identifier.start;
      this.end = identifier.end;

      this.children.push(this.identifier);
    }
    identifier:eiffel.ast.Identifier;
    start: Pos;
    end: Pos;

    sym: TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vIdentifierAccess(this, arg);
    }

    deepClone() {
      return new IdentifierAccess(deepClone(this.identifier));
    }
  }

  export interface Feature extends AST, VisitorAcceptor {
    frozenNamesAndAliases: FrozenNameAlias[];
    rawType: Type;
  }

  export class ExtendedFeatureName extends AST implements VisitorAcceptor{
    constructor(name:eiffel.ast.Identifier, alias:eiffel.ast.Alias, start: Pos, end: Pos) {
      super(this);
      this.name = name;
      this.alias = alias;

      this.children.push(this.name, this.alias);

      this.start = start;
      this.end = end;
    }
    name: Identifier;
    alias: Alias;

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vExtendedFeatureName(this, arg);
    }

    deepClone() {
      return new ExtendedFeatureName(deepClone(this.name), deepClone(this.alias), deepClone(this.start), deepClone(this.end));
    }
  }

  // TODO Missing children for frozen and missing token
  // TOdo missing start & end
  export class FrozenNameAlias extends ExtendedFeatureName {
    constructor(name: eiffel.ast.Identifier, alias: eiffel.ast.Alias, frozen: Token, start: Pos, end: Pos) {
      super(name, alias, start, end);
      this.frozen = frozen;
    }

    frozen: Token;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vFrozenNameAlias(this, arg);
    }

    deepClone() {
      return new FrozenNameAlias(deepClone(this.name), deepClone(this.alias), deepClone(this.frozen), deepClone(this.start), deepClone(this.end));
    }
  }

  export class Routine extends AST implements Feature {
    constructor(frozenNamesAndAliases: FrozenNameAlias[], parameters: VarDeclList[], rawType: Type, bodyElements: AST[], start: Pos, end: Pos) {
      super(this);
      this.frozenNamesAndAliases = frozenNamesAndAliases;
      this.parameters = parameters;
      this.bodyElements = bodyElements;
      this.rawType = rawType;

      Array.prototype.push.apply(this.children, frozenNamesAndAliases);
      Array.prototype.push.apply(this.children, parameters);
      Array.prototype.push.apply(this.children, this.aliases);
      this.children.push(this.rawType);
      Array.prototype.push.apply(this.children, bodyElements);

      this.start = start;
      this.end = end;
    }

    rawType:eiffel.ast.Type;
    frozenNamesAndAliases: FrozenNameAlias[];
    parameters: VarDeclList[];
    sym: eiffel.symbols.RoutineSymbol;
    aliases: Alias[];
    bodyElements: AST[];

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vRoutine(this, arg);
    }

    deepClone() {
      return new Routine(duplicateAll(this.frozenNamesAndAliases), duplicateAll(this.parameters), deepClone(this.rawType), duplicateAll(this.bodyElements), deepClone(this.start), deepClone(this.end));
    }
  }

  export class LocalsBlock extends AST implements VisitorAcceptor {
    constructor(localToken: Token, linesOfVarDeclLists: VarDeclList[][], start: Pos, end: Pos) {
      super(this);
      this.localToken = localToken;
      this.children.push(this.localToken);
      this.linesOfVarDeclLists = linesOfVarDeclLists;
      this.varDeclLists = eiffel.util.flatten(linesOfVarDeclLists);
      Array.prototype.push.apply(this.children, this.varDeclLists);

      this.start = start;
      this.end = end;
    }

    localToken: Token;
    varDeclLists: VarDeclList[];
    linesOfVarDeclLists: VarDeclList[][];

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vLocalsBlock(this, arg);
    }

    deepClone() {
      return new LocalsBlock(deepClone(this.localToken), this.linesOfVarDeclLists.map(duplicateAll), deepClone(this.start), deepClone(this.end));
    }
  }


  export class VarDeclList extends AST implements VisitorAcceptor {
    constructor(varDecls: VarDeclEntry[], rawType: Type)  {
      super(this);
      this.varDecls = varDecls;
      this.rawType = rawType;
      varDecls.forEach((varDecl: VarDeclEntry) => {
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
      return new VarDeclList(duplicateAll(this.varDecls), deepClone(this.rawType));
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
      return new VarDeclEntry(deepClone(this.name));
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
      return new Type(deepClone(this.name), duplicateAll(this.parameters), this.detachable, deepClone(this.start), deepClone(this.end));
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
      return new TupleExpression(duplicateAll(this.expressions), deepClone(this.start), deepClone(this.end));
    }
  }

  export class NonObjectCall extends AST implements Expression {
    constructor(rt: eiffel.ast.Type, featureName: Identifier, start: Pos, end: Pos) {
      super(this);
      this.rt = rt;
      this.featureName = featureName;

      this.children.push(this.rt, this.featureName);

      this.start = start;
      this.end = end;
    }

    rt: Type;
    featureName: Identifier;
    sym: TypeInstance;

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vNonObjectCall(this, arg);
    }

    deepClone() {
      return new NonObjectCall(deepClone(this.rt), deepClone(this.featureName), deepClone(this.start), deepClone(this.end));
    }
  }

  export class TypeExpression extends AST implements Expression {
    constructor(rt: eiffel.ast.Type, start: Pos, end: Pos) {
      super(this);
      this.rt = rt;

      this.children.push(this.rt);

      this.start = start;
      this.end = end;
    }

    rt: Type;
    sym: TypeInstance;

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vTypeExpression(this, arg);
    }

    deepClone() {
      return new TypeExpression(deepClone(this.rt), deepClone(this.start), deepClone(this.end));
    }
  }

  export class Function extends Routine {
    sym: symbols.FunctionSymbol;
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vFunction(this, arg);
    }

    deepClone() {
      return new Function(duplicateAll(this.frozenNamesAndAliases), duplicateAll(this.parameters), deepClone(this.rawType), duplicateAll(this.bodyElements), deepClone(this.start), deepClone(this.end));
    }
  }

  export class Procedure extends Routine {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vProcedure(this, arg);
    }

    deepClone() {
      return new Procedure(duplicateAll(this.frozenNamesAndAliases), duplicateAll(this.parameters), null, duplicateAll(this.bodyElements), deepClone(this.start), deepClone(this.end));
    }
  }

  export class RoutineInstructions extends AST implements VisitorAcceptor {
    constructor(token: Token, instructions:eiffel.ast.Expression[], start: Pos, end: Pos) {
      super(this);
      this.instructions = instructions;
      this.start = start;
      this.end = end;
      this.token = token;
      this.children.push(token);
      Array.prototype.push.apply(this.children, this.instructions);
    }

    token: Token;
    instructions: Expression[];
    start: eiffel.ast.Pos;
    end: eiffel.ast.Pos;



    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      // Trick TypeScript compiler into accepting throw
      if (true) {
        console.error("Should not call this method, missing override in: " + this.constructor.name);
        debugger;
        throw new Error("Should not call this method, missing override in: " + this.constructor.name);
      }
      else {
        return null;
      }
    }
  }

  export class DoBlock extends RoutineInstructions {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vDoBlock(this, arg);
    }

    deepClone() {
      return new DoBlock(deepClone(this.token), duplicateAll(this.instructions), deepClone(this.start), deepClone(this.end));
    }
  }

  export class DeferredBlock extends RoutineInstructions {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vDeferredBlock(this, arg);
    }

    deepClone() {
      return new DeferredBlock(deepClone(this.token), duplicateAll(this.instructions), deepClone(this.start), deepClone(this.end));
    }

  }

  export class OnceBlock extends RoutineInstructions {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vOnceBlock(this, arg);
    }

    deepClone() {
      return new OnceBlock(deepClone(this.token), duplicateAll(this.instructions), deepClone(this.start), deepClone(this.end));
    }
  }

  export class ExternalBlock extends RoutineInstructions {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vExternalBlock(this, arg);
    }

    deepClone() {
      return new ExternalBlock(deepClone(this.token), duplicateAll(this.instructions), deepClone(this.start), deepClone(this.end));
    }
  }

  export class ObsoleteBlock extends RoutineInstructions {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vObsoleteBlock(this, arg);
    }

    deepClone() {
      return new ObsoleteBlock(deepClone(this.token), duplicateAll(this.instructions), deepClone(this.start), deepClone(this.end));
    }
  }

  export class ConditionBlock extends AST implements VisitorAcceptor {
    constructor(t1: Token, t2: Token, conditions: eiffel.ast.Condition[], start: Pos, end: Pos) {
      super(this);
      this.conditions = conditions;
      this.start = start;
      this.end = end;
      Array.prototype.push.apply(this.children, this.conditions);
    }

    conditions: Condition[];
    start: Pos;
    end: Pos;
    token: Token;
    token2: Token;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      // trick TypeScript compiler into accepting throw
      if (true) {
        console.error("Should not call this method, missing override in: " + this.constructor.name);
        debugger;
        throw new Error("Should not call this method, missing override in: " + this.constructor.name);
      }
      else {
        return null;
      }
    }

  }

  export class PostconditionBlock extends ConditionBlock {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vPostconditionBlock(this, arg);
    }

    deepClone() {
      return new PostconditionBlock(deepClone(this.token), deepClone(this.token2), duplicateAll(this.conditions), deepClone(this.start), deepClone(this.end));
    }
  }

  export class PreconditionBlock extends ConditionBlock {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vPreconditionBlock(this, arg);
    }

    deepClone() {
      return new PreconditionBlock(deepClone(this.token), deepClone(this.token2), duplicateAll(this.conditions), deepClone(this.start), deepClone(this.end));
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
      return new Alias(deepClone(this.name), deepClone(this.start), deepClone(this.end));
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
      return new CurrentExpression(deepClone(this.start), deepClone(this.end));
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
      return new ResultExpression(deepClone(this.start), deepClone(this.end));
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
      return new AnchoredType(deepClone(this.expression));
    }
  }


  export class VarOrConstAttribute extends AST implements Feature {
    constructor(frozenNamesAndAliases: FrozenNameAlias[], rawType: Type, start: Pos, end: Pos) {
      super(this);
      this.frozenNamesAndAliases = frozenNamesAndAliases;
      this.rawType = rawType;
      Array.prototype.push.apply(this.children, frozenNamesAndAliases);
      this.children.push(rawType);

      this.start = start;
      this.end = end;
    }


    frozenNamesAndAliases: FrozenNameAlias[];
    rawType: eiffel.ast.Type;
    sym: eiffel.symbols.AttributeSymbol;

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vVarOrConstAttribute(this, arg);
    }

    deepClone() {
      return new VarOrConstAttribute(duplicateAll(this.frozenNamesAndAliases), deepClone(this.rawType), deepClone(this.start), deepClone(this.end));
    }
  }

  export class Attribute extends VarOrConstAttribute {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vAttr(this, arg);
    }
  }

  export class ConstantAttribute extends VarOrConstAttribute {
    constructor(frozenNamesAndAliases: FrozenNameAlias[], rawType: eiffel.ast.Type, value: eiffel.ast.ManifestConstant, start: Pos, end: Pos) {
      super(frozenNamesAndAliases, rawType, start, end);
      this.value = value;
      this.children.push(value);
    }

    value: ManifestConstant;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vConstantAttribute(this, arg);
    }

    deepClone() {
      return new ConstantAttribute(duplicateAll(this.frozenNamesAndAliases), deepClone(this.rawType), deepClone(this.value), deepClone(this.start), deepClone(this.end));
    }
  }

  export class ParentGroup extends AST implements VisitorAcceptor {
    constructor(conforming: eiffel.ast.Identifier, parents: eiffel.ast.Parent[], start: Pos, end: Pos) {
      super(this);

      this.conforming = conforming;
      this.parents = parents;
      this.children.push(conforming);
      Array.prototype.push.apply(this.children, parents);

      this.start = start;
      this.end = end;
    }

    conforming: Identifier;
    parents: Parent[];

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vParentGroup(this, arg);
    }

    deepClone() {
      return new ParentGroup(deepClone(this.conforming), duplicateAll(this.parents), deepClone(this.start), deepClone(this.end));
    }
  }

  type Adaption = Undefines | Redefines | Renames | Selects | NewExports;

  export class Parent extends AST implements VisitorAcceptor {
    constructor(rt: Type, adaptions: Adaption[], start: Pos, end: Pos) {
      super(this);
      this.rawType = rt;
      this.children.push(rt);

      this.adaptions = (adaptions == null) ? [] : adaptions;
      this.nullAdaptions = adaptions;
      Array.prototype.push.apply(this.children, adaptions);

      this.start = start;
      this.end = end;
    }

    rawType: Type;
    parentSymbol: sym.ParentSymbol;
    name:Identifier;
    adaptions: Adaption[];
    nullAdaptions: Adaption[];

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vParent(this, arg);
    }

    deepClone() {
      return new Parent(deepClone(this.rawType), duplicateAll(this.adaptions), deepClone(this.start), deepClone(this.end));
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
      return new Rename(deepClone(this.oldName), deepClone(this.newName));
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
      return new Redefines(deepClone(this.token), duplicateAll(this.identifiers));
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
      return new Selects(deepClone(this.token), duplicateAll(this.identifiers));
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
      return new NewExports(deepClone(this.token), duplicateAll(this.exportChangeset));
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
      return new Undefines(deepClone(this.token), duplicateAll(this.identifiers));
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
      return new CharLiteral(this.rawValue, deepClone(this.start), deepClone(this.end));
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
      return new BooleanLiteral(this.rawValue, deepClone(this.start), deepClone(this.end));
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
      return new IntLiteral(this.value + "", deepClone(this.start), deepClone(this.end));
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
      return new RealLiteral(this.rawValue, deepClone(this.start), deepClone(this.end));
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
      return new VoidLiteral(deepClone(this.start), deepClone(this.end));
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
      return new StringLiteral(this.rawValue, deepClone(this.start), deepClone(this.end));
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
      return new All(deepClone(this.allToken));
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
      return new Precondition(deepClone(this.label), deepClone(this.condition));
    }
  }

  export class Postcondition extends Condition implements VisitorAcceptor {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vPostcondition(this, arg);
    }

    deepClone() {
      return new Postcondition(deepClone(this.label), deepClone(this.condition));
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
      return new CheckInstruction(deepClone(this.expression));
    }
  }

  export class Invariantcondition extends Condition implements VisitorAcceptor {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vInvariantcondition(this, arg);
    }

    deepClone() {
      return new Invariantcondition(deepClone(this.label), deepClone(this.condition));
    }
  }


  export class SetterAssignment extends AST implements Instruction {
    constructor(token: Token, left:eiffel.ast.Expression, right:eiffel.ast.Expression, start: Pos, end: Pos) {
      super(this);
      this.token = token;
      this.children.push(token);

      this.left = left;
      this.right = right;
      this.children.push(left, right);

      this.start = start;
      this.end = end;
    }

    token: Token;

    left:Expression;
    right:Expression;
    sym:TypeInstance;

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vSetterAssignment(this, arg);
    }

    deepClone() {
      return new SetterAssignment(deepClone(this.token), deepClone(this.left), deepClone(this.right), deepClone(this.start), deepClone(this.end));
    }
  }

  export class SimpleAssignment extends AST implements Instruction {
    constructor(token: Token, left:eiffel.ast.Identifier, right:eiffel.ast.Expression, start: Pos, end: Pos) {
      super(this);
      this.token = token;
      this.children.push(token);

      this.left = left;
      this.right = right;
      this.children.push(left, right);

      this.start = start;
      this.end = end;
    }

    token: Token;

    left: Identifier;
    right:Expression;
    sym:TypeInstance;

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vSimpleAssignment(this, arg);
    }

    deepClone() {
      return new SimpleAssignment(deepClone(this.token), deepClone(this.left), deepClone(this.right), deepClone(this.start), deepClone(this.end));
    }
  }

  export class InvalidAssignment extends AST implements Instruction {
    constructor(token: Token, left:eiffel.ast.Expression, right:eiffel.ast.Expression, start: Pos, end: Pos) {
      super(this);
      this.token = token;
      this.children.push(token);

      this.left = left;
      this.right = right;
      this.children.push(left, right);

      this.start = start;
      this.end = end;
    }

    token: Token;

    left: Expression;
    right:Expression;
    sym:TypeInstance;

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vInvalidAssignment(this, arg);
    }

    deepClone() {
      return new InvalidAssignment(deepClone(this.token), deepClone(this.left), deepClone(this.right), deepClone(this.start), deepClone(this.end));
    }
  }

  export class CreateInstruction extends AST implements Instruction {

    constructor(target:eiffel.ast.Identifier, method:eiffel.ast.Identifier, arguments:eiffel.ast.Expression[], start: Pos, end: Pos) {
      super(this);
      this.target = target;
      this.method = method;
      this.arguments = arguments;

      this.children.push(target, method);
      Array.prototype.push.apply(this.children, arguments);

      this.start = start;
      this.end = end;
    }

    target:Identifier;
    method: Identifier;
    arguments: Expression[];
    sym:TypeInstance;

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vCreateInstruction(this, arg);
    }

    deepClone() {
      return new CreateInstruction(deepClone(this.target), deepClone(this.method), duplicateAll(this.arguments), deepClone(this.start), deepClone(this.end));
    }
  }

  export class CreateExpression extends AST implements Instruction {

    constructor(rawType: Type, method:eiffel.ast.Identifier, arguments:eiffel.ast.Expression[], start: Pos, end: Pos) {
      super(this);
      this.rawType = rawType;
      this.method = method;
      this.arguments = arguments;

      this.children.push(rawType, method);
      Array.prototype.push.apply(this.children, arguments);

      this.start = start;
      this.end = end;
    }

    rawType: Type;
    method: Identifier;
    arguments: Expression[];
    sym:TypeInstance;

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vCreateExpression(this, arg);
    }

    deepClone() {
      return new CreateExpression(deepClone(this.rawType), deepClone(this.method), duplicateAll(this.arguments), deepClone(this.start), deepClone(this.end));
    }
  }

  export interface Expression extends AST, VisitorAcceptor {
    sym: TypeInstance;
    deepClone: () => Expression;
  }

  export class AgentCall extends AST implements Expression {

    constructor(token: Token, callExpression: eiffel.ast.Expression, start: Pos, end: Pos) {
      super(this);
      this.token = token;
      this.callExpression = callExpression;
      this.start = start;
      this.end = end;

      this.children.push(callExpression);
    }

    token: Token;
    callExpression: Expression;
    sym: TypeInstance;

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vAgentCall(this, arg);
    }

    deepClone() {
      return new AgentCall(this.token, deepClone(this.callExpression), deepClone(this.start), deepClone(this.end));
    }
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
      return new UnaryOp(this.operator, deepClone(this.operand), deepClone(this.start), deepClone(this.end));
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
      if (end === undefined) {
        debugger;
      }

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
      return new BinaryOp(this.operator, deepClone(this.left), deepClone(this.right), deepClone(this.start), deepClone(this.end));
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
    constructor(operand:eiffel.ast.Expression, name:eiffel.ast.Identifier, parameters:eiffel.ast.Expression[], start: Pos, end: Pos) {
      super(this);
      this.operand = operand;
      this.name = name;
      this.parameters = parameters;

      this.children.push(name);
      Array.prototype.push.apply(this.children, parameters);

      // This is undefined when constructed by parser, because nesting is done after object initialization
      // Manually inserted in buildIndexArgTree
      if (operand) {
        this.children.push(operand);
      }

      this.start = start;
      this.end = end;
    }

    sym: TypeInstance;

    operand: Expression;
    name: Identifier;
    parameters: Expression[];

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vCallExpression(this, arg);
    }

    deepClone() {
      return new CallExpression(deepClone(this.operand), deepClone(this.name), duplicateAll(this.parameters), deepClone(this.start), deepClone(this.end));
    }
  }

  export class UnqualifiedCallExpression extends AST implements Expression, VisitorAcceptor {
    constructor(identifier: eiffel.ast.IdentifierAccess, parameters:eiffel.ast.Expression[], start: Pos, end: Pos) {
      super(this);
      this.identifier = identifier;
      this.parameters = parameters;

      this.children.push(this.identifier);
      Array.prototype.push.apply(this.children, parameters);

      this.start = start;
      this.end = end;
    }

    sym: TypeInstance;

    operand: Expression;
    identifier: IdentifierAccess;
    parameters: Expression[];

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vUnqualifiedCallExpression(this, arg);
    }

    deepClone() {
      return new UnqualifiedCallExpression(deepClone(this.identifier), duplicateAll(this.parameters), deepClone(this.start), deepClone(this.end));
    }
  }

  export class IndexExpression extends AST implements Expression, VisitorAcceptor {
    constructor(operand: eiffel.ast.Expression, arguments: eiffel.ast.Expression[], start: Pos, end: Pos) {
      super(this);
      this.operand = operand;
      this.arguments = arguments;

      this.children.push(operand);
      Array.prototype.push.apply(this.children, arguments);

      this.start = start;
      this.end = end;
    }

    operand: Expression;
    arguments: Expression[];

    sym: TypeInstance;

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vIndexExpression(this, arg);
    }

    deepClone() {
      return new IndexExpression(deepClone(this.operand), duplicateAll(this.arguments), deepClone(this.start), deepClone(this.end));
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
      return new AttachedExpression(deepClone(this.ofType), deepClone(this.expr), deepClone(this.newVar), deepClone(this.start), deepClone(this.end));
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
      return new FromLoop(duplicateAll(this.initializerBlock), deepClone(this.until), duplicateAll(this.loopBlock), deepClone(this.variant));
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
      return new IfElse(deepClone(this.condition), duplicateAll(this.thenBlock), duplicateAll(this.elseIfs), duplicateAll(this.elseBlock));
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
      return new ElseIf(deepClone(this.condition), duplicateAll(this.thenBlock));
    }
  }

  export class PrecursorCall extends AST implements Instruction {
    token: Token;
    parentQualifier: Identifier;
    arguments: Expression[];

    sym: TypeInstance;

    start: Pos;
    end: Pos;


    constructor(token:eiffel.ast.Token, parentQualifier:eiffel.ast.Identifier, arguments:eiffel.ast.Expression[], start:eiffel.ast.Pos, end:eiffel.ast.Pos) {
      super(this);
      this.token = token;
      this.parentQualifier = parentQualifier;
      this.arguments = arguments;
      this.start = start;
      this.end = end;

      this.children.push(token, parentQualifier);
      Array.prototype.push.apply(this.children, this.arguments);
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vPrecursorCall(this, arg);
    }

    deepClone() {
      return new PrecursorCall(deepClone(this.token), deepClone(this.parentQualifier), duplicateAll(this.arguments), deepClone(this.start), deepClone(this.end));
    }
  }

  export class TypeLike {

  }

  export class TypeLikeCurrent extends AST implements VisitorAcceptor{
    token: Token;
    current: CurrentExpression;
    constructor(token:eiffel.ast.Token, current:eiffel.ast.CurrentExpression) {
      super(this);
      this.token = token;
      this.current = current;

      this.children.push(token, current);

      this.start = this.token.start;
      this.end = this.current.end;
    }

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vTypeLikeCurrent(this, arg);
    }

    deepClone() {
      return new TypeLikeCurrent(deepClone(this.token), deepClone(this.current));
    }

  }

  export class TypeLikeFeature extends AST implements VisitorAcceptor{
    token: Token;
    typeName: Type;
    featureName: Identifier;

    constructor(token:eiffel.ast.Token, typeName: eiffel.ast.Type, featureName:eiffel.ast.Identifier) {
      super(this);
      this.token = token;
      this.typeName = typeName;
      this.featureName = featureName;

      this.children.push(token, typeName, featureName);

      this.start = this.token.start;
      this.end = this.featureName.end;
    }

    start: Pos;
    end: Pos;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vTypeLikeFeature(this, arg);
    }

    deepClone() {
      return new TypeLikeFeature(deepClone(this.token), deepClone(this.typeName), deepClone(this.featureName));
    }
  }

  export class AliasBlock extends AST implements VisitorAcceptor {
    token: Token;
    expression: Expression;

    start: Pos;
    end: Pos;

    constructor(token:eiffel.ast.Token, expression:eiffel.ast.Expression, start:eiffel.ast.Pos, end:eiffel.ast.Pos) {
      super(this);
      this.token = token;
      this.expression = expression;
      this.start = start;
      this.end = end;

      this.children.push(this.token, this.expression);
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vAliasBlock(this, arg);
    }

    deepClone() {
      return new AliasBlock(deepClone(this.token), deepClone(this.expression), deepClone(this.start), deepClone(this.end));
    }
  }

  export class Address extends AST implements Expression {
    constructor(variable: eiffel.ast.Identifier, start:eiffel.ast.Pos, end:eiffel.ast.Pos) {
      super(this);
      this.variable = variable;
      this.start = start;
      this.end = end;

      this.children.push(this.variable);
    }


    variable: Identifier;

    start: Pos;
    end: Pos;

    sym: TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vAddress(this, arg);
    }

    deepClone() {
      return new Address(deepClone(this.variable), deepClone(this.start), deepClone(this.end));
    }
  }

  export class InspectInstruction extends AST implements  Instruction{
    inspectToken: Token;
    condition: Expression;
    whens: WhenPart[];
    elseBlock: Instruction[];

    start: Pos;
    end: Pos;

    sym: TypeInstance;

    constructor(inspectToken:eiffel.ast.Token, condition: Expression, whens:eiffel.ast.WhenPart[], elseBlock:eiffel.ast.Instruction[], start:eiffel.ast.Pos, end:eiffel.ast.Pos) {
      super(this);
      this.inspectToken = inspectToken;
      this.condition = condition;
      this.whens = whens;
      this.elseBlock = elseBlock;
      this.start = start;
      this.end = end;

      this.children.push(inspectToken);
      Array.prototype.push.apply(this.children, whens);
      Array.prototype.push.apply(this.children, this.elseBlock);
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vInspectInstruction(this, arg);
    }

    deepClone() {
      return new InspectInstruction(deepClone(this.inspectToken), deepClone(this.condition), duplicateAll(this.whens), duplicateAll(this.elseBlock), deepClone(this.start), deepClone(this.end));
    }
  }

  export class WhenPart extends AST implements VisitorAcceptor{
    whenToken: Token;
    choices: Identifier[];
    thenToken: Token;
    instructions: Instruction[];

    start: Pos;
    end: Pos;


    constructor(whenToken:eiffel.ast.Token, choices:eiffel.ast.Identifier[], thenToken: Token, instructions:eiffel.ast.Instruction[], start:eiffel.ast.Pos, end:eiffel.ast.Pos) {
      super(this);
      this.whenToken = whenToken;
      this.choices = choices;
      this.thenToken = thenToken;
      this.instructions = instructions;
      this.start = start;
      this.end = end;

      this.children.push(this.whenToken);
      Array.prototype.push.apply(this.children, this.choices);
      this.children.push(this.thenToken);
      Array.prototype.push.apply(this.children, this.instructions);
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vWhenPart(this, arg);
    }

    deepClone() {
      return new WhenPart(deepClone(this.whenToken), duplicateAll(this.choices), deepClone(this.thenToken), duplicateAll(this.instructions), deepClone(this.start), deepClone(this.end));
    }
  }

  export class Loop extends AST implements Instruction {
    loopElements: LoopElement[];
    endToken: Token;

    start: Pos;
    end: Pos;

    sym: TypeInstance;


    constructor(loopElements: eiffel.ast.LoopElement[], endToken: eiffel.ast.Token, start: eiffel.ast.Pos, end: eiffel.ast.Pos) {
      super(this);
      this.loopElements = loopElements;
      this.endToken = endToken;
      this.start = start;
      this.end = end;

      Array.prototype.push.apply(this.children, this.loopElements);
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vLoop(this, arg);
    }

    deepClone() {
      return new Loop(duplicateAll(this.loopElements), deepClone(this.endToken), deepClone(this.start), deepClone(this.end));
    }
  }

  export class LoopElement extends AST implements VisitorAcceptor {
    token: Token;

    start: Pos;
    end: Pos;

    constructor(token: eiffel.ast.Token, start: eiffel.ast.Pos, end: eiffel.ast.Pos) {
      super(this);
      this.token = token;
      this.start = start;
      this.end = end;
    }

    accept<A, R>(visitor: eiffel.ast.Visitor<A, R>, arg:A):R {
      return visitor.vLoopElement(this, arg);
    }
  }

  export class AcrossAs extends LoopElement {
    asToken: Token;
    expression: Expression;
    identifier: Identifier;


    constructor(token: eiffel.ast.Token, expression: eiffel.ast.Expression, asToken: eiffel.ast.Token, identifier: eiffel.ast.Identifier, start: eiffel.ast.Pos, end: eiffel.ast.Pos) {
      super(token, start, end);
      this.expression = expression;
      this.asToken = asToken;
      this.identifier = identifier;
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vAcrossAs(this, arg);
    }

    deepClone() {
      return new AcrossAs(deepClone(this.token), deepClone(this.expression), deepClone(this.asToken), deepClone(this.identifier), deepClone(this.start), deepClone(this.end));
    }
  }

  export class LoopFrom extends LoopElement{
    instructions: Instruction[];


    constructor(token: eiffel.ast.Token, instructions: eiffel.ast.Instruction[], start: eiffel.ast.Pos, end: eiffel.ast.Pos) {
      super(token, start, end);
      this.instructions = instructions;

      this.children.push(this.token);
      Array.prototype.push.apply(this.children, this.instructions);
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vLoopFrom(this, arg);
    }

    deepClone() {
      return new LoopFrom(deepClone(this.token), duplicateAll(this.instructions), deepClone(this.start), deepClone(this.end));
    }
  }

  export class LoopBody extends LoopElement {
    instructions: Instruction[];

    constructor(token: eiffel.ast.Token, instructions: Instruction[], start: eiffel.ast.Pos, end: eiffel.ast.Pos) {
      super(token, start, end);
      this.instructions = instructions;

      this.children.push(this.token);
      Array.prototype.push.apply(this.children, this.instructions);
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vLoopBody(this, arg);
    }

    deepClone() {
      return new LoopBody(deepClone(this.token), duplicateAll(this.instructions), deepClone(this.start), deepClone(this.end));
    }
  }

  export class AcrossSomeOrAll extends LoopElement{
    expression: Expression;


    constructor(token: eiffel.ast.Token, expression: eiffel.ast.Expression, start: eiffel.ast.Pos, end: eiffel.ast.Pos) {
      super(token, start, end);
      this.expression = expression;

      this.children.push(this.expression);
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      throw new Error("Called ACrossSomeOrAll.accept directly. This should not happen");
    }
  }

  export class AcrossSome extends AcrossSomeOrAll {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vAcrossSome(this, arg);
    }

    deepClone() {
      return new AcrossSome(deepClone(this.token), deepClone(this.expression), deepClone(this.start), deepClone(this.end));
    }
  }

  export class AcrossAll extends AcrossSomeOrAll {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vAcrossAll(this, arg);
    }

    deepClone() {
      return new AcrossAll(deepClone(this.token), deepClone(this.expression), deepClone(this.start), deepClone(this.end));
    }
  }

  export class LoopUntil extends LoopElement {
    expression: Expression;

    constructor(token: eiffel.ast.Token, expression: eiffel.ast.Expression, start: eiffel.ast.Pos, end: eiffel.ast.Pos) {
      super(token, start, end);
      this.expression = expression;

      this.children.push(this.token, this.expression);
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vLoopUntil(this, arg);
    }

    deepClone() {
      return new LoopUntil(deepClone(this.token), deepClone(this.expression), deepClone(this.start), deepClone(this.end));
    }
  }

  export class LoopVariant extends LoopElement {
    expression: Expression;

    constructor(token: eiffel.ast.Token, expression: eiffel.ast.Expression, start: eiffel.ast.Pos, end: eiffel.ast.Pos) {
      super(token, start, end);
      this.expression = expression;

      this.children.push(this.token, this.expression);
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vLoopVariant(this, arg);
    }

    deepClone() {
      return new LoopVariant(deepClone(this.token), deepClone(this.expression), deepClone(this.start), deepClone(this.end));
    }
  }

  export class LoopInvariant extends LoopElement {
    invariants: Invariantcondition[];


    constructor(token: eiffel.ast.Token, invariants: eiffel.ast.Invariantcondition[], start: eiffel.ast.Pos, end: eiffel.ast.Pos) {
      super(token, start, end);
      this.invariants = invariants;

      this.children.push(token);
      Array.prototype.push.apply(this.children, this.invariants);
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vLoopInvariant(this, arg);
    }

    deepClone() {
      return new LoopInvariant(deepClone(this.token), duplicateAll(this.invariants), deepClone(this.start), deepClone(this.end));
    }
  }

  export class DebugBlock extends AST implements Instruction {
    args: Expression[];
    instructions: Instruction[];

    start: Pos;
    end: Pos;

    sym: TypeInstance;


    constructor(args: eiffel.ast.Expression[], instructions: eiffel.ast.Instruction[], start: eiffel.ast.Pos, end: eiffel.ast.Pos) {
      super(this);
      this.args = args;
      this.instructions = instructions;
      this.start = start;
      this.end = end;
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vDebugBlock(this, arg);
    }

    deepClone() {
      return new DebugBlock(duplicateAll(this.args), duplicateAll(this.instructions), deepClone(this.start), deepClone(this.end));
    }
  }

  export class ManifestConstant extends AST implements VisitorAcceptor {
    type: Type;
    value: Literal<any>;

    start: Pos;
    end: Pos;


    constructor(type:eiffel.ast.Type, value:eiffel.ast.Literal<any>, start:eiffel.ast.Pos, end:eiffel.ast.Pos) {
      super(this);
      this.type = type;
      this.value = value;
      this.start = start;
      this.end = end;

      this.children.push(type, value);
    }

    deepClone() {
      return new ManifestConstant(deepClone(this.type), deepClone(this.value), deepClone(this.start), deepClone(this.end));
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vManifestConstant(this, arg);
    }
  }

  export class NoOp extends AST implements VisitorAcceptor {
    start: Pos;
    end: Pos;


    constructor(start:eiffel.ast.Pos, end:eiffel.ast.Pos) {
      super(this);
      this.start = start;
      this.end = end;
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vNoOp(this, arg);
    }

    deepClone() {
      return new NoOp(deepClone(this.start), deepClone(this.end));
    }
  }
}
