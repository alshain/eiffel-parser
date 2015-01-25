{
  function isReserved(name) {
    return /^(agent|alias|all|and|as|assign|attribute|check|class|convert|create|Current|debug|deferred|do|else|elseif|end|ensure|expanded|export|external|False|feature|from|frozen|if|implies|inherit|inspect|invariant|like|local|loop|not|note|obsolete|old|once|only|or|Precursor|redefine|rename|require|rescue|Result|retry|select|separate|then|True|TUPLE|undefine|until|variant|Void|when|xor)$/.test(name);
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

  function currentExpression() {
    return _n("current", {});
  }

  function buildBinaryTree(left, rest) {
    return rest.reduce(
      function(left, kind__right) {
        return  _n("expression.binary." + kind__right.kind, {
          isbinary: true,
          left: left,
          right: kind__right.right,
        });
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
  = w note:Note? ClassToken name:ClassName inherit:inherit? create:create? featureLists:FeatureList* W EndToken w
    { return _n("class", {
        name: name, 
        note: optionalList(note),
        inherit : optionalList(inherit), 
        create: (create == null) ? [] : create, 
        featureLists: featureLists
      });
    } 

Note = NoteToken p:NotePair+ W {return p;}
NotePair = W i:Identifier w ":" w v:NoteValue {return {key: i.name, value: v.value};}

NoteValue
  = StringLiteral
  / IntegerLiteral

ClassName = W name:Identifier { return name.name}
create = W CreateToken W first:Identifier rest:("," w id:Identifier { return id.name})* {return buildList(first.name, rest, gId())}
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
  = W RenameToken W l:IdentifierList { return l; }

InhNewExports
  = W ExportToken es:ExportChangeset+ { return es; }

ExportChangeset
  = w "{" w cs:IdentifierList w "}" fs:FeatureSet w ";"
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


FeatureList
  = W FeatureToken access:(w acc:AccessSpecifier { return acc })? fs:Feature*
    { return _n("featureList", {
        access : access,
        features: fs
      });
    }

Feature
  = W c:Constant {return c}
  / W f:Function {return f}
  / W p:Procedure {return p}
  / W a:Attribute {return a}

Function
  = h:RoutineHeader w ":" w rt:Type W b:RoutineBody
  {
    return _n("feature.function", {
      name: h.name,
      params: h.params,
      returnType: rt,
      preconditions: b.preconditions,
      localLists: b.locals,
      instructions: b.instructions,
      postconditions: b.postconditions,
    });
  }

Procedure
  = h:RoutineHeader w b:RoutineBody
  {
    return _n("feature.procedure", {
      name: h.name,
      params: h.params,
      preconditions: b.preconditions,
      localLists: b.locals,
      instructions: b.instructions,
      postconditions: b.postconditions,
    });
  }

RoutineHeader 
  = n:Identifier alias:Alias? p:(w "(" w ps:VarList? ")" {return ps;})?
  {
    return {
      name: n.name,
      alias: alias,
      params: optionalList(p)
    }
  }

Alias
  = W AliasToken w s:StringLiteral

VarList 
  = v:Vars vs:(w ";" w vi:Vars w { return vi; })* { return Array.prototype.concat.call(v, vs)}

Vars 
  = ids:IdentifierList w ":" w t:Type
  {
    return ids.map(function(id) {
      return _n("var", {
        name: id,
        parameterType: t
      });
    });
  }

Attribute
  =  n:Identifier  w ":" w t:Type 
  {
    return _n("feature.attribute", {
      name: n.name,
      attributeType: t
    });
  }

Constant 
  = a:Attribute w "=" l:Literal
  {
    return _n("feature.constant", {
      name: a.name,
      constantType: a.attributeType,
      value: l
    });
  }

RoutineBody
  = pre:Preconditions? l:Locals? instructions:Do post:Postconditions? W EndToken
  {
    return {
      preconditions: optionalList(pre),
      locals: optionalList(l),
      instructions: optionalList(instructions),
      post: optionalList(post),
    }
  }

Preconditions 
  = RequireToken c:LabelledCondition* W {return c;}
LabelledCondition 
  = W l:ConditionLabel? e:Expression 
  {
    return {
      name: l,
      expression: e,
    };
  }
ConditionLabel = i:Identifier w ":" w {return i.name;}

Locals = LocalToken vs:VarLists W { return vs; }
VarLists = vs:(W v:VarList {return v;})+ {return vs;}
Postconditions = "a"
Do = DoToken i:InstructionSeq {return i}

InstructionSeq
  = (W i:Instruction rest:(ns:(Indent* LineTerminatorSequence w {return null;} / Indent* n:NoOp Indent* {return n;}) r:Instruction {if(ns) { return [ns, r]} else { return [ns]}})* {return merge([i], rest)})?
  // = (W i:Instruction rest:(ns:(Indent* LineTerminatorSequence w {return null;} / Indent* n:NoOp Indent* {return n;}) r:Instruction {if(ns) { return [ns, r]} else {})* {return buildList(i, rest, gId())})?

pos
  =
  {
    return {
      offset: offset(),
      line: line(),
      column: column(),
    };
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
  = l:OrExpr rest:(w o:"implies" !IllegalAfterKeyword w r:OrExpr { return {kind: o, right:r}})* { return buildBinaryTree(l, rest)}
    
OrExpr 
  = l:AndExpr rest:(w o:("or else" / "or") !IllegalAfterKeyword w r:AndExpr { return {kind: o, right:r}})* { return buildBinaryTree(l, rest)}
    
AndExpr
  = l:CompExpr rest:(w o:("and then" / "and") !IllegalAfterKeyword w r:CompExpr { return {kind: o, right:r}})* { return buildBinaryTree(l, rest)}

CompExpr 
  = l:DotDotExpr rest:(w o:CompOperator w r:DotDotExpr { return {kind: o, right:r}})* { return buildBinaryTree(l, rest)}

DotDotExpr
  = l:BinPlusMinusExpr rest:(w o:".." !IllegalAfterKeyword w r:BinPlusMinusExpr { return {kind: o, right:r}})* { return buildBinaryTree(l, rest)}

CompOperator = ("=" / "/=" / "~" / "/~" / "<=" / ">=" / "<" / ">" )

BinPlusMinusExpr
  = l:BinMultExpr rest:(w o:("+" / "-" !("-") {return "-"}) w r:BinMultExpr { return {kind: o, right:r}})* { return buildBinaryTree(l, rest)}

BinMultExpr
  = l:ExponentExpr rest:(w o:("//" / "/" / "\\\\" / "*") w r:ExponentExpr { return {kind: o, right:r}})* { return buildBinaryTree(l, rest)}
    

ExponentExpr
  = l:UnaryExpr w k:"^" w r:ExponentExpr
    {
      return _n("expression.binary." + k, {
        isbinary: true,
        left: l,
        right: r,
      });
    }
  / UnaryExpr

UnaryExpr
  = o:("-" !("-") {return "-"} / "+" {return "+"} / "not" !IllegalAfterKeyword) w u:UnaryExpr
    {
      return _n("exp.unary." + o, {
        is_unary: true,
        operand: u,
      });
    }
  / FactorExpr

FirstExpr
  = "(" w e:Expression w ")" { return e}
  / CurrentToken
  / Identifier Args
  / Identifier
  / StringLiteral

FactorExpr
  = f:FirstExpr ops:(Index / Call)* { return buildIndexArgTree(f, ops)}
  / Literal

Index
  = w "[" w a:ArgList w "]"
  {
    return _n("index", {
      operand: undefined,
      args: optionalList(a),
    });
  }

Call
  = w "." w i:Identifier a:Args?
  {
    return _n("call", {
      operand: undefined,
      name: i.name,
      args: optionalList(a),
    });
  }

IllegalAfterKeyword
  = Letter
  / DecimalDigit

Type
  = n:Identifier ts:(w "[" w g:TypeList w "]" {return g})?
  { 
    return _n("type", {
      name: n.name,
      typeParams: optionalList(ts),
    });
  }

TypeList
  = f:Type w rest:("," w t:Type w {return t})* {return buildList(f, rest, gId())}

LoopInstr
  = FromToken fromSeq:InstructionSeq W UntilToken W until:Expression W LoopToken is:InstructionSeq W EndToken
  {
    return _n("fromLoop", {
      until: until,
      from: fromSeq,
      loop: is,
    });
  }

AcrossInstr
  = IfInstr


IfInstr
  = IfToken W c:Expression W ThenToken is:InstructionSeq ei:ElseIf? e:Else? W EndToken
  { 
    return _n("if", {
      condition: c,
      elseif: optionalList(ei),
      else_instructions: optionalList(e),
      instructions: optionalList(is)
    });
  }

Else
  = W ElseToken is:InstructionSeq { return is }

ElseIf = rest:(W ElseifToken W c:Expression W ThenToken is:InstructionSeq {return {condition: c, instructions: optionalList(is)}})+ {return rest}

AssignmentInstr
  = lhs:LeftHandSide w ":=" w rhs:Expression
  {
    return _n("assignment", {
      lhs: lhs,
      rhs: rhs,
    });
  }


LeftHandSide
  = Expression

CreateInstr
  = CreateToken !(IllegalAfterKeyword) w t:ExplicitCreationType? n:Identifier m:CreationMethod?
  {
    return _n("create", {
      target: n.name,
      initializer: (m ? m.name : "default_create"),
      args: m ? optionalList(m.args) : []
    });
  }

CreationMethod
  = CreationCall

CreationCall
  = "." n:Identifier as:Args?
  {
    return {
      name: n.name,
      args: optionalList(as)
    }
  }

Args
  = w "(" w r:ArgList? ")" {return optionalList(r)}

ArgList
  = first:Expression w rest:("," w r:Expression w {return r})* { return buildList(first, rest, gId())}

ExplicitCreationType
  = "{" w t:Identifier w "}"
  { return t.name }
    

AccessSpecifier
  = "{" w ids:IdentifierList w "}" {return ids;}

IdentifierList
  = first:Identifier rest:("," w id:Identifier { return id.name})* {return buildList(first.name, rest, gId())}

id "identifier" = [a-zA-Z][a-zA-Z0-9_]*

Indent = (" " / "\t")+

W "whitespace" 
    = (" " / "\t" / "\n" / ("--" (!(LineTerminatorSequence) .)*))+
w = W?

Identifier
  = !ReservedWord name:IdentifierName { if (isReserved(name.name)) {expected("Identifier, Keyword " + name.name + " found"); } return name;}

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
  = DecimalIntegerLiteral {
    return _n("literal", { kind: "int", value: parseFloat(text()) });
  }

StringLiteral "string"
  = '"' chars:DoubleStringCharacter* '"' {
  return _n("literal", { kind: "string", value: chars.join("") });
  }

CharacterLiteral "character"
  = "'" char:SingleStringCharacter "'" {
  return _n("literal", { kind: "char", value: char });
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
  = pos:pos r:VoidLiteral    !(IllegalAfterKeyword) { return _n("literal", { kind: "Void", pos:pos});}
  / pos:pos r:BooleanLiteral !IllegalAfterKeyword {return _n("literal", { kind: "bool", value: r});}
  / pos:pos r:IntegerLiteral !IllegalAfterKeyword {return r;}
  / pos:pos r:StringLiteral  !IllegalAfterKeyword {return r;}

Letter
  = [a-z]
  / [A-Z]

IdentifierName "identifier"
  = first:IdentifierStart rest:IdentifierPart* {
    return _n("Identifier", {
      name: first + rest.join("")
    });
}

ReservedWord
  = r:Keyword        !(IllegalAfterKeyword) { return r}
  / pos:pos r:VoidLiteral    !(IllegalAfterKeyword) { return _n("Void", { pos:pos});}
  / r:BooleanLiteral !(IllegalAfterKeyword) { return r;}

VoidLiteral
  = "Void"

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

AgentToken = "agent"
AliasToken = "alias"
AllToken = "all"
AndToken = "and"
AssignToken = "assign"
AsToken = "as"
AttributeToken = "attribute"
CheckToken = "check"
ClassToken = "class"
ConvertToken = "convert"
CreateToken = "create"
CurrentToken = "Current"
DebugToken = "debug"
DeferredToken = "deferred"
DoToken = "do"
ElseToken = "else"
ElseifToken = "elseif"
EndToken = "end"
EnsureToken = "ensure"
ExpandedToken = "expanded"
ExportToken = "export"
ExternalToken = "external"
FalseToken = "False"
FeatureToken = "feature"
FromToken = "from"
FrozenToken = "frozen"
IfToken = "if"
ImpliesToken = "implies"
InheritToken = "inherit"
InspectToken = "inspect"
InvariantToken = "invariant"
LikeToken = "like"
LocalToken = "local"
LoopToken = "loop"
NotToken = "not"
NoteToken = "note"
ObsoleteToken = "obsolete"
OldToken = "old"
OnceToken = "once"
OnlyToken = "only"
OrToken = "or"
PrecursorToken = "Precursor"
RedefineToken = "redefine"
RenameToken = "rename"
RequireToken = "require"
RescueToken = "rescue"
ResultToken = "Result"
RetryToken = "retry"
SelectToken = "select"
SeparateToken = "separate"
ThenToken = "then"
TrueToken = "True"
TUPLEToken = "TUPLE"
UndefineToken = "undefine"
UntilToken = "until"
VariantToken = "variant"
VoidToken = "Void"
WhenToken = "when"
XorToken = "xor"
