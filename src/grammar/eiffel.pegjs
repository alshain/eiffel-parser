{
  function isReserved(name) {
    return /^(agent|alias|all|and|as|assign|attribute|check|class|convert|create|Current|debug|deferred|do|else|elseif|end|ensure|expanded|export|external|False|feature|from|frozen|if|implies|inherit|inspect|invariant|like|local|loop|not|note|obsolete|old|once|only|or|Precursor|redefine|rename|require|rescue|Result|retry|select|separate|then|True|TUPLE|undefine|until|variant|Void|when|xor)$/.test(name);
  }

  function extractList(list, f) {
    var result = new Array(list.length), i;
    for (i = 0; i < list.length; i++) {
      result[i] = f(list[i]);
    }

    return result;
  }

    function currentExpression() {
      return {
        type: "current"
      }
    }

    function buildBinaryTree(left, rest) {
      return rest.reduce(
        function(left, kind__right) {
          return  {
            type: "expression",
          kind: kind__right.kind,
          isbinary: true,
          left: left,
          right: kind__right.right,
        }
        },
        left
      );
    }

  function buildList(first, rest, f) {
      return [first].concat(extractList(rest, f));
  }

  function merge() {
    return Array.prototype.reduce.call(arguments, function(xs, x) { return xs.concat(x)});
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
    { return {
        type: "class",
        name: name, 
        note: optionalList(note),
        inherit : optionalList(inherit), 
        create: (create == null) ? [] : create, 
        featureLists: featureLists
      };
    } 

Note = NoteToken p:NotePair+ W {return p;}
NotePair = W i:Identifier w ":" w v:NoteValue {return {key: i.name, value: v.value};}

NoteValue
  = StringLiteral
  / IntegerLiteral

ClassName = W name:Identifier { return name.name}
create = W CreateToken W first:Identifier rest:("," w id:Identifier { return id.name})* {return buildList(first.name, rest, gId())}
inherit = W InheritToken W r:IdentifierList {return r}
FeatureList 
  = W FeatureToken access:(w acc:AccessSpecifier { return acc })? fs:Feature*
    { return {
        type: "featureList",
        access : access,
        features: fs
      };
    }

Feature
  = W c:Constant {return c}
  / W f:Function {return f}
  / W p:Procedure {return p}
  / W a:Attribute {return a}

Function
  = h:RoutineHeader w ":" w rt:Type W b:RoutineBody
  {
    return {
      type: "function",
      name: h.name,
      params: h.params,
      returnType: rt,
      preconditions: b.preconditions,
      locals: b.locals,
      instructions: b.instructions,
      postconditions: b.postconditions,
    };
  }

Procedure
  = h:RoutineHeader w b:RoutineBody
  {
    return {
      type: "procedure",
      name: h.name,
      params: h.params,
      preconditions: b.preconditions,
      locals: b.locals,
      instructions: b.instructions,
      postconditions: b.postconditions,
    };
  }

RoutineHeader 
  = n:Identifier p:(w "(" w ps:VarList? ")" {return ps;})?
  {
    return {
      name: n.name,
      params: optionalList(p)
    }
  }

VarList 
  = Vars (w ";" w Vars w)*

Vars 
  = ids:IdentifierList w ":" w t:Type
  {
    return ids.forEach(function(id) {
      return {
        type: "var",
        name: id.name,
        parameterType: t
      };
    });
  }

Attribute
  =  n:Identifier  w ":" w t:Type 
  { 
    return {
      type: "attribute",
      name: n.name,
      attributeType: t
    };
  }

Constant 
  = a:Attribute w "=" l:Literal
  {
    return {
      type: "constant",
      name: a.name,
      constantType: a.attributeType,
      value: l
    }
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

Locals = LocalToken VarLists W
VarLists = vs:(W v:VarList {return v;})+ {return Array.prototype.concat.apply([], vs);}
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
    return {
      type: "noop"
    };
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
      return {
        "type": "expression",
        isbinary: true,
        kind: k,
        left: l,
        right: r,
      }
    }
  / UnaryExpr

UnaryExpr
  = o:("-" !("-") {return "-"} / "+" {return "+"} / "not" !IllegalAfterKeyword) w u:UnaryExpr
    {
      return {
        "type": "expression",
        "kind": o,
        is_unary: true,
        operand: u,
      };
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
    return {
      type: "index",
      operand: undefined,
      args: optionalList(a),
    };
  }

Call
  = w "." w i:Identifier a:Args?
  {
    return {
      type: "call",
      operand: undefined,
      name: i.name,
      args: optionalList(a),
    };
  }

IllegalAfterKeyword
  = Letter
  / DecimalDigit

Type
  = n:Identifier ts:(w "[" w g:TypeList w "]" {return g})?
  { 
    return {
      type: "type",
      name: n.name,
      typeParams: optionalList(ts),
    }
  }

TypeList
  = f:Type w rest:("," w t:Type w {return t})* {return buildList(f, rest, gId())}

LoopInstr
  = FromToken fromSeq:InstructionSeq W UntilToken W until:Expression W LoopToken is:InstructionSeq W EndToken
  {
    return {
      type: "fromLoop",
      until: until,
      from: fromSeq,
      loop: is,
    };
  }

AcrossInstr
  = IfInstr


IfInstr
  = IfToken W c:Expression W ThenToken is:InstructionSeq ei:ElseIf? e:Else? W EndToken
  { 
    return {
      type: "if",
      condition: c,
      elseif: optionalList(ei),
      else_instructions: optionalList(e),
      instructions: optionalList(is)
    };
  }

Else
  = W ElseToken is:InstructionSeq { return is }

ElseIf = rest:(W ElseifToken W c:Expression W ThenToken is:InstructionSeq {return {condition: c, instructions: optionalList(is)}})+ {return rest}

AssignmentInstr
  = lhs:LeftHandSide w ":=" w rhs:Expression
  {
    return {
      type: "assignment",
      lhs: lhs,
      rhs: rhs,
    }
  }


LeftHandSide
  = Expression

CreateInstr
  = CreateToken !(IllegalAfterKeyword) w t:ExplicitCreationType? n:Identifier m:CreationMethod?
  {
    return {
      type: "create",
      target: n.name,
      initializer: (m ? m.name : "default_create"),
      args: m ? optionalList(m.args) : []
    }
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
    return { type: "Literal", value: parseFloat(text()) };
  }

StringLiteral "string"
  = '"' chars:DoubleStringCharacter* '"' {
  return { type: "Literal", value: chars.join("") };
  }

CharacterLiteral "character"
  = "'" char:SingleStringCharacter "'" {
  return { type: "Literal", value: char };
  }
DoubleStringCharacter
  = !('"' / "\\" / LineTerminator) SourceCharacter { return text(); }
  / "\\" sequence:EscapeSequence { return sequence; }
  / LineContinuation
SingleStringCharacter
  = !("'" / "\\" / LineTerminator) SourceCharacter { return text(); }
  / "%" sequence:EscapeSequence { return sequence; }
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
  / '"'
  / "%"
  / "b" { return "\b"; }
  / "f" { return "\f"; }
  / "n" { return "\n"; }
  / "r" { return "\r"; }
  / "t" { return "\t"; }
  / "v" { return "\x0B"; } // IE does not recognize "\v".
  NonEscapeCharacter
= !(EscapeCharacter / LineTerminator) SourceCharacter { return text(); }
EscapeCharacter
  = SingleEscapeCharacter
  / DecimalDigit
  / "x"
  / "u"


Literal
  = r:VoidLiteral    !IllegalAfterKeyword {return r}
  / r:BooleanLiteral !IllegalAfterKeyword {return r}
  / r:IntegerLiteral !IllegalAfterKeyword {return r}
  / r:StringLiteral  !IllegalAfterKeyword {return r}

Letter
  = [a-z]
  / [A-Z]

IdentifierName "identifier"
  = first:IdentifierStart rest:IdentifierPart* {
    return {
      type: "Identifier",
      name: first + rest.join("")
    };
}

ReservedWord
  = r:Keyword        !(IllegalAfterKeyword) { return r}
  / r:VoidLiteral    !(IllegalAfterKeyword) { return r}
  / r:BooleanLiteral !(IllegalAfterKeyword) { return r}

VoidLiteral
  = "Void"

BooleanLiteral
  = TrueToken
  / FalseToken



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
