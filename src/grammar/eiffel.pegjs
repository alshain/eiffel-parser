// Fixme CONVERT syntax
{
  function isReserved(name) {
    return /^(agent|alias|all|and|as|assign|attribute|check|class|convert|create|Current|debug|deferred|do|detachable|else|elseif|end|ensure|expanded|export|external|False|feature|from|frozen|if|implies|inherit|inspect|invariant|like|local|loop|not|note|obsolete|old|once|only|or|Precursor|redefine|rename|require|rescue|Result|retry|select|separate|then|True|TUPLE|undefine|until|variant|Void|when|xor)$/.test(name);
  }

  function Node(nodeType, data) {
    this.nodeType = nodeType;
    for (var prop in data) {
      if (data.hasOwnProperty(prop)) {
        this[prop] = data[prop];
      }
    }
  }

  function _n(nodeType, data) {
    return new Node(nodeType, data);
  }

  function extractList(list, f) {
    var result = new Array(list.length), i;
    for (i = 0; i < list.length; i++) {
      result[i] = f(list[i]);
    }

    return result;
  }

  function currentExpression(pos) {
    return new eiffel.ast.CurrentExpression(pos);
  }

  function buildBinaryTree(left, rest, start, end) {
    return rest.reduce(
      function(left, kind__right) {
        return  new eiffel.ast.BinaryOp(
          kind__right.kind,
          left,
          kind__right.right,
          start,
          kind__right.end
        );
      },
      left
    );
  }

  function buildList(first, rest, f) {
      return [first].concat(extractList(rest, f));
  }

  function merge() {
    return Array.prototype.reduce.call(arguments, function(xs, x) { return xs.concat(x);});
  }

  function buildIndexArgTree(first, rest) {
    return rest.reduce(
      function(operand, operator) {
        operator.operand = operand;
        return operator;
      },
      first
    );
  }

  function gAttr(name) {
    return function (x) {
      return x[name];
    };
  }
  function gId() {
    return function (x) {
      return x;
    }
  }

  function optionalList(value) {
    return value !== null ? value : [];
  }
}
start = class*
class
  = w note:Note? expanded:(ExpandedToken W {return true} / {return false}) ClassToken name:ClassName inherit:inherit? create:create? convert:Convert? featureLists:FeatureList* Invariant? W EndToken w
    { return new eiffel.ast.Class(
        name,
        expanded,
        optionalList(note),
        optionalList(inherit),
        (create == null) ? [] : create,
        featureLists
      );
    }

Note = NoteToken p:NotePair+ W {return p;}
NotePair = W i:Identifier w ":" w v:NoteValue {return {key: i, value: v.value};}

NoteValue
  = StringLiteral
  / IntegerLiteral

ClassName = W name:Identifier { return name}
create = W CreateToken W first:Identifier rest:("," w id:Identifier { return id})* {return buildList(first, rest, gId())}
inherit = InheritanceClause+

InheritanceClause
  = W InheritToken c:(w "{" w i:(Identifier?) w "}" {return i;} / { return null; })? ps:Parent+
  {
    return _n("inheritance", {
      conforming: c,
      parents: ps,
    });
  }

Parent
  = w t:Type a:Adaptions?
  {
    return _n("parent", {
      type: t,
      undefine: (a === null) ? null : a.undefine,
      redefine: (a === null) ? null : a.redefine,
      rename: (a === null) ? null : a.rename,
      newexport: (a === null) ? null : a.newexport,
      select: (a === null) ? null : a.select,
    });
  }
/** FIXME: No backtracking, END of inheritance only mandatory if at least one rule fits */

Adaptions
  = undefine:InhUndefine redefine:InhRedefine? rename:InhRename? newexport:InhNewExports? select:InhSelect? W EndToken
  {
    return {
      undefine: undefine,
      redefine: redefine,
      rename: rename,
      newexport: newexport,
      select: select,
    };
  }
  / redefine:InhRedefine rename:InhRename? newexport:InhNewExports? select:InhSelect? W EndToken
  {
    return {
      undefine: [],
      redefine: redefine,
      rename: rename,
      newexport: newexport,
      select: select,
    };
  }
  / rename:InhRename newexport:InhNewExports? select:InhSelect? W EndToken
  {
    return {
      undefine: [],
      redefine: [],
      rename: rename,
      newexport: newexport,
      select: select,
    };
  }
  / newexport:InhNewExports select:InhSelect? W EndToken
  {
    return {
      undefine: [],
      redefine: [],
      rename: [],
      newexport: newexport,
      select: select,
    };
  }
  / select:InhSelect W EndToken
  {
    return {
      undefine: [],
      redefine: [],
      rename: [],
      newexport: [],
      select: select,
    };
  }

InhUndefine
  = W UndefineToken W l:IdentifierList { return l; }

InhRedefine
  = W RedefineToken W l:IdentifierList { return l; }

InhRename
  = W RenameToken W l:RenameList { return l; }

RenameList
  = first:(Identifier W AsToken W Identifier) rest:("," w id:(Identifier W AsToken W Identifier) { return id})* {return buildList(first, rest, gId())}

InhNewExports
  = W ExportToken es:ExportChangeset+ { return es; }

ExportChangeset
  = w "{" w cs:IdentifierList w "}" w fs:FeatureSet
  {
    return {
      access: cs,
      features: fs,
    };
  }

FeatureSet
  = IdentifierList
  / AllToken

InhSelect
  = "unimplemented"

Convert
  = W ConvertToken W ConvertList

ConvertList
  = first:ConvertListEntry rest:("," w id:ConvertListEntry { return id})* {return buildList(first, rest, gId())}


ConvertListEntry
  = Identifier w ":" w "{" w IdentifierList w "}"
  / Identifier w "(" w "{" w Identifier w "}" w ")"

FeatureList
  = W FeatureToken access:(w acc:AccessSpecifier { return acc })? fs:Feature*
    { return new eiffel.ast.FeatureList(
        optionalList(access),
        fs
      );
    }

Feature
  = W c:Constant {return c}
  / W f:Function {return f}
  / W p:Procedure {return p}
  / W a:Attribute {return a}

Function
  = start:pos h:RoutineHeader w ":" w rt:Type b:RoutineBody end:pos
  {
    return new eiffel.ast.Function(
      h.name,
      h.params,
      h.alias,
      rt,
      b.preconditions,
      b.locals,
      b.instructionKind,
      b.instructions,
      b.postconditions,
      h.frozen,
      b.obsolete
    );
  }

Procedure
  = start: pos h:RoutineHeader b:RoutineBody end:pos
  {
    return new eiffel.ast.Procedure(
      h.name,
      h.params,
      h.alias,
      null,
      b.preconditions,
      b.locals,
      b.instructionKind,
      b.instructions,
      b.postconditions,
      h.frozen,
      b.obsolete
    );
  }
// FIXME: Synonyms for routines
RoutineHeader
  = frozen:(FrozenToken W {return true} / { return false}) n:Identifier alias:Alias? p:(w "(" w ps:VarList? ")" {return ps;})?
  {
    return {
      name: n,
      alias: alias,
      frozen: frozen,
      params: optionalList(p)
    }
  }

Alias
  = W start:pos AliasToken w s:StringLiteral end:pos
  {
    return new eiffel.ast.Alias(s, start, end);
  }

VarList
  = v:Vars vs:(w ";" w vi:Vars w { return vi; })* { return Array.prototype.concat.apply(v, vs)}

Vars
  = ids:IdentifierList w ":" w t:Type
  {
    var varDeclEntries = ids.map(function(id) {
      return new eiffel.ast.VarDeclEntry(id);
    });
    return new eiffel.ast.VarDeclList(varDeclEntries, t);
  }

Attribute
  =  n:Identifier  w ":" w t:Type
  {
    return new eiffel.ast.Attribute(
      n,
      t
    );
  }

Constant
  = a:Attribute w "=" l:Literal
  {
    return new eiffel.ast.ConstantAttribute(
      a,
      a.attributeType,
      l
    );
  }

RoutineBody
  = pre:Preconditions? l:Locals? o:Obsolete? W instructionKind:(ExternalToken / DoToken) instructions:InstructionSeq post:Postconditions? w EndToken
  {
    return {
      preconditions: optionalList(pre),
      locals: optionalList(l),
      instructionKind: instructionKind,
      instructions: optionalList(instructions),
      post: optionalList(post),
      obsolete: o,
    }
  }

Obsolete
  = W start:pos ObsoleteToken W e:Expression end:pos
  {
    return new eiffel.ast.Obsolete(e, start, end);
  }

Preconditions
  = W RequireToken c:Precondition* {return c;}

Postconditions
  = W EnsureToken c:Postcondition* {return c;}

Invariant
  = W InvariantToken c:Invariantcondition* {return c;}

Precondition
  = l:LabelledCondition
  {
    return new eiffel.ast.Precondition(l.name, l.expression);
  }

Postcondition
  = l:LabelledCondition
  {
    return new eiffel.ast.Postcondition(l.name, l.expression);
  }

Invariantcondition
  = l:LabelledCondition
  {
    return new eiffel.ast.Invariantcondition(l.name, l.expression);
  }


LabelledCondition
  = W l:ConditionLabel? e:Expression
  {
    return {
      name: l,
      expression: e,
    };
  }

ConditionLabel = i:Identifier w ":" w {return i;}

Locals = W LocalToken vs:VarLists { return vs; }
VarLists = vs:(W v:VarList {return v;})+ {return vs;}

InstructionSeq
  = (W i:Instruction rest:(ns:(Indent* LineTerminatorSequence w {return null;} / Indent* n:NoOp Indent* {return n;}) r:Instruction {if(ns) { return [ns, r]} else { return [ns]}})* {return merge([i], rest)})?
  // = (W i:Instruction rest:(ns:(Indent* LineTerminatorSequence w {return null;} / Indent* n:NoOp Indent* {return n;}) r:Instruction {if(ns) { return [ns, r]} else {})* {return buildList(i, rest, gId())})?

pos
  =
  {
    return new eiffel.ast.Pos(
      offset(),
      line(),
      column()
    );
  }

Instruction
  = NoOp
  / CreateInstr
  / AssignmentInstr
  / LoopInstr
  / IfInstr
  / AcrossInstr
  / Expression

NoOp = w ";"
  {
    return _n("noop", {});
  }


Expression
  = ImpliesExpr

ImpliesExpr
  = start:pos l:OrExpr rest:(w o:"implies" !IllegalAfterKeyword w r:OrExpr e:pos { return {kind: o, right:r, end:e}})* end:pos { return buildBinaryTree(l, rest, start, end)}

OrExpr
  = start:pos l:AndExpr rest:(w o:("or " w "else" { return "or else"} / "or") !IllegalAfterKeyword w r:AndExpr { return {kind: o, right:r}})* end:pos { return buildBinaryTree(l, rest, start, end)}

AndExpr
  = start:pos l:CompExpr rest:(w o:("and " w "then" { return "and then" } / "and") !IllegalAfterKeyword w r:CompExpr { return {kind: o, right:r}})* end:pos { return buildBinaryTree(l, rest, start, end)}

CompExpr
  = start:pos l:DotDotExpr rest:(w o:CompOperator w r:DotDotExpr { return {kind: o, right:r}})* end:pos { return buildBinaryTree(l, rest, start, end)}

DotDotExpr
  = start:pos l:BinPlusMinusExpr rest:(w o:".." !IllegalAfterKeyword w r:BinPlusMinusExpr { return {kind: o, right:r}})* end:pos { return buildBinaryTree(l, rest, start, end)}

CompOperator = ("=" / "/=" / "~" / "/~" / "<=" / ">=" / "<" / ">" )

BinPlusMinusExpr
  = start:pos l:BinMultExpr rest:(w o:("+" / "-" !("-") {return "-"}) w r:BinMultExpr { return {kind: o, right:r}})* end:pos { return buildBinaryTree(l, rest, start, end)}

BinMultExpr
  = start:pos l:ExponentExpr rest:(w o:("//" / "/" / "\\\\" / "*") w r:ExponentExpr { return {kind: o, right:r}})* end:pos { return buildBinaryTree(l, rest, start, end)}


ExponentExpr
  = start:pos l:UnaryExpr w k:"^" w r:ExponentExpr end:pos
    {
      return new eiffel.ast.BinaryOp(
        k,
        l,
        r,
        start,
        end
      );
    }
  / UnaryExpr

UnaryExpr
  = start:pos o:("-" !("-") {return "-"} / "+" {return "+"} / "not" !IllegalAfterKeyword) w u:UnaryExpr end:pos
    {
      return new eiffel.ast.UnaryOp(
        o,
        u,
        end,
        end
      );
    }
  / FactorExpr

Current
  = start:pos CurrentToken end:pos
    {
      return new eiffel.ast.CurrentExpression(start, end);
    }

FirstExpr
  = "(" w e:Expression w ")" { return e}
  / Current
  / start:pos ResultToken end:pos
    {
      return new eiffel.ast.ResultExpression(start, end);
    }
  / IdentifierAccess Args
  / IdentifierAccess
  / StringLiteral

FactorExpr
  = f:FirstExpr ops:(Index / Call)* { return buildIndexArgTree(f, ops)}
  / Literal

Index
  = w "[" w a:ArgList w "]"
  {
    return new eiffel.ast.IndexExpression(
      undefined,
      optionalList(a)
    );
  }

Call
  = w "." w i:Identifier a:Args?
  {
    return new eiffel.ast.CallExpression(
      undefined,
      i,
      optionalList(a)
    );
  }

IdentifierAccess
  = i:Identifier
  {
    return new eiffel.ast.IdentifierAccess(i);
  }

IllegalAfterKeyword
  = Letter
  / DecimalDigit
  / "_"

Type
  = start:pos detachable:(DetachableToken W {return true} / {return false}) n:Identifier ts:(w "[" w g:TypeList w "]" {return g})? end:pos
  {
    return new eiffel.ast.Type(
      n,
      optionalList(ts),
      detachable,
      start,
      end
    );
  }
  / start:pos LikeToken W o:LikeOperand end:pos
  {
    return new eiffel.ast.Type();
  }

LikeOperand
  = Identifier
  / Current

TypeList
  = f:Type w rest:("," w t:Type w {return t})* {return buildList(f, rest, gId())}

LoopInstr
  = FromToken fromSeq:InstructionSeq W UntilToken W until:Expression W LoopToken is:InstructionSeq W EndToken
  {
    return new eiffel.ast.FromLoop(
      fromSeq,
      until,
      is
    );
  }

AcrossInstr
  = IfInstr


IfInstr
  = IfToken W c:Expression W ThenToken is:InstructionSeq ei:ElseIf? e:Else? W EndToken
  {
    return new eiffel.ast.IfElse(
      c,
      optionalList(is),
      optionalList(ei),
      optionalList(e)
    );
  }

Else
  = W ElseToken is:InstructionSeq { return is }

ElseIf = rest:(W ElseifToken W c:Expression W ThenToken is:InstructionSeq {return new eiffel.ast.ElseIf(c, optionalList(is));})+ {return rest}

AssignmentInstr
  = lhs:LeftHandSide w ":=" w rhs:Expression
  {
    return new eiffel.ast.Assignment(
      lhs,
      rhs
    );
  }


LeftHandSide
  = Expression

CreateInstr
  = CreateToken !(IllegalAfterKeyword) w t:ExplicitCreationType? n:Identifier m:CreationMethod?
  {
    return new eiffel.ast.CreateInstruction(
      n,
      (m ? m : "default_create"),
      m ? optionalList(m.args) : []
    );
  }

CreationMethod
  = CreationCall

CreationCall
  = "." n:Identifier as:Args?
  {
    return {
      name: n,
      args: optionalList(as)
    }
  }

Args
  = w "(" w r:ArgList? ")" {return optionalList(r)}

ArgList
  = first:Expression w rest:("," w r:Expression w {return r})* { return buildList(first, rest, gId())}

ExplicitCreationType
  = "{" w t:Identifier w "}"
  { return t }


AccessSpecifier
  = "{" w ids:IdentifierList w "}" {return ids;}

IdentifierList
  = first:Identifier rest:("," w id:Identifier { return id})* {return buildList(first, rest, gId())}

id "identifier" = [a-zA-Z][a-zA-Z0-9_]*

Indent = (" " / "\t")+

W "whitespace"
    = (" " / "\t" / "\n" / "\r" / ("--" (!(LineTerminatorSequence) .)*))+
w = W?

Identifier "identifier"
  = !ReservedWord name:IdentifierName
  {
    if (isReserved(name.name)) {
      expected("Identifier, Keyword " + name.name + " found");
    }
    return name;
  }

IdentifierStart
  = Letter

IdentifierPart
  = Letter
  / DecimalDigit
  / "_"

SourceCharacter
  = .

DecimalIntegerLiteral
  = "0"
  / NonZeroDigit DecimalDigit*
DecimalDigit
  = [0-9]
NonZeroDigit
  = [1-9]

LineTerminator
= [\n\r\u2028\u2029]
LineTerminatorSequence "end of line"
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"
Comment "comment"
  = SingleLineComment

SingleLineComment
  = "--" (!LineTerminator SourceCharacter)*

IntegerLiteral
  = start:pos DecimalIntegerLiteral end:pos {
    return new eiffel.ast.IntLiteral(parseFloat(text()), start, end);
  }

StringLiteral "string"
  = start:pos '"' chars:DoubleStringCharacter* '"' end:pos {
  return new eiffel.ast.StringLiteral(chars.join(""), start, end);
  }

CharLiteral "character"
  = start:pos "'" char:SingleStringCharacter "'" end:pos {
    return new eiffel.ast.StringLiteral(char, start, end);
  }
DoubleStringCharacter
  = !('"' / "%" / LineTerminator) SourceCharacter { return text(); }
  / "%" sequence:SourceCharacter { return "%" + sequence; }
  / LineContinuation
SingleStringCharacter
  = !("'" / "%" / LineTerminator) SourceCharacter { return text(); }
  / "%" sequence:SourceCharacter{ return "%" + sequence; }
  / LineContinuation
LineContinuation
  = "\\" LineTerminatorSequence { return ""; }
EscapeSequence
  = CharacterEscapeSequence
  / "0" !DecimalDigit { return "\0"; }
CharacterEscapeSequence
  = SingleEscapeCharacter
  / NonEscapeCharacter
SingleEscapeCharacter
  = "'"
  / "A" // {return "@";}
  / "B" // {return "\b";}
  / "C" // {return "$";}
  / "D" // {return "^";}
  / "F" // {return "\f";}
  / "H" // {return "\\";}
  / "L" // {return "~";}
  / "N" // {return "\n";}
  / "Q" // {return "`";}
  / "R" // {return "\r";}
  / "S" // {return "#";}
  / "T" // {return "\t";}
  / "U" // {return "\0";}
  / "V" // {return "|";}
  / "%" // {return "%";}
  / "'" // {return "'";}
  / '"' // {return '"';}
  / "(" // {return String.fromCharCode(91);}
  / ")" // {return String.fromCharCode(93);}
  / "<" // {return String.fromCharCode(123);}
  / ">" // {return String.fromCharCode(125);}

NonEscapeCharacter
= !(EscapeCharacter / LineTerminator) SourceCharacter { return text(); }

EscapeCharacter
  = SingleEscapeCharacter
  / DecimalDigit
  / "x"
  / "u"


Literal
  = start:pos r:VoidLiteral    end:pos !IllegalAfterKeyword { return new eiffel.ast.VoidLiteral(start, end);}
  / start:pos r:BooleanLiteral end:pos !IllegalAfterKeyword {return new eiffel.ast.BooleanLiteral(r, start, end);}
  / r:IntegerLiteral !IllegalAfterKeyword {return r;}
  / r:StringLiteral  !IllegalAfterKeyword {return r;}
  / r:CharLiteral  !IllegalAfterKeyword {return r;}

Letter
  = [a-z]
  / [A-Z]

IdentifierName "identifier"
  = start:pos first:IdentifierStart rest:IdentifierPart* end:pos {
    return new eiffel.ast.Identifier(
      first + rest.join(""),
      start,
      end
    );
}

ReservedWord
  = r:Keyword        !(IllegalAfterKeyword) { return r}
  / pos:pos r:VoidLiteral    !(IllegalAfterKeyword) { return r;}
  / r:BooleanLiteral !(IllegalAfterKeyword) { return r;}

VoidLiteral
  = VoidToken

BooleanLiteral
  = TrueToken { return true; }
  / FalseToken { return false; }



Keyword
  = AgentToken
  / AliasToken
  / AllToken
  / AndToken
  / AssignToken
  / AsToken
  / AttributeToken
  / CheckToken
  / ClassToken
  / ConvertToken
  / CreateToken
  / CurrentToken
  / DebugToken
  / DeferredToken
  / DoToken
  / DetachableToken
  / ElseifToken
  / ElseToken
  / EndToken
  / EnsureToken
  / ExpandedToken
  / ExportToken
  / ExternalToken
  / FalseToken
  / FeatureToken
  / FromToken
  / FrozenToken
  / IfToken
  / ImpliesToken
  / InheritToken
  / InspectToken
  / InvariantToken
  / LikeToken
  / LocalToken
  / LoopToken
  / NoteToken
  / NotToken
  / ObsoleteToken
  / OldToken
  / OnceToken
  / OnlyToken
  / OrToken
  / PrecursorToken
  / RedefineToken
  / RenameToken
  / RequireToken
  / RescueToken
  / ResultToken
  / RetryToken
  / SelectToken
  / SeparateToken
  / ThenToken
  / TrueToken
  / TUPLEToken
  / UndefineToken
  / UntilToken
  / VariantToken
  / VoidToken
  / WhenToken
  / XorToken

/* Tokens */

AgentToken = start:pos s:"agent" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
AliasToken = start:pos s:"alias" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
AllToken = start:pos s:"all" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
AndToken = start:pos s:"and" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
AssignToken = start:pos s:"assign" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
AsToken = start:pos s:"as" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
AttributeToken = start:pos s:"attribute" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
CheckToken = start:pos s:"check" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
ClassToken = start:pos s:"class" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
ConvertToken = start:pos s:"convert" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
CreateToken = start:pos s:"create" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
CurrentToken = start:pos s:"Current" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
DebugToken = start:pos s:"debug" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
DeferredToken = start:pos s:"deferred" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
DoToken = start:pos s:"do" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
DetachableToken = start:pos s:"detachable" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
ElseToken = start:pos s:"else" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
ElseifToken = start:pos s:"elseif" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
EndToken = start:pos s:"end" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
EnsureToken = start:pos s:"ensure" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
ExpandedToken = start:pos s:"expanded" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
ExportToken = start:pos s:"export" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
ExternalToken = start:pos s:"external" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
FalseToken = start:pos s:"False" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
FeatureToken = start:pos s:"feature" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
FromToken = start:pos s:"from" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
FrozenToken = start:pos s:"frozen" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
IfToken = start:pos s:"if" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
ImpliesToken = start:pos s:"implies" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
InheritToken = start:pos s:"inherit" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
InspectToken = start:pos s:"inspect" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
InvariantToken = start:pos s:"invariant" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
LikeToken = start:pos s:"like" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
LocalToken = start:pos s:"local" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
LoopToken = start:pos s:"loop" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
NotToken = start:pos s:"not" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
NoteToken = start:pos s:"note" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
ObsoleteToken = start:pos s:"obsolete" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
OldToken = start:pos s:"old" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
OnceToken = start:pos s:"once" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
OnlyToken = start:pos s:"only" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
OrToken = start:pos s:"or" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
PrecursorToken = start:pos s:"Precursor" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
RedefineToken = start:pos s:"redefine" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
RenameToken = start:pos s:"rename" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
RequireToken = start:pos s:"require" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
RescueToken = start:pos s:"rescue" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
ResultToken = start:pos s:"Result" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
RetryToken = start:pos s:"retry" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
SelectToken = start:pos s:"select" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
SeparateToken = start:pos s:"separate" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
ThenToken = start:pos s:"then" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
TrueToken = start:pos s:"True" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
TUPLEToken = start:pos s:"TUPLE" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
UndefineToken = start:pos s:"undefine" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
UntilToken = start:pos s:"until" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
VariantToken = start:pos s:"variant" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
VoidToken = start:pos s:"Void" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
WhenToken = start:pos s:"when" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
XorToken = start:pos s:"xor" !IllegalAfterKeyword end:pos { return { text: s, start: start, end:end }; }
