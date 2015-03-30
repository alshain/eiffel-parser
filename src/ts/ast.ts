/// <reference path="visitor.ts" />

module eiffel.ast {

  export interface VisitorAcceptor extends AST {
    children: AST[];
    accept<A, R>(visitor:Visitor<A, R>, arg:A): R;
  }

  export class AST {
    constructor(impl:VisitorAcceptor) {
      this._acceptor = impl;
      this.children = [];
    }

    children:AST[];
    _acceptor:VisitorAcceptor;
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
  }

  export class Pos {
    constructor(offset, line, column) {
      this.offset = offset;
      this.line = line;
      this.column = column;
    }

    // Zero based index respective to start of input
    offset:number;
    // 1 based line number
    line:number;
    // 1 based column number
    column:number;
  }

  export class Class extends AST implements VisitorAcceptor {
    constructor(
      name: Identifier,
      expanded: boolean,
      note: any, parents: Parent[],
      creationClause: Identifier[],
      featureLists: FeatureList[]
    ) {
      super(this);
      this.name = name;
      this.expanded = expanded;
      this.children.push(name);

      this.parents = parents;
      Array.prototype.push.apply(this.children, parents);

      this.creationClause = creationClause;
      Array.prototype.push.apply(this.children, creationClause);

      this.featureLists = featureLists;
      Array.prototype.push.apply(this.children, featureLists);
    }

    children:AST[];

    name:Identifier;
    expanded: boolean;
    parents:Parent[];
    creationClause:Identifier[];
    featureLists:FeatureList[];

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vClass(this, arg);
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

    sym:eiffel.ast.TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vIdentifierAccess(this, arg);
    }
  }

  export interface Feature extends AST, VisitorAcceptor {
    name: Identifier;
  }

  export class Routine extends AST implements Feature {
    constructor(name: Identifier, parameters: VarDeclList[], alias: Alias, rt: Type, preconditions: Precondition[], locals: VarDeclList[][], instructionKind: Token, instructions: Instruction[], postconditions: Postcondition[], frozen: boolean, external: External, obsolete: Obsolete) {
      super(this);
      this.name = name;
      this.parameters = parameters;
      this.alias = alias;
      this.preconditions = preconditions;
      this.locals = locals;
      this.instructionKind = instructionKind;
      this.instructions = instructions;
      this.postconditions = postconditions;
      this.frozen = frozen;
      this.external = external;
      this.obsolete = obsolete;

      this.children.push(name);
      Array.prototype.push.apply(this.children, parameters);
      this.children.push(alias);
      Array.prototype.push.apply(this.children, preconditions);
      Array.prototype.push.apply(this.children, locals);
      Array.prototype.push.apply(this.children, instructions);
      Array.prototype.push.apply(this.children, postconditions);
      this.children.push(external);
      this.children.push(obsolete);
    }

    name:Identifier;
    instructionKind: Token
    instructions:eiffel.ast.Instruction[];
    preconditions:Precondition[];
    locals: VarDeclList[][];
    postconditions:Postcondition[];
    parameters:VarDeclList[];
    sym: eiffel.symbols.RoutineSymbol;
    alias: Alias;
    frozen: boolean;
    external: External;
    obsolete: Obsolete;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vRoutine(this, arg);
    }
  }

  export class External extends AST implements VisitorAcceptor {
    constructor(expression: Expression, start: Pos, end: Pos) {
      super(this);
      this.expression = expression;
    }

    expression: Expression;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vExternal(this, arg);
    }

  }

  export class Obsolete extends AST implements VisitorAcceptor {
    constructor(expression: Expression, start: Pos, end: Pos) {
      super(this);
      this.expression = expression;
    }

    expression: Expression;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vObsolete(this, arg);
    }

  }

  export class VarDeclList extends AST implements VisitorAcceptor {
    constructor(varDecls: VarDeclEntry[], rawType: Type)  {
      super(this);
      this.varDecls = varDecls;
      this.rawType = rawType;
      varDecls.forEach(function (varDecl) {
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
  }

  export interface Token {
    text: string;
    start: Pos;
    end: Pos;
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
  }

  export class Function extends Routine {
    sym: symbols.FunctionSymbol;
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vFunction(this, arg);
    }
  }

  export class Procedure extends Routine {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vProcedure(this, arg);
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
  }


  export class VarOrConstAttribute extends AST implements Feature {
    constructor(name: Identifier, rawType: Type) {
      super(this);
      this.name = name;
      this.rawType = rawType;
      this.children.push(name, rawType);
    }

    name:Identifier;
    rawType:eiffel.ast.Type;
    sym: eiffel.symbols.AttributeSymbol;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vVarOrConstAttribute(this, arg);
    }
  }

  export class Attribute extends VarOrConstAttribute {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vAttr(this, arg);
    }
  }

  export class ConstantAttribute extends VarOrConstAttribute {
    constructor(name: eiffel.ast.Identifier, rawType: eiffel.ast.Type, value: eiffel.ast.Literal<any>) {
      super(name, rawType);
      this.value = value;
      this.children.push(value);
    }

    value: Literal<any>

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vConstantAttribute(this, arg);
    }
  }

  export class Parent extends AST implements VisitorAcceptor {
    constructor() {
      super(this);
    }

    name:Identifier;
    undefine:Identifier[];
    redefeine:Identifier[];
    rename:Identifier[];
    newexport:Identifier[] | All;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vParent(this, arg);
    }
  }

  export class Literal<T> extends AST {
    value: T;
    end: eiffel.ast.Pos;
    start: eiffel.ast.Pos;
  }

  export class CharLiteral extends Literal<string> implements VisitorAcceptor {
    constructor(value: string, start: Pos, end: Pos) {
      super(this);
      this.value = value;
      this.start = start;
      this.end = end;
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vCharLiteral(this, arg);
    }
  }

  export class BooleanLiteral extends Literal<boolean> implements VisitorAcceptor {
    constructor(value: boolean, start: Pos, end: Pos) {
      super(this);
      this.value = value;
      this.start = start;
      this.end = end;
    }


    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vBooleanLiteral(this, arg);
    }
  }

  export class IntLiteral extends Literal<number> implements VisitorAcceptor {
    constructor(value: number, start: Pos, end: Pos) {
      super(this);
      this.value = value;
      this.start = start;
      this.end = end;
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
        return visitor.vIntLiteral(this, arg);
      }
  }

  export class VoidLiteral extends Literal<any> implements VisitorAcceptor {
    constructor(start: Pos, end: Pos) {
      super(this);
      this.value = null;
      this.start = start;
      this.end = end;
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vVoidLiteral(this, arg);
    }
  }

  export class StringLiteral extends Literal<string> implements VisitorAcceptor{
    constructor(value: string, start: Pos, end: Pos) {
      super(this);
      this.value = value;
      this.start = start;
      this.end = end;
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vStringLiteral(this, arg);
    }
  }

  export class All {

  }

  export class ExportChangeSet extends AST implements VisitorAcceptor {
    constructor() {
      super(this);
    }

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vExportChangeSet(this, arg);
    }

    access:Identifier[];
    features:Identifier[];
  }

  export class TypeInstance {

  }

  export interface Instruction extends Expression, VisitorAcceptor {
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

  }

  export class Postcondition extends Condition implements VisitorAcceptor {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vPostcondition(this, arg);
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
  }

  export interface Expression extends AST, VisitorAcceptor {
    sym: TypeInstance;
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

  var stringToUnaryOp:LookupTable<UnaryOperator> = {
    "-": UnaryOperator.Minus,
    "+": UnaryOperator.Plus,
    "not": UnaryOperator.Not,
    "old": UnaryOperator.Old,
  };

  var stringToBinaryOp:LookupTable<BinaryOperator> = {
    "-": BinaryOperator.Minus,
    "+": BinaryOperator.Plus,
    "*": BinaryOperator.Multiplication,
    "/": BinaryOperator.Division,
    "//": BinaryOperator.IntegerDivision,
    "\\\\": BinaryOperator.Modulo,
    "^": BinaryOperator.Exponential,
    "..": BinaryOperator.DotDot,
    "=": BinaryOperator.Identical,
    "/=": BinaryOperator.NotIdentical,
    "~": BinaryOperator.IsEqual,
    "/~": BinaryOperator.NotIsEqual,
    "<": BinaryOperator.LessThan,
    ">": BinaryOperator.GreaterThan,
    "<=": BinaryOperator.LessOrEqual,
    ">=": BinaryOperator.GreaterOrEqual,
    "and": BinaryOperator.And,
    "and then": BinaryOperator.AndThen,
    "or": BinaryOperator.Or,
    "or else": BinaryOperator.OrElse,
    "xor": BinaryOperator.Xor,
    "implies": BinaryOperator.Implies,
  };

  export class CallExpression extends AST implements Expression, VisitorAcceptor {
    constructor(operand:eiffel.ast.Expression, name:eiffel.ast.Identifier, parameters:eiffel.ast.Expression[]) {
      super(this);
      this.operand = operand;
      this.name = name;
      this.parameters = parameters;

      this.children.push(operand, name);
      Array.prototype.push.apply(this.children, parameters);
    }

    sym:eiffel.ast.TypeInstance;

    operand: Expression;
    name: Identifier;
    parameters: Expression[];

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vCallExpression(this, arg);
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

    sym:eiffel.ast.TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vIndexExpression(this, arg);
    }
  }

  export class AttachedExpression extends AST implements Expression, VisitorAcceptor {
    constructor(ofType: Identifier, outerVar: IdentifierAccess, newVar: Identifier, start, end) {
      super(this);
      this.ofType = ofType;
      this.outerVar = outerVar;
      this.newVar = newVar;

      this.children.push(ofType, outerVar, newVar);
      this.start = start;
      this.end = end;
    }
    start: Pos;
    end: Pos;

    ofType: Identifier; outerVar:
    IdentifierAccess;
    newVar: Identifier;

    sym:eiffel.ast.TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vAttachedExpression(this, arg);
    }
  }

  export class FromLoop extends AST implements Instruction {
    constructor(initializerBlock: Instruction[], until: Expression, loopBlock: Instruction[]) {
      super(this);
      this.initializerBlock = initializerBlock;
      this.until = until;
      this.loopBlock = loopBlock;

      Array.prototype.push.apply(this.children, initializerBlock);
      this.children.push(until);
      Array.prototype.push.apply(this.children, loopBlock);
    }

    initializerBlock:eiffel.ast.Instruction[];
    until:eiffel.ast.Expression;
    loopBlock:eiffel.ast.Instruction[];

    sym: eiffel.ast.TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vFromLoop(this, arg);
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
    sym: eiffel.ast.TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vIfElse(this, arg);
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

    sym: eiffel.ast.TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vElseIf(this, arg);
    }

  }
}
