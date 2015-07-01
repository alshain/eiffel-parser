/// <reference path="visitor.ts" />
/// <reference path="util.ts" />
/// <reference path="ast.ts" />
/// <reference path="fromJS.d.ts" />

module eiffel.explain {
  interface IntervalEntry {
    start: number;
    end: number;
    id: any;
  }
  export class RangeGatherer extends eiffel.ast.Visitor<eiffel.ast.AST, any> {
    constructor() {
      super();
      this.ranges = [];
    }

    ranges: IntervalEntry[];

    vDefault(ast:eiffel.ast.AST, parent: eiffel.ast.AST):any {
      if (ast.start && ast.end) {
        this.ranges.push({start: ast.start.offset, end: ast.end.offset, id: ast});
      }
      return super.vDefault(ast, ast);
    }
  }

  export class AstExplanation {
    constructor(nodeThenParentThenAncestors:eiffel.ast.AST[]) {
      if (!nodeThenParentThenAncestors) {
        console.error("AstExplainer: Missing array argument");
      }
      if (nodeThenParentThenAncestors.length === 0) {
        console.log("AstExplainer: Empty array, no node provided")
      }
      this.node = nodeThenParentThenAncestors[0];
      this.parent = nodeThenParentThenAncestors.length >= 2 ? nodeThenParentThenAncestors[1] : null;
      this.parentsThenAncestors = nodeThenParentThenAncestors.slice(1);

      if (this.node && this.parent) {
        this.context = this.parent._acceptor.accept(new ContextExplainer(), this.node);
      }
    }

    context: ContextExplanation;
    technical: TechnicalExplanation;

    node: eiffel.ast.AST;
    parent: eiffel.ast.AST;
    parentsThenAncestors: eiffel.ast.AST[];
  }

  export class ContextExplanation {
    constructor(title:string, description:string, node) {
      this.title = title;
      this.description = description;
      this.node = node;
    }

    title: string;
    description: string;
    node: eiffel.ast.AST;
  }

  export class TechnicalExplanation {

  }

  function context(mapping, ast, child) {
    console.log("Requesting context for", mapping, ast, child);
    function explainArray(key, array, explainer, ast, child) {
      if (key.endsWith("[]")) {
        var key = key.substr(0, key.length - 2);
        console.log(key);
        if (key.endsWith("[]")) {
          //if (array) {
          //  return explainArray(key, array, explainer, ast, child);
          //}
          console.error("nested arrays not supported currently");
        }
        else {
          if (array && array.length > 0) {
            var index = array.indexOf(child);
            if (index !== -1) {
              console.log("Array match found");
              explainer(ast, child, index, array);
            }
          }
          else {
            return undefined;
          }
        }
      }
      else {
        console.error("Invoked explainArray without an array");
      }
    }
    for (var key in mapping) {
      if (mapping.hasOwnProperty(key)) {
        if (key.endsWith("[]")) {
          if (ast[key] && ast[key].length) {

          }
        }
        else {
          if (ast[key] === child) {
            return mapping[key](ast, child);
          }
        }
      }
    }
    return undefined;
  }

  export class TechnicalExplainer extends eiffel.ast.Visitor<eiffel.ast.AST, any> {
    vClass(_class:eiffel.ast.Class, arg:eiffel.ast.AST):any {
      context({
        "name": () => {
          return new ContextExplanation("Classname", "This is the name of the class", arg);
        },
      }, ast, arg);
      return super.vClass(_class, arg);
    }

    vFeatureList(featureList:eiffel.ast.FeatureList, arg:eiffel.ast.AST):any {
      return super.vFeatureList(featureList, arg);
    }

    vFeature(feature:eiffel.ast.Feature, arg:eiffel.ast.AST):any {
      return super.vFeature(feature, arg);
    }

    vAttr(attr:eiffel.ast.Attribute, arg:eiffel.ast.AST):any {
      return super.vAttr(attr, arg);
    }

    vRoutine(feature:eiffel.ast.Routine, arg:eiffel.ast.AST):any {
      return super.vRoutine(feature, arg);
    }

    vFunction(func:eiffel.ast.Function, arg:eiffel.ast.AST):any {
      return super.vFunction(func, arg);
    }

    vProcedure(procedure:eiffel.ast.Procedure, arg:eiffel.ast.AST):any {
      return super.vProcedure(procedure, arg);
    }

    vChildren(ast:eiffel.ast.AST, arg:eiffel.ast.AST):any {
      return super.vChildren(ast, arg);
    }

    vIdentifier(identifier:eiffel.ast.Identifier, arg:eiffel.ast.AST):any {
      return "An 'identifier' is a name";
    }

    vType(type:eiffel.ast.Type, arg:eiffel.ast.AST):any {
      return super.vType(type, arg);
    }

    vParent(parent:eiffel.ast.Parent, arg:eiffel.ast.AST):any {
      return "This specifies a type, from which the class features, which can be modified with adaptions."
    }

    vInstruction(instruction:eiffel.ast.Instruction, arg:eiffel.ast.AST):any {
      return super.vInstruction(instruction, arg);
    }

    vDefault(ast:eiffel.ast.AST, arg:eiffel.ast.AST):any {
      // Do not recurse
      return undefined;
    }

    vCreateInstruction(createInstruction:eiffel.ast.CreateInstruction, arg:eiffel.ast.AST):any {
      return super.vCreateInstruction(createInstruction, arg);
    }

    vAssignment(assignment:eiffel.ast.SetterAssignment, arg:eiffel.ast.AST):any {
      return super.vSetterAssignment(assignment, arg);
    }

    vExportChangeset(exportChangeset:eiffel.ast.ExportChangeset, arg:eiffel.ast.AST):any {
      return super.vExportChangeset(exportChangeset, arg);
    }

    vPrecondition(precondition:eiffel.ast.Precondition, arg:eiffel.ast.AST):any {
      return super.vPrecondition(precondition, arg);
    }

    vPostcondition(postcondition:eiffel.ast.Postcondition, arg:eiffel.ast.AST):any {
      return super.vPostcondition(postcondition, arg);
    }

    vInvariantcondition(invariantcondition:eiffel.ast.Invariantcondition, arg:eiffel.ast.AST):any {
      return super.vInvariantcondition(invariantcondition, arg);
    }

    vCondition(condition:eiffel.ast.Condition, arg:eiffel.ast.AST):any {
      return super.vCondition(condition, arg);
    }

    vUnaryOp(unaryOp:eiffel.ast.UnaryOp, arg:eiffel.ast.AST):any {
      return super.vUnaryOp(unaryOp, arg);
    }

    vBinaryOp(binaryOp:eiffel.ast.BinaryOp, arg:eiffel.ast.AST):any {
      return super.vBinaryOp(binaryOp, arg);
    }

    vExpression(expression:eiffel.ast.Expression, arg:eiffel.ast.AST):any {
      return super.vExpression(expression, arg);
    }

    vCurrentExpr(currentExpression:eiffel.ast.CurrentExpression, arg:eiffel.ast.AST):any {
      return super.vCurrentExpr(currentExpression, arg);
    }

    vCreateExpression(createExpression:eiffel.ast.CreateExpression, arg:eiffel.ast.AST):any {
      return super.vCreateExpression(createExpression, arg);
    }

    vIntLiteral(intLiteral:eiffel.ast.IntLiteral, arg:eiffel.ast.AST):any {
      return super.vIntLiteral(intLiteral, arg);
    }

    vRealLiteral(realLiteral:eiffel.ast.RealLiteral, arg:eiffel.ast.AST):any {
      return super.vRealLiteral(realLiteral, arg);
    }

    vStringLiteral(stringLiteral:eiffel.ast.StringLiteral, arg:eiffel.ast.AST):any {
      return super.vStringLiteral(stringLiteral, arg);
    }

    vLiteral(literal:eiffel.ast.Literal<any>, arg:eiffel.ast.AST):any {
      return super.vLiteral(literal, arg);
    }

    vConstantAttribute(constantAttribute:eiffel.ast.ConstantAttribute, arg:eiffel.ast.AST):any {
      return super.vConstantAttribute(constantAttribute, arg);
    }

    vVarOrConstAttribute(varOrConstAttribute:eiffel.ast.VarOrConstAttribute, arg:eiffel.ast.AST):any {
      return super.vVarOrConstAttribute(varOrConstAttribute, arg);
    }

    vAlias(alias:eiffel.ast.Alias, arg:eiffel.ast.AST):any {
      return super.vAlias(alias, arg);
    }

    vCharLiteral(charLiteral:eiffel.ast.CharLiteral, arg:eiffel.ast.AST):any {
      return super.vCharLiteral(charLiteral, arg);
    }

    vBooleanLiteral(booleanLiteral:eiffel.ast.BooleanLiteral, arg:eiffel.ast.AST):any {
      return super.vBooleanLiteral(booleanLiteral, arg);
    }

    vVoidLiteral(voidLiteral:eiffel.ast.VoidLiteral, arg:eiffel.ast.AST):any {
      return super.vVoidLiteral(voidLiteral, arg);
    }

    vCallExpression(callExpression:eiffel.ast.CallExpression, arg:eiffel.ast.AST):any {
      return super.vCallExpression(callExpression, arg);
    }

    vIndexExpression(indexExpression:eiffel.ast.IndexExpression, arg:eiffel.ast.AST):any {
      return super.vIndexExpression(indexExpression, arg);
    }

    vVarDeclList(varDeclList:eiffel.ast.VarDeclList, arg:eiffel.ast.AST):any {
      return super.vVarDeclList(varDeclList, arg);
    }

    vVarDeclEntry(varDeclEntry:eiffel.ast.VarDeclEntry, arg:eiffel.ast.AST):any {
      return super.vVarDeclEntry(varDeclEntry, arg);
    }

    vFromLoop(fromLoop:eiffel.ast.FromLoop, arg:eiffel.ast.AST):any {
      return super.vFromLoop(fromLoop, arg);
    }

    vIfElse(ifElse:eiffel.ast.IfElse, arg:eiffel.ast.AST):any {
      return super.vIfElse(ifElse, arg);
    }

    vElseIf(elseIf:eiffel.ast.ElseIf, arg:eiffel.ast.AST):any {
      return super.vElseIf(elseIf, arg);
    }

    vCheckInstruction(checkInstruction:eiffel.ast.CheckInstruction, arg:eiffel.ast.AST):any {
      return super.vCheckInstruction(checkInstruction, arg);
    }

    vExternalBlock(externalBlock:eiffel.ast.ExternalBlock, arg:eiffel.ast.AST):any {
      return super.vExternalBlock(externalBlock, arg);
    }

    vResultExpression(resultExpression:eiffel.ast.ResultExpression, arg:eiffel.ast.AST):any {
      return super.vResultExpression(resultExpression, arg);
    }

    vAnchoredType(anchoredType:eiffel.ast.AnchoredType, arg:eiffel.ast.AST):any {
      return super.vAnchoredType(anchoredType, arg);
    }

    vIdentifierAccess(identifierAccess:eiffel.ast.IdentifierAccess, arg:eiffel.ast.AST):any {
      return super.vIdentifierAccess(identifierAccess, arg);
    }

    vObsoleteBlock(obsoleteBlock:eiffel.ast.ObsoleteBlock, arg:eiffel.ast.AST):any {
      return super.vObsoleteBlock(obsoleteBlock, arg);
    }

    vAttachedExpression(attachedExpression:eiffel.ast.AttachedExpression, arg:eiffel.ast.AST):any {
      return super.vAttachedExpression(attachedExpression, arg);
    }

    vTypeExpression(typeExpression:eiffel.ast.TypeExpression, arg:eiffel.ast.AST):any {
      return super.vTypeExpression(typeExpression, arg);
    }

    vParentGroup(parentGroup:eiffel.ast.ParentGroup, arg:eiffel.ast.AST):any {
      return super.vParentGroup(parentGroup, arg);
    }

    vRoutineInstructions(routineInstructions:eiffel.ast.RoutineInstructions, arg:eiffel.ast.AST):any {
      return super.vRoutineInstructions(routineInstructions, arg);
    }

    vOnceBlock(onceBlock:eiffel.ast.OnceBlock, arg:eiffel.ast.AST):any {
      return super.vOnceBlock(onceBlock, arg);
    }

    vDoBlock(doBlock:eiffel.ast.DoBlock, arg:eiffel.ast.AST):any {
      return super.vDoBlock(doBlock, arg);
    }

    vDeferredBlock(deferredBlock:eiffel.ast.DeferredBlock, arg:eiffel.ast.AST):any {
      return super.vDeferredBlock(deferredBlock, arg);
    }

    vPreconditionBlock(preconditionBlock:eiffel.ast.PreconditionBlock, arg:eiffel.ast.AST):any {
      return super.vPreconditionBlock(preconditionBlock, arg);
    }

    vConditionBlock(conditionBlock:eiffel.ast.ConditionBlock, arg:eiffel.ast.AST):any {
      return super.vConditionBlock(conditionBlock, arg);
    }

    vPostconditionBlock(postconditionBlock:eiffel.ast.PostconditionBlock, arg:eiffel.ast.AST):any {
      return super.vPostconditionBlock(postconditionBlock, arg);
    }

    vUnqualifiedCallExpression(unqualifiedCallExpression:eiffel.ast.UnqualifiedCallExpression, arg:eiffel.ast.AST):any {
      return super.vUnqualifiedCallExpression(unqualifiedCallExpression, arg);
    }

    vLocalsBlock(localsBlock:eiffel.ast.LocalsBlock, arg:eiffel.ast.AST):any {
      return super.vLocalsBlock(localsBlock, arg);
    }

    vTypeConstraint(typeConstraint:eiffel.ast.TypeConstraint, arg:eiffel.ast.AST):any {
      return super.vTypeConstraint(typeConstraint, arg);
    }

    vRename(rename:eiffel.ast.Rename, arg:eiffel.ast.AST):any {
      return super.vRename(rename, arg);
    }

    vToken(token:eiffel.ast.Token, arg:eiffel.ast.AST):any {
      return super.vToken(token, arg);
    }

    vRedefines(redefines:eiffel.ast.Redefines, arg:eiffel.ast.AST):any {
      return super.vRedefines(redefines, arg);
    }

    vUndefines(undefines:eiffel.ast.Undefines, arg:eiffel.ast.AST):any {
      return super.vUndefines(undefines, arg);
    }

    vRenames(renames:eiffel.ast.Renames, arg:eiffel.ast.AST):any {
      return super.vRenames(renames, arg);
    }

    vSelects(selects:eiffel.ast.Selects, arg:eiffel.ast.AST):any {
      return super.vSelects(selects, arg);
    }

    vNewExports(newExports:eiffel.ast.NewExports, arg:eiffel.ast.AST):any {
      return super.vNewExports(newExports, arg);
    }

    vTupleExpression(tupleExpression:eiffel.ast.TupleExpression, arg:eiffel.ast.AST):any {
      return super.vTupleExpression(tupleExpression, arg);
    }

    vAll(all:eiffel.ast.All, arg:eiffel.ast.AST):any {
      return super.vAll(all, arg);
    }

    vFormalGenericParameter(formalGenericParameter:eiffel.ast.FormalGenericParameter, arg:eiffel.ast.AST):any {
      return super.vFormalGenericParameter(formalGenericParameter, arg);
    }

    vExtendedFeatureName(extendedFeatureName:eiffel.ast.ExtendedFeatureName, arg:eiffel.ast.AST):any {
      return explain({
        name: () => {
          return "This is the name of the feature."
        }
      }, extendedFeatureName, arg);
    }

    vFrozenNameAlias(frozenNameAlias:eiffel.ast.FrozenNameAlias, arg:eiffel.ast.AST):any {
      return super.vFrozenNameAlias(frozenNameAlias, arg);
    }

    vPrecursorCall(precursorCall:eiffel.ast.PrecursorCall, arg:eiffel.ast.AST):any {
      return super.vPrecursorCall(precursorCall, arg);
    }

    vTypeLikeFeature(typeLikeFeature:eiffel.ast.TypeLikeFeature, arg:eiffel.ast.AST):any {
      return super.vTypeLikeFeature(typeLikeFeature, arg);
    }

    vTypeLikeCurrent(typeLikeCurrent:eiffel.ast.TypeLikeCurrent, arg:eiffel.ast.AST):any {
      return super.vTypeLikeCurrent(typeLikeCurrent, arg);
    }

    vAliasBlock(aliasBlock:eiffel.ast.AliasBlock, arg:eiffel.ast.AST):any {
      return super.vAliasBlock(aliasBlock, arg);
    }

    vAddress(address:eiffel.ast.Address, arg:eiffel.ast.AST):any {
      return super.vAddress(address, arg);
    }

    vInspectInstruction(inspectInstruction:eiffel.ast.InspectInstruction, arg:eiffel.ast.AST):any {
      return super.vInspectInstruction(inspectInstruction, arg);
    }

    vWhenPart(whenPart:eiffel.ast.WhenPart, arg:eiffel.ast.AST):any {
      return super.vWhenPart(whenPart, arg);
    }

    vLoopElement(loopElement:eiffel.ast.LoopElement, arg:eiffel.ast.AST):any {
      return super.vLoopElement(loopElement, arg);
    }

    vAcrossAs(acrossAs:eiffel.ast.AcrossAs, arg:eiffel.ast.AST):any {
      return super.vAcrossAs(acrossAs, arg);
    }

    vAcrossSomeOrAll(acrossSomeOrAll:eiffel.ast.AcrossSomeOrAll, arg:eiffel.ast.AST):any {
      return super.vAcrossSomeOrAll(acrossSomeOrAll, arg);
    }

    vAcrossSome(acrossSome:eiffel.ast.AcrossSome, arg:eiffel.ast.AST):any {
      return super.vAcrossSome(acrossSome, arg);
    }

    vAcrossAll(acrossAll:eiffel.ast.AcrossAll, arg:eiffel.ast.AST):any {
      return super.vAcrossAll(acrossAll, arg);
    }

    vLoopBody(loopInstructions:eiffel.ast.LoopBody, arg:eiffel.ast.AST):any {
      return super.vLoopBody(loopInstructions, arg);
    }

    vLoopFrom(loopFrom:eiffel.ast.LoopFrom, arg:eiffel.ast.AST):any {
      return super.vLoopFrom(loopFrom, arg);
    }

    vLoop(loop:eiffel.ast.Loop, arg:eiffel.ast.AST):any {
      return super.vLoop(loop, arg);
    }

    vLoopUntil(loopUntil:eiffel.ast.LoopUntil, arg:eiffel.ast.AST):any {
      return super.vLoopUntil(loopUntil, arg);
    }

    vLoopVariant(loopVariant:eiffel.ast.LoopVariant, arg:eiffel.ast.AST):any {
      return super.vLoopVariant(loopVariant, arg);
    }

    vLoopInvariant(loopInvariant:eiffel.ast.LoopInvariant, arg:eiffel.ast.AST):any {
      return super.vLoopInvariant(loopInvariant, arg);
    }

    vDebugBlock(debugBlock:eiffel.ast.DebugBlock, arg:eiffel.ast.AST):any {
      return super.vDebugBlock(debugBlock, arg);
    }

    vManifestConstant(manifestConstant:eiffel.ast.ManifestConstant, arg:eiffel.ast.AST):any {
      return super.vManifestConstant(manifestConstant, arg);
    }

    vNonObjectCall(nonObjectCall:eiffel.ast.NonObjectCall, arg:eiffel.ast.AST):any {
      return super.vNonObjectCall(nonObjectCall, arg);
    }

    vNoOp(noOp:eiffel.ast.NoOp, arg:eiffel.ast.AST):any {
      return super.vNoOp(noOp, arg);
    }

    vCreationClause(creationClause:eiffel.ast.CreationClause, arg:eiffel.ast.AST):any {
      return super.vCreationClause(creationClause, arg);
    }

    vAgentCall(agentCall:eiffel.ast.AgentCall, arg:eiffel.ast.AST):any {
      return super.vAgentCall(agentCall, arg);
    }
  }

  export class ContextExplainer extends eiffel.ast.Visitor<eiffel.ast.AST,  ContextExplanation> {

    vClass(_class:eiffel.ast.Class, arg:eiffel.ast.AST): ContextExplanation {
      return context({
        name: () => {
          console.log("Explained class Name");
          return new ContextExplanation("Classname", "This is the name of the class", arg);
        },
      }, _class, arg);
    }

    vFeatureList(featureList:eiffel.ast.FeatureList, arg:eiffel.ast.AST): ContextExplanation {
      return super.vFeatureList(featureList, arg);
    }

    vFeature(feature:eiffel.ast.Feature, arg:eiffel.ast.AST): ContextExplanation {
      return context({
        "rawType": () => {
          return new ContextExplanation("Type of feature", "This is the type of object you will receive when calling this feature", arg);
        }
      }, feature, arg);
    }

    vAttr(attr:eiffel.ast.Attribute, arg:eiffel.ast.AST): ContextExplanation {
      return super.vAttr(attr, arg);
    }

    vRoutine(feature:eiffel.ast.Routine, arg:eiffel.ast.AST): ContextExplanation {
      return super.vRoutine(feature, arg);
    }

    vFunction(func:eiffel.ast.Function, arg:eiffel.ast.AST): ContextExplanation {
      return super.vFunction(func, arg);
    }

    vProcedure(procedure:eiffel.ast.Procedure, arg:eiffel.ast.AST): ContextExplanation {
      return super.vProcedure(procedure, arg);
    }

    vChildren(ast:eiffel.ast.AST, arg:eiffel.ast.AST): ContextExplanation {
      return super.vChildren(ast, arg);
    }

    vIdentifier(identifier:eiffel.ast.Identifier, arg:eiffel.ast.AST): ContextExplanation {
      return super.vIdentifier(identifier, arg);
    }

    vType(type:eiffel.ast.Type, arg:eiffel.ast.AST): ContextExplanation {
      return super.vType(type, arg);
    }

    vParent(parent:eiffel.ast.Parent, arg:eiffel.ast.AST): ContextExplanation {
      return super.vParent(parent, arg);
    }

    vInstruction(instruction:eiffel.ast.Instruction, arg:eiffel.ast.AST): ContextExplanation {
      return super.vInstruction(instruction, arg);
    }

    vDefault(ast:eiffel.ast.AST, arg:eiffel.ast.AST): ContextExplanation {
      // Do not recurse
      return null;
    }

    vCreateInstruction(createInstruction:eiffel.ast.CreateInstruction, arg:eiffel.ast.AST): ContextExplanation {
      return super.vCreateInstruction(createInstruction, arg);
    }

    vSetterAssignment(assignment:eiffel.ast.SetterAssignment, arg:eiffel.ast.AST): ContextExplanation {
      return super.vSetterAssignment(assignment, arg);
    }

    vExportChangeset(exportChangeset:eiffel.ast.ExportChangeset, arg:eiffel.ast.AST): ContextExplanation {
      return super.vExportChangeset(exportChangeset, arg);
    }

    vPrecondition(precondition:eiffel.ast.Precondition, arg:eiffel.ast.AST): ContextExplanation {
      return super.vPrecondition(precondition, arg);
    }

    vPostcondition(postcondition:eiffel.ast.Postcondition, arg:eiffel.ast.AST): ContextExplanation {
      return super.vPostcondition(postcondition, arg);
    }

    vInvariantcondition(invariantcondition:eiffel.ast.Invariantcondition, arg:eiffel.ast.AST): ContextExplanation {
      return super.vInvariantcondition(invariantcondition, arg);
    }

    vCondition(condition:eiffel.ast.Condition, arg:eiffel.ast.AST): ContextExplanation {
      return super.vCondition(condition, arg);
    }

    vUnaryOp(unaryOp:eiffel.ast.UnaryOp, arg:eiffel.ast.AST): ContextExplanation {
      return super.vUnaryOp(unaryOp, arg);
    }

    vBinaryOp(binaryOp:eiffel.ast.BinaryOp, arg:eiffel.ast.AST): ContextExplanation {
      return super.vBinaryOp(binaryOp, arg);
    }

    vExpression(expression:eiffel.ast.Expression, arg:eiffel.ast.AST): ContextExplanation {
      return super.vExpression(expression, arg);
    }

    vCurrentExpr(currentExpression:eiffel.ast.CurrentExpression, arg:eiffel.ast.AST): ContextExplanation {
      return super.vCurrentExpr(currentExpression, arg);
    }

    vCreateExpression(createExpression:eiffel.ast.CreateExpression, arg:eiffel.ast.AST): ContextExplanation {
      return super.vCreateExpression(createExpression, arg);
    }

    vIntLiteral(intLiteral:eiffel.ast.IntLiteral, arg:eiffel.ast.AST): ContextExplanation {
      return super.vIntLiteral(intLiteral, arg);
    }

    vRealLiteral(realLiteral:eiffel.ast.RealLiteral, arg:eiffel.ast.AST): ContextExplanation {
      return super.vRealLiteral(realLiteral, arg);
    }

    vStringLiteral(stringLiteral:eiffel.ast.StringLiteral, arg:eiffel.ast.AST): ContextExplanation {
      return super.vStringLiteral(stringLiteral, arg);
    }

    vLiteral(literal:eiffel.ast.Literal< ContextExplanation>, arg:eiffel.ast.AST): ContextExplanation {
      return super.vLiteral(literal, arg);
    }

    vConstantAttribute(constantAttribute:eiffel.ast.ConstantAttribute, arg:eiffel.ast.AST): ContextExplanation {
      return super.vConstantAttribute(constantAttribute, arg);
    }

    vVarOrConstAttribute(varOrConstAttribute:eiffel.ast.VarOrConstAttribute, arg:eiffel.ast.AST): ContextExplanation {
      return super.vVarOrConstAttribute(varOrConstAttribute, arg);
    }

    vAlias(alias:eiffel.ast.Alias, arg:eiffel.ast.AST): ContextExplanation {
      return super.vAlias(alias, arg);
    }

    vCharLiteral(charLiteral:eiffel.ast.CharLiteral, arg:eiffel.ast.AST): ContextExplanation {
      return super.vCharLiteral(charLiteral, arg);
    }

    vBooleanLiteral(booleanLiteral:eiffel.ast.BooleanLiteral, arg:eiffel.ast.AST): ContextExplanation {
      return super.vBooleanLiteral(booleanLiteral, arg);
    }

    vVoidLiteral(voidLiteral:eiffel.ast.VoidLiteral, arg:eiffel.ast.AST): ContextExplanation {
      return super.vVoidLiteral(voidLiteral, arg);
    }

    vCallExpression(callExpression:eiffel.ast.CallExpression, arg:eiffel.ast.AST): ContextExplanation {
      return super.vCallExpression(callExpression, arg);
    }

    vIndexExpression(indexExpression:eiffel.ast.IndexExpression, arg:eiffel.ast.AST): ContextExplanation {
      return super.vIndexExpression(indexExpression, arg);
    }

    vVarDeclList(varDeclList:eiffel.ast.VarDeclList, arg:eiffel.ast.AST): ContextExplanation {
      return super.vVarDeclList(varDeclList, arg);
    }

    vVarDeclEntry(varDeclEntry:eiffel.ast.VarDeclEntry, arg:eiffel.ast.AST): ContextExplanation {
      return super.vVarDeclEntry(varDeclEntry, arg);
    }

    vFromLoop(fromLoop:eiffel.ast.FromLoop, arg:eiffel.ast.AST): ContextExplanation {
      return super.vFromLoop(fromLoop, arg);
    }

    vIfElse(ifElse:eiffel.ast.IfElse, arg:eiffel.ast.AST): ContextExplanation {
      return super.vIfElse(ifElse, arg);
    }

    vElseIf(elseIf:eiffel.ast.ElseIf, arg:eiffel.ast.AST): ContextExplanation {
      return super.vElseIf(elseIf, arg);
    }

    vCheckInstruction(checkInstruction:eiffel.ast.CheckInstruction, arg:eiffel.ast.AST): ContextExplanation {
      return super.vCheckInstruction(checkInstruction, arg);
    }

    vExternalBlock(externalBlock:eiffel.ast.ExternalBlock, arg:eiffel.ast.AST): ContextExplanation {
      return super.vExternalBlock(externalBlock, arg);
    }

    vResultExpression(resultExpression:eiffel.ast.ResultExpression, arg:eiffel.ast.AST): ContextExplanation {
      return super.vResultExpression(resultExpression, arg);
    }

    vAnchoredType(anchoredType:eiffel.ast.AnchoredType, arg:eiffel.ast.AST): ContextExplanation {
      return super.vAnchoredType(anchoredType, arg);
    }

    vIdentifierAccess(identifierAccess:eiffel.ast.IdentifierAccess, arg:eiffel.ast.AST): ContextExplanation {
      return super.vIdentifierAccess(identifierAccess, arg);
    }

    vObsoleteBlock(obsoleteBlock:eiffel.ast.ObsoleteBlock, arg:eiffel.ast.AST): ContextExplanation {
      return super.vObsoleteBlock(obsoleteBlock, arg);
    }

    vAttachedExpression(attachedExpression:eiffel.ast.AttachedExpression, arg:eiffel.ast.AST): ContextExplanation {
      return super.vAttachedExpression(attachedExpression, arg);
    }

    vTypeExpression(typeExpression:eiffel.ast.TypeExpression, arg:eiffel.ast.AST): ContextExplanation {
      return super.vTypeExpression(typeExpression, arg);
    }

    vParentGroup(parentGroup:eiffel.ast.ParentGroup, arg:eiffel.ast.AST): ContextExplanation {
      return super.vParentGroup(parentGroup, arg);
    }

    vRoutineInstructions(routineInstructions:eiffel.ast.RoutineInstructions, arg:eiffel.ast.AST): ContextExplanation {
      return super.vRoutineInstructions(routineInstructions, arg);
    }

    vOnceBlock(onceBlock:eiffel.ast.OnceBlock, arg:eiffel.ast.AST): ContextExplanation {
      return super.vOnceBlock(onceBlock, arg);
    }

    vDoBlock(doBlock:eiffel.ast.DoBlock, arg:eiffel.ast.AST): ContextExplanation {
      return super.vDoBlock(doBlock, arg);
    }

    vDeferredBlock(deferredBlock:eiffel.ast.DeferredBlock, arg:eiffel.ast.AST): ContextExplanation {
      return super.vDeferredBlock(deferredBlock, arg);
    }

    vPreconditionBlock(preconditionBlock:eiffel.ast.PreconditionBlock, arg:eiffel.ast.AST): ContextExplanation {
      return super.vPreconditionBlock(preconditionBlock, arg);
    }

    vConditionBlock(conditionBlock:eiffel.ast.ConditionBlock, arg:eiffel.ast.AST): ContextExplanation {
      return super.vConditionBlock(conditionBlock, arg);
    }

    vPostconditionBlock(postconditionBlock:eiffel.ast.PostconditionBlock, arg:eiffel.ast.AST): ContextExplanation {
      return super.vPostconditionBlock(postconditionBlock, arg);
    }

    vUnqualifiedCallExpression(unqualifiedCallExpression:eiffel.ast.UnqualifiedCallExpression, arg:eiffel.ast.AST): ContextExplanation {
      return super.vUnqualifiedCallExpression(unqualifiedCallExpression, arg);
    }

    vLocalsBlock(localsBlock:eiffel.ast.LocalsBlock, arg:eiffel.ast.AST): ContextExplanation {
      return super.vLocalsBlock(localsBlock, arg);
    }

    vTypeConstraint(typeConstraint:eiffel.ast.TypeConstraint, arg:eiffel.ast.AST): ContextExplanation {
      return super.vTypeConstraint(typeConstraint, arg);
    }

    vRename(rename:eiffel.ast.Rename, arg:eiffel.ast.AST): ContextExplanation {
      return super.vRename(rename, arg);
    }

    vToken(token:eiffel.ast.Token, arg:eiffel.ast.AST): ContextExplanation {
      return super.vToken(token, arg);
    }

    vRedefines(redefines:eiffel.ast.Redefines, arg:eiffel.ast.AST): ContextExplanation {
      return super.vRedefines(redefines, arg);
    }

    vUndefines(undefines:eiffel.ast.Undefines, arg:eiffel.ast.AST): ContextExplanation {
      return super.vUndefines(undefines, arg);
    }

    vRenames(renames:eiffel.ast.Renames, arg:eiffel.ast.AST): ContextExplanation {
      return super.vRenames(renames, arg);
    }

    vSelects(selects:eiffel.ast.Selects, arg:eiffel.ast.AST): ContextExplanation {
      return super.vSelects(selects, arg);
    }

    vNewExports(newExports:eiffel.ast.NewExports, arg:eiffel.ast.AST): ContextExplanation {
      return super.vNewExports(newExports, arg);
    }

    vTupleExpression(tupleExpression:eiffel.ast.TupleExpression, arg:eiffel.ast.AST): ContextExplanation {
      return super.vTupleExpression(tupleExpression, arg);
    }

    vAll(all:eiffel.ast.All, arg:eiffel.ast.AST): ContextExplanation {
      return super.vAll(all, arg);
    }

    vFormalGenericParameter(formalGenericParameter:eiffel.ast.FormalGenericParameter, arg:eiffel.ast.AST): ContextExplanation {
      return super.vFormalGenericParameter(formalGenericParameter, arg);
    }

    vExtendedFeatureName(extendedFeatureName:eiffel.ast.ExtendedFeatureName, arg:eiffel.ast.AST): ContextExplanation {
      return context({
        name: () => {
          return "This is the name of the feature."
        }
      }, extendedFeatureName, arg);
    }

    vFrozenNameAlias(frozenNameAlias:eiffel.ast.FrozenNameAlias, arg:eiffel.ast.AST): ContextExplanation {
      return super.vFrozenNameAlias(frozenNameAlias, arg);
    }

    vPrecursorCall(precursorCall:eiffel.ast.PrecursorCall, arg:eiffel.ast.AST): ContextExplanation {
      return super.vPrecursorCall(precursorCall, arg);
    }

    vTypeLikeFeature(typeLikeFeature:eiffel.ast.TypeLikeFeature, arg:eiffel.ast.AST): ContextExplanation {
      return super.vTypeLikeFeature(typeLikeFeature, arg);
    }

    vTypeLikeCurrent(typeLikeCurrent:eiffel.ast.TypeLikeCurrent, arg:eiffel.ast.AST): ContextExplanation {
      return super.vTypeLikeCurrent(typeLikeCurrent, arg);
    }

    vAliasBlock(aliasBlock:eiffel.ast.AliasBlock, arg:eiffel.ast.AST): ContextExplanation {
      return super.vAliasBlock(aliasBlock, arg);
    }

    vAddress(address:eiffel.ast.Address, arg:eiffel.ast.AST): ContextExplanation {
      return super.vAddress(address, arg);
    }

    vInspectInstruction(inspectInstruction:eiffel.ast.InspectInstruction, arg:eiffel.ast.AST): ContextExplanation {
      return super.vInspectInstruction(inspectInstruction, arg);
    }

    vWhenPart(whenPart:eiffel.ast.WhenPart, arg:eiffel.ast.AST): ContextExplanation {
      return super.vWhenPart(whenPart, arg);
    }

    vLoopElement(loopElement:eiffel.ast.LoopElement, arg:eiffel.ast.AST): ContextExplanation {
      return super.vLoopElement(loopElement, arg);
    }

    vAcrossAs(acrossAs:eiffel.ast.AcrossAs, arg:eiffel.ast.AST): ContextExplanation {
      return super.vAcrossAs(acrossAs, arg);
    }

    vAcrossSomeOrAll(acrossSomeOrAll:eiffel.ast.AcrossSomeOrAll, arg:eiffel.ast.AST): ContextExplanation {
      return super.vAcrossSomeOrAll(acrossSomeOrAll, arg);
    }

    vAcrossSome(acrossSome:eiffel.ast.AcrossSome, arg:eiffel.ast.AST): ContextExplanation {
      return super.vAcrossSome(acrossSome, arg);
    }

    vAcrossAll(acrossAll:eiffel.ast.AcrossAll, arg:eiffel.ast.AST): ContextExplanation {
      return super.vAcrossAll(acrossAll, arg);
    }

    vLoopBody(loopInstructions:eiffel.ast.LoopBody, arg:eiffel.ast.AST): ContextExplanation {
      return super.vLoopBody(loopInstructions, arg);
    }

    vLoopFrom(loopFrom:eiffel.ast.LoopFrom, arg:eiffel.ast.AST): ContextExplanation {
      return super.vLoopFrom(loopFrom, arg);
    }

    vLoop(loop:eiffel.ast.Loop, arg:eiffel.ast.AST): ContextExplanation {
      return super.vLoop(loop, arg);
    }

    vLoopUntil(loopUntil:eiffel.ast.LoopUntil, arg:eiffel.ast.AST): ContextExplanation {
      return super.vLoopUntil(loopUntil, arg);
    }

    vLoopVariant(loopVariant:eiffel.ast.LoopVariant, arg:eiffel.ast.AST): ContextExplanation {
      return super.vLoopVariant(loopVariant, arg);
    }

    vLoopInvariant(loopInvariant:eiffel.ast.LoopInvariant, arg:eiffel.ast.AST): ContextExplanation {
      return super.vLoopInvariant(loopInvariant, arg);
    }

    vDebugBlock(debugBlock:eiffel.ast.DebugBlock, arg:eiffel.ast.AST): ContextExplanation {
      return super.vDebugBlock(debugBlock, arg);
    }

    vManifestConstant(manifestConstant:eiffel.ast.ManifestConstant, arg:eiffel.ast.AST): ContextExplanation {
      return super.vManifestConstant(manifestConstant, arg);
    }

    vNonObjectCall(nonObjectCall:eiffel.ast.NonObjectCall, arg:eiffel.ast.AST): ContextExplanation {
      return super.vNonObjectCall(nonObjectCall, arg);
    }

    vNoOp(noOp:eiffel.ast.NoOp, arg:eiffel.ast.AST): ContextExplanation {
      return super.vNoOp(noOp, arg);
    }

    vCreationClause(creationClause:eiffel.ast.CreationClause, arg:eiffel.ast.AST): ContextExplanation {
      return super.vCreationClause(creationClause, arg);
    }

    vAgentCall(agentCall:eiffel.ast.AgentCall, arg:eiffel.ast.AST): ContextExplanation {
      return super.vAgentCall(agentCall, arg);
    }
  }
}
