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

    vExportChangeSet(exportChangeSet:ExportChangeSet, arg:A):R {
      return this.vDefault(exportChangeSet, arg);
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

    vIntLiteral(intLiteral: IntLiteral, arg:A):R {
      return this.vLiteral(intLiteral, arg);
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

    vExternal(external: External, arg:A):R {
      return null;
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
      return null;
    }

    vAttachedExpression(attachedExpression: AttachedExpression, arg:A):R {
      return this.vExpression(attachedExpression, arg);
    }
  }
}
