// Fixme CONVERT syntax
{
  var verbatimContext = "";

  function setVerbatimEnd(b) {
    if (b === "{") {
      verbatimContext = "}" + verbatimContext + '"';
    }
    else if (b === "[") {
      verbatimContext = "]" + verbatimContext + '"';
    }
    else {
      throw new Error("Invalid verbatim bracket: " + b);
    }
  }
  function allSubsequences(s) {
    var i;
    var j;
    var results = [];
    for(i = 0; i < s.length; i++) {
      for (j = i + 1; j <= s.length; j++) {
        results.push(s.substring(i, j));
      }
    }
    return results;
  }

  function isReserved(name) {
    // TODO reinsert TUPLE
    return /^(agent|alias|all|and|as|assign|attribute|check|class|convert|create|Current|debug|deferred|do|detachable|else|elseif|end|ensure|expanded|export|external|False|feature|from|frozen|if|implies|inherit|inspect|invariant|like|local|loop|not|note|obsolete|old|once|only|or|Precursor|redefine|rename|require|rescue|Result|retry|select|separate|then|True|undefine|until|variant|Void|when|xor)$/.test(name);
  }

  function isOperatorSymbol(s) {
    // FIXME Standard says character must not be a |, but then it won't recognise |>>
    var specialSymbolChars = "_:;,?!'\"$.->:=/=~/~()()[]{}";
    var standardOperatorSymbols = "+-*/^<>=\\.";
    if(/^[^a-zA-Z0-9\s\:]$/.test(s)) {
      // SPEC 8.32.20
      // AT LEAST ONE OF THE FOLLOWING PROPERTIES
      // 1 It does not appear in any of the special symbols.
      if (specialSymbolChars.indexOf(s) === -1) {
        return true;
      }

      // 2 It appears in any of the standard (unary or binary) operators
      // BUT is neither a dot . nor an equal sign =.
      if (s !== "." && s !== "=" && standardOperatorSymbols.indexOf(s) !== -1) {
        return true;
      }

      // 3 It is a tilde ~, percent %, question mark ?, or exclamation mark !.

      if (s === "~" || s === "%" || s === "?" || s === "!") {
        return true;
      }
    }
    return false;
  }
  var specialSymbols = [
    "--",
    ":",
    ";",
    ",",
    "?",
    "!",
    "'",
    "\"",
    "$",
    ".",
    "->",
    ":=",
    "=",
    "/=",
    "~",
    "/~",
    "(",
    ")",
    "(|",
    "|)",
    "[",
    "]",
    "{",
    "}",
  ];

  var predefinedOperators = [
    "=",
    "/=",
    "~",
    "~=",
  ];

  var standardOperators = [
    "+",
    "-",
    "*",
    "/",
    "^",
    "<",
    ">",
    "<=",
    ">=",
    "//",
    "\\\\",
    "..",
  ];

  function isFreeOperator(os) {
    // SPEC 3.32.21 Page 157 (PDF page: 177)

    // A free operator is sequence of one or more characters satisfying the following properties:

    // 1 It is not a special symbol, standard operator or predefined operator.

    if (specialSymbols.indexOf(os) !== -1) {
      return false;
    }

    if (standardOperators.indexOf(os) !== -1) {
      return false;
    }

    if (predefinedOperators.indexOf(os) !== -1) {
      return false;
    }


    // 2 Every character in the sequence is an operator symbol.

      // Already satisfied because this is only called with a sequence of isOperatorSymbol satisfying characters

    // 3 Every subsequence that is not a standard operator or predefined operator is distinct from all special symbols
    var fulfilled_3 = true;
    var subsequences = allSubsequences(os);
    subsequences.forEach(function (subsequence) {
      var is_standard = standardOperators.indexOf(subsequence) !== -1;
      var is_predefined = predefinedOperators.indexOf(subsequence) !== -1;
      if (!is_standard && !is_predefined) {
        if (specialSymbols.indexOf(subsequence) !== -1) {
          // NOT distinct
          fulfilled_3 = false;
        }
      }
    });

    return fulfilled_3;
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

  function merge(first, rest) {
    var result = [first];
    return Array.prototype.reduce.call(rest, function(xs, x) { return xs.concat(x);}, result);
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
  = w note:Note? deferred:MaybeDeferred frozen:MaybeFrozen expanded:(e:ExpandedToken W {return e})? ClassToken name:ClassName generics:GenericParams? inherit:inherit? create:CreationClause? convert:Convert? featureLists:FeatureList* Invariant? W (Note)? EndToken w
    {
      return new eiffel.ast.Class(
        name,
        deferred,
        frozen,
        expanded,
        optionalList(note),
        optionalList(inherit),
        optionalList(generics),
        (create == null) ? [] : create,
        featureLists
      );
    }

MaybeFrozen
  = f:FrozenToken W {return f}
  / { return null}

MaybeDeferred
  = d:DeferredToken W {return d}
  / { return null}

GenericParams
  = w "[" w gs:GenericParamList w "]"
  {
    return gs;
  }

GenericParamList
  = first:GenericParameter rest:(w "," w r:GenericParameter {return r;})* {return buildList(first, rest, gId()); }

GenericParameter
  = i:Identifier cs:GenericConstraint?
  {
    return new eiffel.ast.FormalGenericParameter(
      i,
      (cs == null) ? [] : cs.cons,
      (cs == null) ? [] : cs.creators
    );
  }

GenericConstraint
  = w "->" w cons:ConstrainingTypes crs:ConstraintCreators?
  {
    console.warn("Generic constraint: not implemented");
    return {
      cons: cons,
      creators: crs,
    }
  }

ConstrainingTypes
  = SingleConstraint
  / MultipleConstraint

SingleConstraint
  = t:Type r:Rename?
  {
    return new eiffel.ast.TypeConstraint(t, r);
  }

ConstraintCreators
  = W CreateToken W is:IdentifierList W EndToken
  {
    console.warn("Constraint Creators: Not implemented");
    return is;
  }

MultipleConstraint
  = "{" w cs:SingleConstraintList w "}" {return cs}

SingleConstraintList
  = first:SingleConstraint rest:(w "," SingleConstraint)* {return buildList(first, rest, gId()); }

Note = NoteToken p:NotePair+ W {return p;}
NotePair = W i:Identifier w ":" w v:NoteValues (w ";")? {return {key: i, value: v.value};}

NoteValues
  = NoteValue w "," w NoteValues
  / NoteValue

NoteValue
  = StringLiteral
  / IntegerLiteral
  / Identifier

ClassName = W name:Identifier { return name}
CreationClause
  = W CreateToken cs:(w Clients)? W first:Identifier rest:("," w id:Identifier { return id})*
  {
    return buildList(first, rest, gId())
  }

Clients
  = "{" w cs:IdentifierList w "}"

inherit = ParentGroup+

ParentGroup
  = W InheritToken c:(w "{" w i:(Identifier?) w "}" {return i;} / { return null; })? ps:Parent+
  {
    return new eiffel.ast.ParentGroup(c, ps);
  }

Parent
  = w t:Type adaptions:Adaptions?
  {
    return new eiffel.ast.Parent(
      t,
      adaptions
    );
  }
/** FIXME: No backtracking, END of inheritance only mandatory if at least one rule fits */

Adaptions
  = as:Adaption+ W EndToken { return as; }

Adaption
  = InhUndefine
  / InhRedefine
  / InhRename
  / InhSelect
  / InhNewExports

InhUndefine
  = W t:UndefineToken W l:IdentifierList
  {
    return new eiffel.ast.Undefines(t, l);
  }

InhRedefine
  = W t:RedefineToken W l:IdentifierList
  {
    return new eiffel.ast.Redefines(t, l);
  }

InhRename
  = W t:RenameToken W l:RenameList
  {
    return new eiffel.ast.Renames(t, l);
  }

RenameList
  = first:Rename rest:("," w id:Rename { return id})* {return buildList(first, rest, gId())}

Rename
  = oldName:Identifier W AsToken W newName:ExtendedFeatureName
  {
    return new eiffel.ast.Rename(oldName, newName);
  }

InhNewExports
  = W t:ExportToken es:ExportChangeset+
  {
    return new eiffel.ast.NewExports(t, es);
  }

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
  = W t:SelectToken W l:IdentifierList
  {
    return new eiffel.ast.Selects(t, l);
  }

Convert
  = W ConvertToken W ConvertList


ConvertList
  = first:ConvertListEntry rest:("," w id:ConvertListEntry { return id})* {return buildList(first, rest, gId())}


ConvertListEntry
  = ConversionProcedure
  / ConversionQuery

ConversionProcedure = Identifier w "(" w "{" w TypeList w "}" w ")"
ConversionQuery = Identifier w ":" w "{" TypeList w "}"

FeatureList
  = W FeatureToken access:(w acc:AccessSpecifier { return acc })? fs:Feature*
    { return new eiffel.ast.FeatureList(
        optionalList(access),
        fs
      );
    }

Feature
  = W c:Constant (w ";")? {return c}
  / W f:Function (w ";")? {return f}
  / W p:Procedure (w ";")? {return p}
  / W a:Attribute (w ";")? {return a}

NewFeatureList
  = first:NewFeatureName rest:(w "," w r:NewFeatureName {return r;})* {return buildList(first, rest, gId())}

NewFeatureName
  = f:(fi:FrozenToken w {return fi; })? na:ExtendedFeatureName
  {
    return new eiffel.ast.FrozenNameAlias(
      na.name,
      na.alias,
      f
    );
  }

ExtendedFeatureName
  = n:FeatureName a:Alias?
  {
    return new eiffel.ast.ExtendedFeatureName(
      n,
      a
    );
  }

FeatureName
  = Identifier

Function
  = start:pos h:RoutineHeader w ":" w rt:Type Assigner? b:RoutineBody end:pos
  {
    return new eiffel.ast.Function(
      h.namesAndAliases,
      h.params,
      rt,
      b
    );
  }

Assigner
  = w AssignToken W Identifier

Procedure
  = start: pos h:RoutineHeader b:RoutineBody end:pos
  {
    return new eiffel.ast.Procedure(
      h.namesAndAliases,
      h.params,
      null,
      b
    );
  }
// FIXME: Synonyms for routines
RoutineHeader
  = n:NewFeatureList p:(w "(" w ps:VarList? ")" {return ps;})?
  {
    return {
      namesAndAliases: n,
      params: optionalList(p)
    }
  }

RoutineNameAliasList
  = first:RoutineNameAlias rest:(w "," w r:RoutineNameAlias {return r})* {return buildList(first, rest, gId())}

RoutineNameAlias
  = n:Identifier alias:Alias?
  {
    return {
      name: n,
      alias: alias,
    }
  }

Alias
  = W start:pos AliasToken w s:StringLiteral end:pos
  {
    return new eiffel.ast.Alias(s, start, end);
  }

VarList
  = v:Vars vs:(w ";"? w vi:Vars { return vi; })* { return Array.prototype.concat.apply(v, vs)}

Vars
  = ids:IdentifierList w ":" w t:Type
  {
    var varDeclEntries = ids.map(function(id) {
      return new eiffel.ast.VarDeclEntry(id);
    });
    return new eiffel.ast.VarDeclList(varDeclEntries, t);
  }

Attribute
  =  n:NewFeatureList  w ":" w t:Type
  {
    return new eiffel.ast.Attribute(
      n,
      t
    );
  }

Constant
  = n:NewFeatureList  w ":" w t:Type w "=" w l:Literal
  {
    return new eiffel.ast.ConstantAttribute(
      n,
      t,
      l
    );
  }

EndIsNext
  = w EndToken

RoutineBody
  = !EndIsNext bs:RoutineBodyElement+ w EndToken
  {
    return _.flatten(bs);
  }

RoutineBodyElement
  = pre:Preconditions
  / l:Locals
  / a:AliasBlock
  / o:Obsolete
  / e:External
  / e:DeferredBlock
  / OnceBlock
  / d:DoBlock
  / post:Postconditions

External
  = W ExternalToken instructions:InstructionSeq
  {
    return new eiffel.ast.External(instructions);
  }

DeferredBlock
  = W DeferredToken instructions:InstructionSeq
  {
    return new eiffel.ast.DeferredBlock(instructions);
  }

DoBlock
  = W DoToken instructions:InstructionSeq
  {
    return new eiffel.ast.DoBlock(instructions);
  }

OnceBlock
= W OnceToken instructions:InstructionSeq
{
  return new eiffel.ast.OnceBlock(instructions);
}

Obsolete
  = W start:pos ObsoleteToken W e:Expression end:pos
  {
    return new eiffel.ast.Obsolete(e, start, end);
  }

AliasBlock
  = W start:pos t:AliasToken W e:Expression end:pos
  {
    return new eiffel.ast.AliasBlock(t, e, start, end);
  }

Preconditions
  = W RequireToken (w ElseToken)? c:Precondition* {return c;}

Postconditions
  = W EnsureToken (w ThenToken)? c:Postcondition* {return c;}

Invariant
  = W InvariantToken c:Invariantcondition* {return c;}

Assertion
  = l:LabelledCondition* Note?
  {
    return new eiffel.ast.CheckInstruction(l.expression);
  }

CheckInstruction
  = CheckToken a:Assertion W EndToken
  {
    return a;
  }

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
  / W l:ConditionLabel
  {
    return {
      name: l,
      expression: null,
    };
  }

ConditionLabel = i:Identifier w ":" w {return i;}

Locals = W LocalToken vs:VarLists { return new eiffel.ast.LocalsBlock(vs); }
VarLists = vs:(W v:VarList {return v;})+ {return vs;}

InstructionSeq
  = (W i:Instruction rest:(ns:(Indent* LineTerminatorSequence w {return null;} / Indent* n:NoOp Indent* {return n;}) r:Instruction {if(ns) { return [ns, r]} else { return [r]}})* {return merge(i, rest)})?
  // = (W i:Instruction rest:(ns:(Indent* LineTerminatorSequence w {return null;} / Indent* n:NoOp Indent* {return n;}) r:Instruction {if(ns) { return [ns, r]} else {})* {return buildList(i, rest, gId())})?

pos
  =
  {
    return new eiffel.ast.Pos(
      offset()
      //line(),
      //column()
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
  / CheckInstruction
  / InspectInstruction

NoOp = w ";"
  {
    return _n("noop", {});
  }


Expression
  = ImpliesExpr

ImpliesExpr
  = start:pos l:OrExpr rest:(w o:"implies" !IllegalAfterKeyword w r:OrExpr e:pos { return {kind: o, right:r, end:e}})* end:pos { return buildBinaryTree(l, rest, start, end)}

OrExpr
  = start:pos l:AndExpr rest:(w o:("or " w "else" { return "or else"} / "or" / "xor") !IllegalAfterKeyword w r:AndExpr { return {kind: o, right:r}})* end:pos { return buildBinaryTree(l, rest, start, end)}

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
  = start:pos l:FreeBinaryExpr w k:"^" w r:ExponentExpr end:pos
    {
      return new eiffel.ast.BinaryOp(
        k,
        l,
        r,
        start,
        end
      );
    }
  / FreeBinaryExpr

FreeBinaryExpr
  = start:pos l:UnaryExpr rest:(w o:(FreeOperator) w r:UnaryExpr { return {kind: o, right:r}})* end:pos { return buildBinaryTree(l, rest, start, end)}

UnaryExpr
  = start:pos o:("-" !("-") {return "-"} / "+" {return "+"} / "not" !IllegalAfterKeyword / "old" !IllegalAfterKeyword / FreeOperator) w u:UnaryExpr end:pos
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
  / TypeExpression
  / TupleExpression
  / start:pos ResultToken end:pos
    {
      return new eiffel.ast.ResultExpression(start, end);
    }
  / i:IdentifierAccess a:Args
  {
    return new eiffel.ast.UnqualifiedCallExpression(i, a);
  }
  / IdentifierAccess
  / StringLiteral
  / Address

Address "address"
  = start:pos "$" i:AddressOf
  {
    return new eiffel.ast.Address(i, start, i.end);
  }

AddressOf
  = Identifier
  / Current

TupleExpression
  = start:pos "[" w es:ExpressionList w "]" end:pos
  {
    return new eiffel.ast.TupleExpression(es, start, end);
  }

// TODO: insert whitespace around type?
TypeExpression
  = "{" i:Type "}"
  {
    return new eiffel.ast.TypeExpression(i);
  }

FactorExpr
  = f:FirstExpr ops:(Index / Call)* { return buildIndexArgTree(f, ops)}
  / Precursor
  / CreateExpression
  / Literal
  / AttachedExpression

CreateExpression
  = CreateToken !(IllegalAfterKeyword) w t:ExplicitCreationType m:CreationCall?
  {
    return new eiffel.ast.CreateExpression(
      t,
      (m ? m.name : null),
      m ? optionalList(m.args) : []
    );
  }

Precursor
  = start:pos t:PrecursorToken q:Parent_qualification? a:Args? end:pos
  {
    return new eiffel.ast.PrecursorCall(t, q, a, start, end);
  }

Parent_qualification
  = w "{" w t:Identifier w "}" { return t; }

AttachedExpression
  = start:pos AttachedToken t:(w "{" w t:Type w "}" {return t;})? w ov:Expression nv:(W AsToken W nv:Identifier { return nv;})? end:pos
  {
    return new eiffel.ast.AttachedExpression(t, ov, nv, start, end);
  }

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
  = start:pos detachable:(DetachableToken W {return true} / {return false}) separate:(SeparateToken W {return true} / {return false}) n:Identifier ts:(w "[" w g:TypeList w "]" {return g})? end:pos
  {
    return new eiffel.ast.Type(
      n,
      optionalList(ts),
      detachable,
      start,
      end
    );
  }
  / start:pos t:LikeToken W c:Current end:pos
  {
    return new eiffel.ast.TypeLikeCurrent(t, c);
  }
  / start:pos t:LikeToken W i:Identifier end:pos
  {
    return new eiffel.ast.TypeLikeFeature(t, i);
  }

TypeList
  = f:Type w rest:("," w t:Type w {return t})* {return buildList(f, rest, gId())}

LoopInstr
  = fromSeq:LoopFrom until:LoopUntil is:LoopInstructions v:LoopVariant? W EndToken
  {
    return new eiffel.ast.FromLoop(
      fromSeq,
      until,
      is,
      v
    );
  }

AcrossInstr
  = IfInstr

LoopFrom
  = FromToken fromSeq:InstructionSeq { return fromSeq; }

LoopUntil
  = W UntilToken W until:Expression { return until; }

LoopInstructions
  = W LoopToken is:InstructionSeq {return is; }

LoopVariant
  = W VariantToken W (ConditionLabel w)? v:Expression {return v;}

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


InspectInstruction
  = start:pos t:InspectToken W c:Expression w:WhenPart* e:Else? W EndToken end:pos
  {
    return new eiffel.ast.InspectInstruction(
      t,
      c,
      optionalList(w),
      optionalList(e),
      start,
      end
    );
  }

WhenPart
  = W WhenToken W Choices ThenToken is:InstructionSeq

Choices
  = f:Choice w rest:("," w t:Choice w {return t})* {return buildList(f, rest, gId())}

Choice
  = IdentifierAccess

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
  = CreateToken !(IllegalAfterKeyword) w t:ExplicitCreationType? n:(Identifier / ResultToken) m:CreationCall?
  {
    return new eiffel.ast.CreateInstruction(
      n,
      (m ? m.name : null),
      m ? optionalList(m.args) : []
    );
  }

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
  = ExpressionList

ExpressionList
  = first:Expression w rest:("," w r:Expression w {return r})* { return buildList(first, rest, gId())}

ExplicitCreationType
  = "{" w t:Identifier w "}"
  { return t }


AccessSpecifier
  = "{" w ids:IdentifierList w "}" {return ids;}

IdentifierList
  = first:Identifier rest:("," w id:Identifier { return id})* {return buildList(first, rest, gId())}

id "identifier" = [a-zA-Z][a-zA-Z0-9_]*

Indent = (" " / "\t")+ ("--" (!(LineTerminatorSequence) .)*)

W "whitespace"
    = ([ \t\n\r] / ("--" (!(LineTerminatorSequence) .)*))+
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
  = DecimalDigit (DecimalDigit / "_")+ DecimalDigit
  / DecimalDigit+

BinaryIntegerLiteral
  = ("0b" / "0B") BinaryDigit (BinaryDigit / "_")+ BinaryDigit
  / ("0b" / "0B") BinaryDigit+

BinaryDigit
  = [01]

OctalIntegerLiteral
  = ("0c" / "0C") OctalDigit (OctalDigit / "_")+ OctalDigit
  / ("0c" / "0C") OctalDigit+

OctalDigit
  = [0-7]

HexIntegerLiteral
  = ("0x" / "0X") HexDigit (HexDigit / "_")+ HexDigit
  / ("0x" / "0X") HexDigit+

HexDigit
  = [0-9a-fA-F]



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

BaseIntegerLiteral
  = ("-" w)? DecimalIntegerLiteral !IllegalAfterKeyword
  / ("-" w)? BinaryIntegerLiteral !IllegalAfterKeyword
  / ("-" w)? HexIntegerLiteral !IllegalAfterKeyword
  / ("-" w)? OctalIntegerLiteral !IllegalAfterKeyword


IntegerLiteral "integer"
  = start:pos BaseIntegerLiteral !IllegalAfterKeyword end:pos {
    return new eiffel.ast.IntLiteral(text(), start, end);
  }

Real_Constant
  = start:pos Sign? Real end:pos
  {
    return new eiffel.ast.RealLiteral(text(), start, end);
  }

Real
  = DecimalIntegerLiteral "." DecimalIntegerLiteral? Exponent? !IllegalAfterKeyword
  / "." DecimalIntegerLiteral Exponent? !IllegalAfterKeyword

Exponent
  = [eE] Sign? DecimalIntegerLiteral

Sign
  = "-"

//TODO Verbatim strings
StringLiteral "string"
  = VerbatimString
  / SingleLineString

SingleLineString "string"
  = start:pos '"' chars:DoubleStringCharacter* '"' end:pos {
    return new eiffel.ast.StringLiteral(chars.join(""), start, end);
  }

// TODO remove some whitespace etc...
VerbatimString
  = start:pos '"' VerbatimOpener b:("{" / "[")  &{ setVerbatimEnd(b); return true;} s:VerbatimStringCharacter* VerbatimCloser '"' end:pos
  {
    return new eiffel.ast.StringLiteral(s.join(""), start, end);
  }

VerbatimOpener
  = [^{[ \n\t]*
  {
    verbatimContext = text();
    return text();
  }

VerbatimCloser
  = [^"]*

IsEndOfVerbatim
  = & {var lookAhead = input.substring(offset(), offset() + verbatimContext.length); return lookAhead.startsWith(verbatimContext); }

VerbatimStringCharacter
  = !IsEndOfVerbatim s:. {return s;}


CharLiteral "character"
  = start:pos "'" chars:SingleStringCharacter* "'" end:pos {
    return new eiffel.ast.StringLiteral(chars.join(""), start, end);
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
  / r:Real_Constant {return r;}
  / r:IntegerLiteral !IllegalAfterKeyword {return r;}
  / r:StringLiteral  !IllegalAfterKeyword {return r;}
  / r:CharLiteral  !IllegalAfterKeyword {return r;}

Letter
  = [a-zA-Z]

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
  = TrueToken { return text(); }
  / FalseToken { return text(); }

SpecialSymbol
  = "__"
  / ":"
  / ";"
  / ","
  / "?"
  / "!"
  / "'"
  / "\""
  / "$"
  / "."
  / "->"
  / ":="
  / "="
  / "/="
  / "~"
  / "/~"
  / "("
  / ")"
  / "(|"
  / "|)"
  / "["
  / "]"
  / "{"
  / "}"

PredefinedOperator
  = "="
  / "/="
  / "~"
  / "~="

StandardOperator
  = "+"
  / "-"
  / "*"
  / "/"
  / "^"
  / "<"
  / ">"
  / "<="
  / ">="
  / "//"
  / "\\\\"
  / ".."

FreeOperator
  = os:OperatorSymbol+ & { return isFreeOperator(os.join(""));}
  {
      return os.join("");
  }

OperatorSymbol
  = s:. & { return isOperatorSymbol(s) }
  {
    return s;
  }


Keyword
  = AgentToken
  / AliasToken
  / AllToken
  / AndToken
  / AssignToken
  / AsToken
  / AttachedToken
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
  // TUPLEToken
  / UndefineToken
  / UntilToken
  / VariantToken
  / VoidToken
  / WhenToken
  / XorToken

/* Tokens */

AgentToken = start:pos s:"agent" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
AliasToken = start:pos s:"alias" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
AllToken = start:pos s:"all" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
AndToken = start:pos s:"and" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
AssignToken = start:pos s:"assign" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
AsToken = start:pos s:"as" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
AttachedToken = start:pos s:"attached" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
AttributeToken = start:pos s:"attribute" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
CheckToken = start:pos s:"check" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
ClassToken = start:pos s:"class" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
ConvertToken = start:pos s:"convert" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
CreateToken = start:pos s:"create" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
CurrentToken = start:pos s:"Current" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
DebugToken = start:pos s:"debug" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
DeferredToken = start:pos s:"deferred" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
DoToken = start:pos s:"do" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
DetachableToken = start:pos s:"detachable" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
ElseToken = start:pos s:"else" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
ElseifToken = start:pos s:"elseif" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
EndToken = start:pos s:"end" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
EnsureToken = start:pos s:"ensure" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
ExpandedToken = start:pos s:"expanded" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
ExportToken = start:pos s:"export" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
ExternalToken = start:pos s:"external" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
FalseToken = start:pos s:"False" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
FeatureToken = start:pos s:"feature" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
FromToken = start:pos s:"from" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
FrozenToken = start:pos s:"frozen" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
IfToken = start:pos s:"if" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
ImpliesToken = start:pos s:"implies" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
InheritToken = start:pos s:"inherit" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
InspectToken = start:pos s:"inspect" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
InvariantToken = start:pos s:"invariant" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
LikeToken = start:pos s:"like" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
LocalToken = start:pos s:"local" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
LoopToken = start:pos s:"loop" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
NotToken = start:pos s:"not" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
NoteToken = start:pos s:"note" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
ObsoleteToken = start:pos s:"obsolete" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
OldToken = start:pos s:"old" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
OnceToken = start:pos s:"once" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
OnlyToken = start:pos s:"only" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
OrToken = start:pos s:"or" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
PrecursorToken = start:pos s:"Precursor" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
RedefineToken = start:pos s:"redefine" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
RenameToken = start:pos s:"rename" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
RequireToken = start:pos s:"require" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
RescueToken = start:pos s:"rescue" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
ResultToken = start:pos s:"Result" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
RetryToken = start:pos s:"retry" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
SelectToken = start:pos s:"select" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
SeparateToken = start:pos s:"separate" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
ThenToken = start:pos s:"then" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
TrueToken = start:pos s:"True" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
TUPLEToken = start:pos s:"TUPLE" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
UndefineToken = start:pos s:"undefine" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
UntilToken = start:pos s:"until" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
VariantToken = start:pos s:"variant" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
VoidToken = start:pos s:"Void" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
WhenToken = start:pos s:"when" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }
XorToken = start:pos s:"xor" !IllegalAfterKeyword end:pos { return new eiffel.ast.Token(s, start, end); }

