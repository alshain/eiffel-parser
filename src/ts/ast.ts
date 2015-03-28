/// reference path="visitor.ts"

module eiffel {

  export interface VisitorAcceptor extends AST {
    children: AST[];
    accept<A, R>(visitor:Visitor<A, R>, arg:A): R;
  }

  export class AST {
    constructor(impl:VisitorAcceptor) {
      this._acceptor = impl;
    }

    children:AST[];
    _acceptor:VisitorAcceptor;
  }

  export class Identifier extends AST implements VisitorAcceptor {
    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return undefined;
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
    constructor() {
      super(this);
    }

    children:AST[];

    name:Identifier;
    parents:Parent[];
    creationClause:CreationClause;
    featureLists:FeatureList[];

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vClass(this, arg);
    }
  }

  export class FeatureList extends AST implements VisitorAcceptor {
    constructor() {
      super(this);
    }

    exports:Identifier[];
    features:Feature[];

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vFeatureList(this, arg);
    }
  }

  export interface Feature extends AST, VisitorAcceptor {
    name: Identifier;
  }

  export interface Routine extends AST, Feature {
    preconditions: Precondition[];
    postconditions: Postcondition[];
    parameters: Parameter[];
    sym: RoutineSymbol;
  }

  export class Parameter extends AST implements VisitorAcceptor {
    constructor() {
      super(this);
    }

    name:Identifier;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vParameter(this, arg);
    }
  }

  export class Type extends AST implements VisitorAcceptor {
    constructor() {
      super(this);
    }

    name:Identifier;
    parameters:Type[];

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vType(this, arg);
    }
  }

  export class Function extends AST implements Routine {
    constructor() {
      super(this);
    }

    children:AST[];
    _acceptor:VisitorAcceptor;
    name:Identifier;
    preconditions:Precondition[];
    postconditions:Postcondition[];
    parameters:Parameter[];
    sym:FunctionSymbol;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vFunction(this, arg);
    }
  }

  export class CurrentExpression extends AST implements Expression {
    sym:eiffel.TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vCurrentExpr(this, arg);
    }
  }

  export class Procedure extends AST implements Routine {
    constructor() {
      super(this);
    }

    children:AST[];
    _acceptor:VisitorAcceptor;
    name:Identifier;
    preconditions:Precondition[];
    postconditions:Postcondition[];
    parameters:Parameter[];
    sym:RoutineSymbol;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vProcedure(this, arg);
    }
  }

  export class Attribute extends AST implements Feature {
    constructor() {
      super(this);
    }

    name:Identifier;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vAttr(this, arg);
    }
  }

  export class CreationClause extends AST implements Instruction, VisitorAcceptor {
    constructor(identifiers:Identifier[]) {
      super(this);
      this.features = identifiers;
    }

    features:Identifier[];

    sym:TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vCreationClause(this, arg);
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

  export class IfElse extends AST implements Instruction {
    condition:Expression[];
    then:Instruction[];
    otherwise:Instruction[];
    sym:TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vIfElse(this, arg);
    }
  }

  export class Condition extends AST {
    condition:Expression;
    label:Identifier;
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

  export class ForUntilInstruction extends AST implements Instruction {
    sym:TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vForUntil(this, arg);
    }

  }

  export class Assignment extends AST implements Instruction {
    sym:TypeInstance;
    left:Expression;
    right:Expression;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vAssignment(this, arg);
    }
  }

  export class CreateInstruction extends AST implements Instruction {
    sym:TypeInstance;
    target:Identifier;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vCreateInstruction(this, arg);
    }
  }

  export interface Expression extends AST, VisitorAcceptor {
    sym: TypeInstance;
  }

  export class UnaryOp extends AST implements Expression {
    operator:UnaryOperator;
    operand:Expression;
    sym:TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vUnaryOp(this, arg);
    }
  }

  export class BinaryOp extends AST implements Expression {
    operator:BinaryOperator;
    left:Expression;
    right:Expression;
    sym:TypeInstance;

    accept<A, R>(visitor:Visitor<A, R>, arg:A):R {
      return visitor.vBinaryOp(this, arg);
    }
  }


  const enum UnaryOperator {
    Minus,
    Plus,
    Not,
    Old,
  }

  const enum BinaryOperator {
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

  export interface LookupTable<V> {
    [name: string]: V
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

}
