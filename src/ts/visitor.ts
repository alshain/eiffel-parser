/// <reference path="ast.ts" />

module eiffel.ast {


  export class Visitor<A, R> {
    vClass(_class:Class, arg:A):R {
      return this.vDefault(_class, arg);
    }

    vFeatureList(featureList:FeatureList, arg:A):R {
      return this.vDefault(featureList, arg);
    }

    vFeature(feature:Feature, arg:A):R {
      return this.vDefault(feature, arg);
    }

    vAttr(attr:Attribute, arg:A):R {
      return this.vVarOrConstAttribute(attr, arg);
    }

    vRoutine(feature:Routine, arg:A):R {
      return this.vFeature(feature, arg);
    }

    vFunction(func: eiffel.ast.Function, arg:A):R {
      return this.vRoutine(func, arg);
    }

    vProcedure(procedure:Procedure, arg:A):R {
      return this.vRoutine(procedure, arg);
    }

    vChildren(ast:AST, arg:A):R {
      let result = null;
      ast.children.forEach(function (t:AST) {
        if (t != null) {
          result = t._acceptor.accept(this, arg);
        }
      }, this);
      return result;
    }

    vIdentifier(identifier:Identifier, arg:A):R {
      return this.vDefault(identifier, arg);
    }

    vType(type:Type, arg:A):R {
      return this.vDefault(type, arg);
    }

    vParent(parent:Parent, arg:A):R {
      return this.vDefault(parent, arg);
    }

    vInstruction(instruction:Instruction, arg:A):R {
      return this.vDefault(instruction, arg);
    }

    vDefault(ast:AST, arg:A):R {
      return this.vChildren(ast, arg);
    }

    vCreateInstruction(createInstruction:CreateInstruction, arg:A) {
      return this.vInstruction(createInstruction, arg);
    }

    vAssignment(assignment:Assignment, arg:A) {
      return this.vInstruction(assignment, arg);
    }

    vExportChangeset(exportChangeset:ExportChangeset, arg:A):R {
      return this.vDefault(exportChangeset, arg);
    }

    vPrecondition(precondition:Precondition, arg:A):R {
      return this.vCondition(precondition, arg);
    }

    vPostcondition(postcondition: Postcondition, arg:A):R {
      return this.vCondition(postcondition, arg);
    }

    vInvariantcondition(invariantcondition: Invariantcondition, arg:A):R {
      return this.vCondition(invariantcondition, arg);
    }

    vCondition(condition: Condition, arg:A):R {
      return this.vDefault(condition, arg);
    }

    vUnaryOp(unaryOp: UnaryOp, arg:A):R {
      return this.vExpression(unaryOp, arg);
    }

    vBinaryOp(binaryOp: BinaryOp, arg:A):R {
      return this.vExpression(binaryOp, arg);
    }

    vExpression(expression:Expression, arg:A):R {
      return this.vDefault(expression, arg);
    }

    vCurrentExpr(currentExpression: CurrentExpression, arg:A):R {
      return this.vDefault(currentExpression, arg);
    }

    vCreateExpression(createExpression: CreateExpression, arg:A):R {
      return this.vExpression(createExpression, arg);
    }

    vIntLiteral(intLiteral: IntLiteral, arg:A):R {
      return this.vLiteral(intLiteral, arg);
    }

    vRealLiteral(realLiteral: RealLiteral, arg:A):R {
      return this.vLiteral(realLiteral, arg);
    }

    vStringLiteral(stringLiteral: StringLiteral, arg:A):R {
      return this.vLiteral(stringLiteral, arg);
    }

    vLiteral(literal: Literal<any>, arg:A):R {
      return this.vDefault(literal, arg);
    }

    vConstantAttribute(constantAttribute: ConstantAttribute, arg:A):R {
      return this.vVarOrConstAttribute(constantAttribute, arg);
    }

    vVarOrConstAttribute(varOrConstAttribute:VarOrConstAttribute, arg:A):R {
      return this.vFeature(varOrConstAttribute, arg);
    }
    vAlias(alias: Alias, arg:A):R {
      return this.vDefault(alias, arg);
    }

    vCharLiteral(charLiteral: CharLiteral, arg:A):R {
      return this.vLiteral(charLiteral, arg);
    }

    vBooleanLiteral(booleanLiteral: BooleanLiteral, arg:A):R {
      return this.vLiteral(booleanLiteral, arg);
    }

    vVoidLiteral(voidLiteral: VoidLiteral, arg:A):R {
      return this.vLiteral(voidLiteral, arg);
    }

    vCallExpression(callExpression: CallExpression, arg:A):R {
      return this.vExpression(callExpression, arg);
    }

    vIndexExpression(indexExpression: IndexExpression, arg:A):R {
      return this.vExpression(indexExpression, arg);
    }

    vVarDeclList(varDeclList: VarDeclList, arg:A):R {
      return this.vDefault(varDeclList, arg);
    }

    vVarDeclEntry(varDeclEntry: VarDeclEntry, arg:A):R {
      return this.vDefault(varDeclEntry, arg);
    }

    vFromLoop(fromLoop: FromLoop, arg:A):R {
      return this.vInstruction(fromLoop, arg);
    }

    vIfElse(ifElse: IfElse, arg:A):R {
      return this.vInstruction(ifElse, arg);
    }

    vElseIf(elseIf: ElseIf, arg:A):R {
      return this.vInstruction(elseIf, arg);
    }

    vCheckInstruction(checkInstruction: CheckInstruction, arg:A):R {
      return this.vInstruction(checkInstruction, arg);
    }

    vExternal(external: External, arg:A):R {
      return this.vDefault(external, arg);
    }

    vResultExpression(resultExpression: ResultExpression, arg:A):R {
      return this.vDefault(resultExpression, arg);
    }

    vAnchoredType(anchoredType: AnchoredType, arg:A):R {
      return this.vDefault(anchoredType, arg);
    }

    vIdentifierAccess(identifierAccess: IdentifierAccess, arg:A):R {
      return this.vExpression(identifierAccess, arg);
    }

    vObsolete(obsolete: Obsolete, arg:A):R {
      return this.vDefault(obsolete, arg);
    }

    vAttachedExpression(attachedExpression: AttachedExpression, arg:A):R {
      return this.vExpression(attachedExpression, arg);
    }

    vTypeExpression(typeExpression: TypeExpression, arg:A):R {
      return this.vExpression(typeExpression, arg);
    }

    vParentGroup(parentGroup: ParentGroup, arg:A):R {
      return this.vDefault(parentGroup, arg);
    }

    vRoutineInstructions(routineInstructions: RoutineInstructions, arg:A):R {
      return this.vDefault(routineInstructions, arg);
    }

    vOnceBlock(onceBlock: OnceBlock, arg:A):R {
      return this.vRoutineInstructions(onceBlock, arg);
    }

    vDoBlock(doBlock: DoBlock, arg:A):R {
      return this.vRoutineInstructions(doBlock, arg);
    }

    vDeferredBlock(deferredBlock: DeferredBlock, arg:A):R {
      return this.vRoutineInstructions(deferredBlock, arg);
    }

    vUnqualifiedCallExpression(unqualifiedCallExpression: UnqualifiedCallExpression, arg:A):R {
      return this.vExpression(unqualifiedCallExpression, arg);
    }

    vLocalsBlock(localsBlock: LocalsBlock, arg:A):R {
      return this.vDefault(localsBlock, arg);
    }

    vTypeConstraint(typeConstraint: TypeConstraint, arg:A):R {
      return this.vDefault(typeConstraint, arg);
    }

    vRename(rename: Rename, arg:A):R {
      return this.vDefault(rename, arg);
    }

    vToken(token: Token, arg:A):R {
      return this.vDefault(token, arg);
    }

    vRedefines(redefines: Redefines, arg:A):R {
      return this.vDefault(redefines, arg);
    }

    vUndefines(undefines: Undefines, arg:A):R {
      return this.vDefault(undefines, arg);
    }

    vRenames(renames: Renames, arg:A):R {
      return this.vDefault(renames, arg);
    }

    vSelects(selects: Selects, arg:A):R {
      return this.vDefault(selects, arg);
    }

    vNewExports(newExports: NewExports, arg:A):R {
      return this.vDefault(newExports, arg);
    }

    vTupleExpression(tupleExpression: TupleExpression, arg:A):R {
      return this.vExpression(tupleExpression, arg);
    }

    vAll(all: All, arg:A):R {
      return this.vDefault(all, arg);
    }

    vFormalGenericParameter(formalGenericParameter: FormalGenericParameter, arg:A):R {
      return this.vDefault(formalGenericParameter, arg);
    }

    vExtendedFeatureName(extendedFeatureName: ExtendedFeatureName, arg:A):R {
      return this.vDefault(extendedFeatureName, arg);
    }

    vFrozenNameAlias(frozenNameAlias: FrozenNameAlias, arg:A):R {
      return this.vDefault(frozenNameAlias, arg);
    }

    vPrecursorCall(precursorCall: PrecursorCall, arg:A):R {
      return this.vInstruction(precursorCall, arg);
    }

    vTypeLikeFeature(typeLikeFeature: TypeLikeFeature, arg:A):R {
      return this.vDefault(typeLikeFeature, arg);
    }

    vTypeLikeCurrent(typeLikeCurrent: TypeLikeCurrent, arg:A):R {
      return this.vDefault(typeLikeCurrent, arg);
    }

    vAliasBlock(aliasBlock: AliasBlock, arg:A):R {
      return this.vDefault(aliasBlock, arg);
    }

    vAddress(address: Address, arg:A):R {
      return this.vExpression(address, arg);
    }

    vInspectInstruction(inspectInstruction: InspectInstruction, arg:A):R {
      return this.vInstruction(inspectInstruction, arg);
    }

    vWhenPart(whenPart: WhenPart, arg:A):R {
      return this.vDefault(whenPart, arg);
    }

    vLoopElement(loopElement: LoopElement, arg:A):R {
      return this.vDefault(loopElement, arg);
    }

    vAcrossAs(acrossAs: AcrossAs, arg:A):R {
      return this.vLoopElement(acrossAs, arg);
    }

    vAcrossSomeOrAll(acrossSomeOrAll: AcrossSomeOrAll, arg:A):R {
      return this.vLoopElement(acrossSomeOrAll, arg);
    }

    vAcrossSome(acrossSome: AcrossSome, arg:A):R {
      return this.vAcrossSomeOrAll(acrossSome, arg);
    }

    vAcrossAll(acrossAll: AcrossAll, arg:A):R {
      return this.vAcrossSomeOrAll(acrossAll, arg);
    }

    vLoopBody(loopInstructions: LoopBody, arg:A):R {
      return this.vLoopElement(loopInstructions, arg);
    }

    vLoopFrom(loopFrom: LoopFrom, arg:A):R {
      return this.vLoopElement(loopFrom, arg);
    }

    vLoop(loop: Loop, arg:A):R {
      return this.vInstruction(loop, arg);
    }

    vLoopUntil(loopUntil: LoopUntil, arg:A):R {
      return this.vLoopElement(loopUntil, arg);
    }

    vLoopVariant(loopVariant: LoopVariant, arg:A):R {
      return this.vLoopElement(loopVariant, arg);
    }

    vLoopInvariant(loopInvariant: LoopInvariant, arg:A):R {
      return this.vLoopElement(loopInvariant, arg);
    }

    vDebugBlock(debugBlock: DebugBlock, arg:A):R {
      return this.vInstruction(debugBlock, arg);
    }
  }
}
