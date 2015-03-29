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
        result = t._acceptor.accept(this, arg);
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

    vParameter(parameter:Parameter, arg:A):R {
      return this.vDefault(parameter, arg);
    }

    vInstruction(instruction:Instruction, arg:A):R {
      return this.vDefault(instruction, arg);
    }

    vDefault(ast:AST, arg:A):R {
      return this.vChildren(ast, arg);
    }

    vCreationClause(creationClause:CreationClause, arg:A) {
      return this.vInstruction(creationClause, arg);
    }

    vCreateInstruction(createInstruction:CreateInstruction, arg:A) {
      return this.vInstruction(createInstruction, arg);
    }

    vIfElse(ifElse:IfElse, arg:A) {
      return this.vInstruction(ifElse, arg);
    }

    vAssignment(assignment:Assignment, arg:A) {
      return this.vInstruction(assignment, arg);
    }

    vForUntil(forUntil:ForUntilInstruction, arg:A) {
      return this.vInstruction(forUntil, arg);
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
  }
}
