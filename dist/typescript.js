/// <reference path="ast.ts" />
var eiffel;
(function (eiffel) {
    var ast;
    (function (_ast) {
        var Visitor = (function () {
            function Visitor() {}
            Visitor.prototype.vClass = function (_class, arg) {
                return this.vDefault(_class, arg);
            };
            Visitor.prototype.vFeatureList = function (featureList, arg) {
                return this.vDefault(featureList, arg);
            };
            Visitor.prototype.vFeature = function (feature, arg) {
                return this.vDefault(feature, arg);
            };
            Visitor.prototype.vAttr = function (attr, arg) {
                return this.vVarOrConstAttribute(attr, arg);
            };
            Visitor.prototype.vRoutine = function (feature, arg) {
                return this.vFeature(feature, arg);
            };
            Visitor.prototype.vFunction = function (func, arg) {
                return this.vRoutine(func, arg);
            };
            Visitor.prototype.vProcedure = function (procedure, arg) {
                return this.vRoutine(procedure, arg);
            };
            Visitor.prototype.vChildren = function (ast, arg) {
                var result = null;
                ast.children.forEach(function (t) {
                    result = t._acceptor.accept(this, arg);
                }, this);
                return result;
            };
            Visitor.prototype.vIdentifier = function (identifier, arg) {
                return this.vDefault(identifier, arg);
            };
            Visitor.prototype.vType = function (type, arg) {
                return this.vDefault(type, arg);
            };
            Visitor.prototype.vParent = function (parent, arg) {
                return this.vDefault(parent, arg);
            };
            Visitor.prototype.vParameter = function (parameter, arg) {
                return this.vDefault(parameter, arg);
            };
            Visitor.prototype.vInstruction = function (instruction, arg) {
                return this.vDefault(instruction, arg);
            };
            Visitor.prototype.vDefault = function (ast, arg) {
                return this.vChildren(ast, arg);
            };
            Visitor.prototype.vCreationClause = function (creationClause, arg) {
                return this.vInstruction(creationClause, arg);
            };
            Visitor.prototype.vCreateInstruction = function (createInstruction, arg) {
                return this.vInstruction(createInstruction, arg);
            };
            Visitor.prototype.vIfElse = function (ifElse, arg) {
                return this.vInstruction(ifElse, arg);
            };
            Visitor.prototype.vAssignment = function (assignment, arg) {
                return this.vInstruction(assignment, arg);
            };
            Visitor.prototype.vForUntil = function (forUntil, arg) {
                return this.vInstruction(forUntil, arg);
            };
            Visitor.prototype.vExportChangeSet = function (exportChangeSet, arg) {
                return this.vDefault(exportChangeSet, arg);
            };
            Visitor.prototype.vPrecondition = function (precondition, arg) {
                return this.vCondition(precondition, arg);
            };
            Visitor.prototype.vPostcondition = function (postcondition, arg) {
                return this.vCondition(postcondition, arg);
            };
            Visitor.prototype.vCondition = function (condition, arg) {
                return this.vDefault(condition, arg);
            };
            Visitor.prototype.vUnaryOp = function (unaryOp, arg) {
                return this.vExpression(unaryOp, arg);
            };
            Visitor.prototype.vBinaryOp = function (binaryOp, arg) {
                return this.vExpression(binaryOp, arg);
            };
            Visitor.prototype.vExpression = function (expression, arg) {
                return this.vDefault(expression, arg);
            };
            Visitor.prototype.vCurrentExpr = function (currentExpression, arg) {
                return this.vDefault(currentExpression, arg);
            };
            Visitor.prototype.vIntLiteral = function (intLiteral, arg) {
                return this.vLiteral(intLiteral, arg);
            };
            Visitor.prototype.vStringLiteral = function (stringLiteral, arg) {
                return this.vLiteral(stringLiteral, arg);
            };
            Visitor.prototype.vLiteral = function (literal, arg) {
                return this.vDefault(literal, arg);
            };
            Visitor.prototype.vConstantAttribute = function (constantAttribute, arg) {
                return this.vVarOrConstAttribute(constantAttribute, arg);
            };
            Visitor.prototype.vVarOrConstAttribute = function (varOrConstAttribute, arg) {
                return this.vFeature(varOrConstAttribute, arg);
            };
            Visitor.prototype.vAlias = function (alias, arg) {
                return this.vDefault(alias, arg);
            };
            Visitor.prototype.vCharLiteral = function (charLiteral, arg) {
                return this.vLiteral(charLiteral, arg);
            };
            Visitor.prototype.vBooleanLiteral = function (booleanLiteral, arg) {
                return this.vLiteral(booleanLiteral, arg);
            };
            Visitor.prototype.vVoidLiteral = function (voidLiteral, arg) {
                return this.vLiteral(voidLiteral, arg);
            };
            Visitor.prototype.vCallExpression = function (callExpression, arg) {
                return this.vExpression(callExpression, arg);
            };
            Visitor.prototype.vIndexExpression = function (indexExpression, arg) {
                return this.vExpression(indexExpression, arg);
            };
            return Visitor;
        })();
        _ast.Visitor = Visitor;
    })(ast = eiffel.ast || (eiffel.ast = {}));
})(eiffel || (eiffel = {}));

/// <reference path="visitor.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var eiffel;
(function (eiffel) {
    var ast;
    (function (ast) {
        var AST = (function () {
            function AST(impl) {
                this._acceptor = impl;
                this.children = [];
            }
            return AST;
        })();
        ast.AST = AST;
        var Identifier = (function (_super) {
            __extends(Identifier, _super);
            function Identifier(name, start, end) {
                _super.call(this, this);
                this.name = name;
                this.start = start;
                this.end = end;
            }
            Identifier.prototype.accept = function (visitor, arg) {
                return visitor.vIdentifier(this, arg);
            };
            return Identifier;
        })(AST);
        ast.Identifier = Identifier;
        var Pos = (function () {
            function Pos(offset, line, column) {
                this.offset = offset;
                this.line = line;
                this.column = column;
            }
            return Pos;
        })();
        ast.Pos = Pos;
        var Class = (function (_super) {
            __extends(Class, _super);
            function Class(name, note, parents, creationClause, featureLists) {
                _super.call(this, this);
                this.name = name;
                this.children.push(name);
                this.parents = parents;
                Array.prototype.push.apply(this.children, parents);
                this.creationClause = creationClause;
                Array.prototype.push.apply(this.children, creationClause);
                this.featureLists = featureLists;
                Array.prototype.push.apply(this.children, featureLists);
            }
            Class.prototype.accept = function (visitor, arg) {
                return visitor.vClass(this, arg);
            };
            return Class;
        })(AST);
        ast.Class = Class;
        var FeatureList = (function (_super) {
            __extends(FeatureList, _super);
            function FeatureList(exports, features) {
                _super.call(this, this);
                this.exports = exports;
                Array.prototype.push.apply(this.children, exports);
                this.features = features;
                Array.prototype.push.apply(this.children, features);
            }
            FeatureList.prototype.accept = function (visitor, arg) {
                return visitor.vFeatureList(this, arg);
            };
            return FeatureList;
        })(AST);
        ast.FeatureList = FeatureList;
        var Routine = (function (_super) {
            __extends(Routine, _super);
            function Routine(name, parameters, alias, rt, preconditions, instructions, postconditions) {
                _super.call(this, this);
                this.name = name;
                this.parameters = parameters;
                this.alias = alias;
                this.preconditions = preconditions;
                this.instructions = instructions;
                this.postconditions = postconditions;
            }
            Routine.prototype.accept = function (visitor, arg) {
                return visitor.vRoutine(this, arg);
            };
            return Routine;
        })(AST);
        ast.Routine = Routine;
        var Parameter = (function (_super) {
            __extends(Parameter, _super);
            function Parameter() {
                _super.call(this, this);
            }
            Parameter.prototype.accept = function (visitor, arg) {
                return visitor.vParameter(this, arg);
            };
            return Parameter;
        })(AST);
        ast.Parameter = Parameter;
        var Type = (function (_super) {
            __extends(Type, _super);
            function Type() {
                _super.call(this, this);
            }
            Type.prototype.accept = function (visitor, arg) {
                return visitor.vType(this, arg);
            };
            return Type;
        })(AST);
        ast.Type = Type;
        var Function = (function (_super) {
            __extends(Function, _super);
            function Function() {
                _super.apply(this, arguments);
            }
            Function.prototype.accept = function (visitor, arg) {
                return visitor.vFunction(this, arg);
            };
            return Function;
        })(Routine);
        ast.Function = Function;
        var Procedure = (function (_super) {
            __extends(Procedure, _super);
            function Procedure() {
                _super.apply(this, arguments);
            }
            Procedure.prototype.accept = function (visitor, arg) {
                return visitor.vProcedure(this, arg);
            };
            return Procedure;
        })(Routine);
        ast.Procedure = Procedure;
        var Alias = (function (_super) {
            __extends(Alias, _super);
            function Alias(name, start, end) {
                _super.call(this, this);
                this.name = name;
                this.start = start;
                this.end = end;
            }
            Alias.prototype.accept = function (visitor, arg) {
                return visitor.vAlias(this, arg);
            };
            return Alias;
        })(AST);
        ast.Alias = Alias;
        var CurrentExpression = (function (_super) {
            __extends(CurrentExpression, _super);
            function CurrentExpression(pos, end) {
                _super.call(this, this);
                this.start = pos;
                this.end = end;
            }
            CurrentExpression.prototype.accept = function (visitor, arg) {
                return visitor.vCurrentExpr(this, arg);
            };
            return CurrentExpression;
        })(AST);
        ast.CurrentExpression = CurrentExpression;
        var VarOrConstAttribute = (function (_super) {
            __extends(VarOrConstAttribute, _super);
            function VarOrConstAttribute(name, rawType) {
                _super.call(this, this);
                this.name = name;
                this.rawType = rawType;
            }
            VarOrConstAttribute.prototype.accept = function (visitor, arg) {
                return visitor.vVarOrConstAttribute(this, arg);
            };
            return VarOrConstAttribute;
        })(AST);
        ast.VarOrConstAttribute = VarOrConstAttribute;
        var Attribute = (function (_super) {
            __extends(Attribute, _super);
            function Attribute() {
                _super.apply(this, arguments);
            }
            Attribute.prototype.accept = function (visitor, arg) {
                return visitor.vAttr(this, arg);
            };
            return Attribute;
        })(VarOrConstAttribute);
        ast.Attribute = Attribute;
        var ConstantAttribute = (function (_super) {
            __extends(ConstantAttribute, _super);
            function ConstantAttribute(name, rawType, value) {
                _super.call(this, name, rawType);
                this.value = value;
            }
            ConstantAttribute.prototype.accept = function (visitor, arg) {
                return visitor.vConstantAttribute(this, arg);
            };
            return ConstantAttribute;
        })(VarOrConstAttribute);
        ast.ConstantAttribute = ConstantAttribute;
        var CreationClause = (function (_super) {
            __extends(CreationClause, _super);
            function CreationClause(identifiers) {
                _super.call(this, this);
                this.features = identifiers;
            }
            CreationClause.prototype.accept = function (visitor, arg) {
                return visitor.vCreationClause(this, arg);
            };
            return CreationClause;
        })(AST);
        ast.CreationClause = CreationClause;
        var Parent = (function (_super) {
            __extends(Parent, _super);
            function Parent() {
                _super.call(this, this);
            }
            Parent.prototype.accept = function (visitor, arg) {
                return visitor.vParent(this, arg);
            };
            return Parent;
        })(AST);
        ast.Parent = Parent;
        var Literal = (function (_super) {
            __extends(Literal, _super);
            function Literal() {
                _super.apply(this, arguments);
            }
            return Literal;
        })(AST);
        ast.Literal = Literal;
        var CharLiteral = (function (_super) {
            __extends(CharLiteral, _super);
            function CharLiteral(value, start, end) {
                _super.call(this, this);
                this.value = value;
                this.start = start;
                this.end = end;
            }
            CharLiteral.prototype.accept = function (visitor, arg) {
                return visitor.vCharLiteral(this, arg);
            };
            return CharLiteral;
        })(Literal);
        ast.CharLiteral = CharLiteral;
        var BooleanLiteral = (function (_super) {
            __extends(BooleanLiteral, _super);
            function BooleanLiteral(value, start, end) {
                _super.call(this, this);
                this.value = value;
                this.start = start;
                this.end = end;
            }
            BooleanLiteral.prototype.accept = function (visitor, arg) {
                return visitor.vBooleanLiteral(this, arg);
            };
            return BooleanLiteral;
        })(Literal);
        ast.BooleanLiteral = BooleanLiteral;
        var IntLiteral = (function (_super) {
            __extends(IntLiteral, _super);
            function IntLiteral(value, start, end) {
                _super.call(this, this);
                this.value = value;
                this.start = start;
                this.end = end;
            }
            IntLiteral.prototype.accept = function (visitor, arg) {
                return visitor.vIntLiteral(this, arg);
            };
            return IntLiteral;
        })(Literal);
        ast.IntLiteral = IntLiteral;
        var VoidLiteral = (function (_super) {
            __extends(VoidLiteral, _super);
            function VoidLiteral(start, end) {
                _super.call(this, this);
                this.value = null;
                this.start = start;
                this.end = end;
            }
            VoidLiteral.prototype.accept = function (visitor, arg) {
                return visitor.vVoidLiteral(this, arg);
            };
            return VoidLiteral;
        })(Literal);
        ast.VoidLiteral = VoidLiteral;
        var StringLiteral = (function (_super) {
            __extends(StringLiteral, _super);
            function StringLiteral(value, start, end) {
                _super.call(this, this);
                this.value = value;
                this.start = start;
                this.end = end;
            }
            StringLiteral.prototype.accept = function (visitor, arg) {
                return visitor.vStringLiteral(this, arg);
            };
            return StringLiteral;
        })(Literal);
        ast.StringLiteral = StringLiteral;
        var All = (function () {
            function All() {}
            return All;
        })();
        ast.All = All;
        var ExportChangeSet = (function (_super) {
            __extends(ExportChangeSet, _super);
            function ExportChangeSet() {
                _super.call(this, this);
            }
            ExportChangeSet.prototype.accept = function (visitor, arg) {
                return visitor.vExportChangeSet(this, arg);
            };
            return ExportChangeSet;
        })(AST);
        ast.ExportChangeSet = ExportChangeSet;
        var TypeInstance = (function () {
            function TypeInstance() {}
            return TypeInstance;
        })();
        ast.TypeInstance = TypeInstance;
        var IfElse = (function (_super) {
            __extends(IfElse, _super);
            function IfElse() {
                _super.apply(this, arguments);
            }
            IfElse.prototype.accept = function (visitor, arg) {
                return visitor.vIfElse(this, arg);
            };
            return IfElse;
        })(AST);
        ast.IfElse = IfElse;
        var Condition = (function (_super) {
            __extends(Condition, _super);
            function Condition(label, condition) {
                _super.call(this, this);
                this.condition = condition;
                this.label = label;
            }
            Condition.prototype.accept = function (visitor, arg) {
                throw new Error("This should not be called");
            };
            return Condition;
        })(AST);
        ast.Condition = Condition;
        var Precondition = (function (_super) {
            __extends(Precondition, _super);
            function Precondition() {
                _super.apply(this, arguments);
            }
            Precondition.prototype.accept = function (visitor, arg) {
                return visitor.vPrecondition(this, arg);
            };
            return Precondition;
        })(Condition);
        ast.Precondition = Precondition;
        var Postcondition = (function (_super) {
            __extends(Postcondition, _super);
            function Postcondition() {
                _super.apply(this, arguments);
            }
            Postcondition.prototype.accept = function (visitor, arg) {
                return visitor.vPostcondition(this, arg);
            };
            return Postcondition;
        })(Condition);
        ast.Postcondition = Postcondition;
        var ForUntilInstruction = (function (_super) {
            __extends(ForUntilInstruction, _super);
            function ForUntilInstruction() {
                _super.apply(this, arguments);
            }
            ForUntilInstruction.prototype.accept = function (visitor, arg) {
                return visitor.vForUntil(this, arg);
            };
            return ForUntilInstruction;
        })(AST);
        ast.ForUntilInstruction = ForUntilInstruction;
        var Assignment = (function (_super) {
            __extends(Assignment, _super);
            function Assignment(left, right) {
                _super.call(this, this);
                this.left = left;
                this.right = right;
            }
            Assignment.prototype.accept = function (visitor, arg) {
                return visitor.vAssignment(this, arg);
            };
            return Assignment;
        })(AST);
        ast.Assignment = Assignment;
        var CreateInstruction = (function (_super) {
            __extends(CreateInstruction, _super);
            function CreateInstruction(target, method, arguments) {
                _super.call(this, this);
                this.target = target;
                this.method = method;
                this.arguments = arguments;
            }
            CreateInstruction.prototype.accept = function (visitor, arg) {
                return visitor.vCreateInstruction(this, arg);
            };
            return CreateInstruction;
        })(AST);
        ast.CreateInstruction = CreateInstruction;
        var UnaryOp = (function (_super) {
            __extends(UnaryOp, _super);
            function UnaryOp() {
                _super.apply(this, arguments);
            }
            UnaryOp.prototype.accept = function (visitor, arg) {
                return visitor.vUnaryOp(this, arg);
            };
            return UnaryOp;
        })(AST);
        ast.UnaryOp = UnaryOp;
        var BinaryOp = (function (_super) {
            __extends(BinaryOp, _super);
            function BinaryOp() {
                _super.apply(this, arguments);
            }
            BinaryOp.prototype.accept = function (visitor, arg) {
                return visitor.vBinaryOp(this, arg);
            };
            return BinaryOp;
        })(AST);
        ast.BinaryOp = BinaryOp;
        var stringToUnaryOp = {
            "-": 0 /* Minus */,
            "+": 1 /* Plus */,
            not: 2 /* Not */,
            old: 3 /* Old */ };
        var stringToBinaryOp = {
            "-": 0 /* Minus */,
            "+": 1 /* Plus */,
            "*": 2 /* Multiplication */,
            "/": 3 /* Division */,
            "//": 4 /* IntegerDivision */,
            "\\\\": 5 /* Modulo */,
            "^": 6 /* Exponential */,
            "..": 7 /* DotDot */,
            "=": 8 /* Identical */,
            "/=": 9 /* NotIdentical */,
            "~": 10 /* IsEqual */,
            "/~": 11 /* NotIsEqual */,
            "<": 12 /* LessThan */,
            ">": 13 /* GreaterThan */,
            "<=": 14 /* LessOrEqual */,
            ">=": 15 /* GreaterOrEqual */,
            and: 16 /* And */,
            "and then": 17 /* AndThen */,
            or: 18 /* Or */,
            "or else": 19 /* OrElse */,
            xor: 20 /* Xor */,
            implies: 21 /* Implies */ };
        var CallExpression = (function (_super) {
            __extends(CallExpression, _super);
            function CallExpression() {
                _super.apply(this, arguments);
            }
            CallExpression.prototype.accept = function (visitor, arg) {
                return visitor.vCallExpression(this, arg);
            };
            return CallExpression;
        })(AST);
        ast.CallExpression = CallExpression;
        var IndexExpression = (function (_super) {
            __extends(IndexExpression, _super);
            function IndexExpression() {
                _super.apply(this, arguments);
            }
            IndexExpression.prototype.accept = function (visitor, arg) {
                return visitor.vIndexExpression(this, arg);
            };
            return IndexExpression;
        })(AST);
        ast.IndexExpression = IndexExpression;
    })(ast = eiffel.ast || (eiffel.ast = {}));
})(eiffel || (eiffel = {}));

/// <reference path="visitor.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var eiffel;
(function (eiffel) {
    var semantics;
    (function (semantics) {
        function analyze(asts) {
            var analysisContext = new AnalysisContext();
            asts.forEach(function (ast) {
                ast.accept(new FeatureDiscovery(analysisContext.classSymbols), null);
            });
            return null;
        }
        semantics.analyze = analyze;
        var AnalysisContext = (function () {
            function AnalysisContext() {
                this.classSymbols = {};
            }
            return AnalysisContext;
        })();
        var FeatureDiscovery = (function (_super) {
            __extends(FeatureDiscovery, _super);
            function FeatureDiscovery(classSymbols) {
                _super.call(this);
                this.classSymbols = classSymbols;
            }
            FeatureDiscovery.prototype.vClass = function (_class, arg) {
                console.log(_class.name.name);
                console.log(_class);
                return this.vChildren(_class, _class);
            };
            FeatureDiscovery.prototype.vFeature = function (feature, arg) {
                return _super.prototype.vFeature.call(this, feature, arg);
            };
            FeatureDiscovery.prototype.vAttr = function (attr, arg) {
                console.log(attr);
                return _super.prototype.vAttr.call(this, attr, arg);
            };
            FeatureDiscovery.prototype.vFunction = function (func, arg) {
                console.log(func);
                return _super.prototype.vFunction.call(this, func, arg);
            };
            FeatureDiscovery.prototype.vProcedure = function (procedure, arg) {
                console.log(procedure);
                return _super.prototype.vProcedure.call(this, procedure, arg);
            };
            FeatureDiscovery.prototype.vConstantAttribute = function (constantAttribute, arg) {
                return _super.prototype.vConstantAttribute.call(this, constantAttribute, arg);
            };
            return FeatureDiscovery;
        })(eiffel.ast.Visitor);
    })(semantics = eiffel.semantics || (eiffel.semantics = {}));
})(eiffel || (eiffel = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var eiffel;
(function (eiffel) {
    var symbols;
    (function (symbols) {
        var Symbol = (function () {
            function Symbol() {}
            return Symbol;
        })();
        symbols.Symbol = Symbol;
        var RoutineSymbol = (function (_super) {
            __extends(RoutineSymbol, _super);
            function RoutineSymbol() {
                _super.apply(this, arguments);
            }
            return RoutineSymbol;
        })(Symbol);
        symbols.RoutineSymbol = RoutineSymbol;
        var FunctionSymbol = (function (_super) {
            __extends(FunctionSymbol, _super);
            function FunctionSymbol() {
                _super.apply(this, arguments);
            }
            return FunctionSymbol;
        })(RoutineSymbol);
        symbols.FunctionSymbol = FunctionSymbol;
        var ProcedureSymbol = (function (_super) {
            __extends(ProcedureSymbol, _super);
            function ProcedureSymbol() {
                _super.apply(this, arguments);
            }
            return ProcedureSymbol;
        })(RoutineSymbol);
        symbols.ProcedureSymbol = ProcedureSymbol;
        var ClassSymbol = (function (_super) {
            __extends(ClassSymbol, _super);
            function ClassSymbol() {
                _super.apply(this, arguments);
                this.functions = {};
                this.procedures = {};
            }
            return ClassSymbol;
        })(Symbol);
        symbols.ClassSymbol = ClassSymbol;
    })(symbols = eiffel.symbols || (eiffel.symbols = {}));
})(eiffel || (eiffel = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL0NocmlzdGlhbi9Eb2N1bWVudHMvRVRIL2VpZmZlbC1wYXJzZXIvdmlzaXRvci50cyIsInR5cGVzY3JpcHQuanMiLCJDOi9Vc2Vycy9DaHJpc3RpYW4vRG9jdW1lbnRzL0VUSC9laWZmZWwtcGFyc2VyL2FzdC50cyIsIkM6L1VzZXJzL0NocmlzdGlhbi9Eb2N1bWVudHMvRVRIL2VpZmZlbC1wYXJzZXIvc2VtYW50aWNzLnRzIiwiQzovVXNlcnMvQ2hyaXN0aWFuL0RvY3VtZW50cy9FVEgvZWlmZmVsLXBhcnNlci9zeW1ib2xzLnRzIl0sIm5hbWVzIjpbImVpZmZlbCIsImVpZmZlbC5hc3QiLCJlaWZmZWwuYXN0LlZpc2l0b3IiLCJlaWZmZWwuYXN0LlZpc2l0b3IuY29uc3RydWN0b3IiLCJlaWZmZWwuYXN0LlZpc2l0b3IudkNsYXNzIiwiZWlmZmVsLmFzdC5WaXNpdG9yLnZGZWF0dXJlTGlzdCIsImVpZmZlbC5hc3QuVmlzaXRvci52RmVhdHVyZSIsImVpZmZlbC5hc3QuVmlzaXRvci52QXR0ciIsImVpZmZlbC5hc3QuVmlzaXRvci52Um91dGluZSIsImVpZmZlbC5hc3QuVmlzaXRvci52RnVuY3Rpb24iLCJlaWZmZWwuYXN0LlZpc2l0b3IudlByb2NlZHVyZSIsImVpZmZlbC5hc3QuVmlzaXRvci52Q2hpbGRyZW4iLCJlaWZmZWwuYXN0LlZpc2l0b3IudklkZW50aWZpZXIiLCJlaWZmZWwuYXN0LlZpc2l0b3IudlR5cGUiLCJlaWZmZWwuYXN0LlZpc2l0b3IudlBhcmVudCIsImVpZmZlbC5hc3QuVmlzaXRvci52UGFyYW1ldGVyIiwiZWlmZmVsLmFzdC5WaXNpdG9yLnZJbnN0cnVjdGlvbiIsImVpZmZlbC5hc3QuVmlzaXRvci52RGVmYXVsdCIsImVpZmZlbC5hc3QuVmlzaXRvci52Q3JlYXRpb25DbGF1c2UiLCJlaWZmZWwuYXN0LlZpc2l0b3IudkNyZWF0ZUluc3RydWN0aW9uIiwiZWlmZmVsLmFzdC5WaXNpdG9yLnZJZkVsc2UiLCJlaWZmZWwuYXN0LlZpc2l0b3IudkFzc2lnbm1lbnQiLCJlaWZmZWwuYXN0LlZpc2l0b3IudkZvclVudGlsIiwiZWlmZmVsLmFzdC5WaXNpdG9yLnZFeHBvcnRDaGFuZ2VTZXQiLCJlaWZmZWwuYXN0LlZpc2l0b3IudlByZWNvbmRpdGlvbiIsImVpZmZlbC5hc3QuVmlzaXRvci52UG9zdGNvbmRpdGlvbiIsImVpZmZlbC5hc3QuVmlzaXRvci52Q29uZGl0aW9uIiwiZWlmZmVsLmFzdC5WaXNpdG9yLnZVbmFyeU9wIiwiZWlmZmVsLmFzdC5WaXNpdG9yLnZCaW5hcnlPcCIsImVpZmZlbC5hc3QuVmlzaXRvci52RXhwcmVzc2lvbiIsImVpZmZlbC5hc3QuVmlzaXRvci52Q3VycmVudEV4cHIiLCJlaWZmZWwuYXN0LlZpc2l0b3IudkludExpdGVyYWwiLCJlaWZmZWwuYXN0LlZpc2l0b3IudlN0cmluZ0xpdGVyYWwiLCJlaWZmZWwuYXN0LlZpc2l0b3IudkxpdGVyYWwiLCJlaWZmZWwuYXN0LlZpc2l0b3IudkNvbnN0YW50QXR0cmlidXRlIiwiZWlmZmVsLmFzdC5WaXNpdG9yLnZWYXJPckNvbnN0QXR0cmlidXRlIiwiZWlmZmVsLmFzdC5WaXNpdG9yLnZBbGlhcyIsImVpZmZlbC5hc3QuVmlzaXRvci52Q2hhckxpdGVyYWwiLCJlaWZmZWwuYXN0LlZpc2l0b3IudkJvb2xlYW5MaXRlcmFsIiwiZWlmZmVsLmFzdC5WaXNpdG9yLnZWb2lkTGl0ZXJhbCIsImVpZmZlbC5hc3QuVmlzaXRvci52Q2FsbEV4cHJlc3Npb24iLCJlaWZmZWwuYXN0LlZpc2l0b3IudkluZGV4RXhwcmVzc2lvbiIsImVpZmZlbC5hc3QuQVNUIiwiZWlmZmVsLmFzdC5BU1QuY29uc3RydWN0b3IiLCJlaWZmZWwuYXN0LklkZW50aWZpZXIiLCJlaWZmZWwuYXN0LklkZW50aWZpZXIuY29uc3RydWN0b3IiLCJlaWZmZWwuYXN0LklkZW50aWZpZXIuYWNjZXB0IiwiZWlmZmVsLmFzdC5Qb3MiLCJlaWZmZWwuYXN0LlBvcy5jb25zdHJ1Y3RvciIsImVpZmZlbC5hc3QuQ2xhc3MiLCJlaWZmZWwuYXN0LkNsYXNzLmNvbnN0cnVjdG9yIiwiZWlmZmVsLmFzdC5DbGFzcy5hY2NlcHQiLCJlaWZmZWwuYXN0LkZlYXR1cmVMaXN0IiwiZWlmZmVsLmFzdC5GZWF0dXJlTGlzdC5jb25zdHJ1Y3RvciIsImVpZmZlbC5hc3QuRmVhdHVyZUxpc3QuYWNjZXB0IiwiZWlmZmVsLmFzdC5Sb3V0aW5lIiwiZWlmZmVsLmFzdC5Sb3V0aW5lLmNvbnN0cnVjdG9yIiwiZWlmZmVsLmFzdC5Sb3V0aW5lLmFjY2VwdCIsImVpZmZlbC5hc3QuUGFyYW1ldGVyIiwiZWlmZmVsLmFzdC5QYXJhbWV0ZXIuY29uc3RydWN0b3IiLCJlaWZmZWwuYXN0LlBhcmFtZXRlci5hY2NlcHQiLCJlaWZmZWwuYXN0LlR5cGUiLCJlaWZmZWwuYXN0LlR5cGUuY29uc3RydWN0b3IiLCJlaWZmZWwuYXN0LlR5cGUuYWNjZXB0IiwiZWlmZmVsLmFzdC5GdW5jdGlvbiIsImVpZmZlbC5hc3QuRnVuY3Rpb24uY29uc3RydWN0b3IiLCJlaWZmZWwuYXN0LkZ1bmN0aW9uLmFjY2VwdCIsImVpZmZlbC5hc3QuUHJvY2VkdXJlIiwiZWlmZmVsLmFzdC5Qcm9jZWR1cmUuY29uc3RydWN0b3IiLCJlaWZmZWwuYXN0LlByb2NlZHVyZS5hY2NlcHQiLCJlaWZmZWwuYXN0LkFsaWFzIiwiZWlmZmVsLmFzdC5BbGlhcy5jb25zdHJ1Y3RvciIsImVpZmZlbC5hc3QuQWxpYXMuYWNjZXB0IiwiZWlmZmVsLmFzdC5DdXJyZW50RXhwcmVzc2lvbiIsImVpZmZlbC5hc3QuQ3VycmVudEV4cHJlc3Npb24uY29uc3RydWN0b3IiLCJlaWZmZWwuYXN0LkN1cnJlbnRFeHByZXNzaW9uLmFjY2VwdCIsImVpZmZlbC5hc3QuVmFyT3JDb25zdEF0dHJpYnV0ZSIsImVpZmZlbC5hc3QuVmFyT3JDb25zdEF0dHJpYnV0ZS5jb25zdHJ1Y3RvciIsImVpZmZlbC5hc3QuVmFyT3JDb25zdEF0dHJpYnV0ZS5hY2NlcHQiLCJlaWZmZWwuYXN0LkF0dHJpYnV0ZSIsImVpZmZlbC5hc3QuQXR0cmlidXRlLmNvbnN0cnVjdG9yIiwiZWlmZmVsLmFzdC5BdHRyaWJ1dGUuYWNjZXB0IiwiZWlmZmVsLmFzdC5Db25zdGFudEF0dHJpYnV0ZSIsImVpZmZlbC5hc3QuQ29uc3RhbnRBdHRyaWJ1dGUuY29uc3RydWN0b3IiLCJlaWZmZWwuYXN0LkNvbnN0YW50QXR0cmlidXRlLmFjY2VwdCIsImVpZmZlbC5hc3QuQ3JlYXRpb25DbGF1c2UiLCJlaWZmZWwuYXN0LkNyZWF0aW9uQ2xhdXNlLmNvbnN0cnVjdG9yIiwiZWlmZmVsLmFzdC5DcmVhdGlvbkNsYXVzZS5hY2NlcHQiLCJlaWZmZWwuYXN0LlBhcmVudCIsImVpZmZlbC5hc3QuUGFyZW50LmNvbnN0cnVjdG9yIiwiZWlmZmVsLmFzdC5QYXJlbnQuYWNjZXB0IiwiZWlmZmVsLmFzdC5MaXRlcmFsIiwiZWlmZmVsLmFzdC5MaXRlcmFsLmNvbnN0cnVjdG9yIiwiZWlmZmVsLmFzdC5DaGFyTGl0ZXJhbCIsImVpZmZlbC5hc3QuQ2hhckxpdGVyYWwuY29uc3RydWN0b3IiLCJlaWZmZWwuYXN0LkNoYXJMaXRlcmFsLmFjY2VwdCIsImVpZmZlbC5hc3QuQm9vbGVhbkxpdGVyYWwiLCJlaWZmZWwuYXN0LkJvb2xlYW5MaXRlcmFsLmNvbnN0cnVjdG9yIiwiZWlmZmVsLmFzdC5Cb29sZWFuTGl0ZXJhbC5hY2NlcHQiLCJlaWZmZWwuYXN0LkludExpdGVyYWwiLCJlaWZmZWwuYXN0LkludExpdGVyYWwuY29uc3RydWN0b3IiLCJlaWZmZWwuYXN0LkludExpdGVyYWwuYWNjZXB0IiwiZWlmZmVsLmFzdC5Wb2lkTGl0ZXJhbCIsImVpZmZlbC5hc3QuVm9pZExpdGVyYWwuY29uc3RydWN0b3IiLCJlaWZmZWwuYXN0LlZvaWRMaXRlcmFsLmFjY2VwdCIsImVpZmZlbC5hc3QuU3RyaW5nTGl0ZXJhbCIsImVpZmZlbC5hc3QuU3RyaW5nTGl0ZXJhbC5jb25zdHJ1Y3RvciIsImVpZmZlbC5hc3QuU3RyaW5nTGl0ZXJhbC5hY2NlcHQiLCJlaWZmZWwuYXN0LkFsbCIsImVpZmZlbC5hc3QuQWxsLmNvbnN0cnVjdG9yIiwiZWlmZmVsLmFzdC5FeHBvcnRDaGFuZ2VTZXQiLCJlaWZmZWwuYXN0LkV4cG9ydENoYW5nZVNldC5jb25zdHJ1Y3RvciIsImVpZmZlbC5hc3QuRXhwb3J0Q2hhbmdlU2V0LmFjY2VwdCIsImVpZmZlbC5hc3QuVHlwZUluc3RhbmNlIiwiZWlmZmVsLmFzdC5UeXBlSW5zdGFuY2UuY29uc3RydWN0b3IiLCJlaWZmZWwuYXN0LklmRWxzZSIsImVpZmZlbC5hc3QuSWZFbHNlLmNvbnN0cnVjdG9yIiwiZWlmZmVsLmFzdC5JZkVsc2UuYWNjZXB0IiwiZWlmZmVsLmFzdC5Db25kaXRpb24iLCJlaWZmZWwuYXN0LkNvbmRpdGlvbi5jb25zdHJ1Y3RvciIsImVpZmZlbC5hc3QuQ29uZGl0aW9uLmFjY2VwdCIsImVpZmZlbC5hc3QuUHJlY29uZGl0aW9uIiwiZWlmZmVsLmFzdC5QcmVjb25kaXRpb24uY29uc3RydWN0b3IiLCJlaWZmZWwuYXN0LlByZWNvbmRpdGlvbi5hY2NlcHQiLCJlaWZmZWwuYXN0LlBvc3Rjb25kaXRpb24iLCJlaWZmZWwuYXN0LlBvc3Rjb25kaXRpb24uY29uc3RydWN0b3IiLCJlaWZmZWwuYXN0LlBvc3Rjb25kaXRpb24uYWNjZXB0IiwiZWlmZmVsLmFzdC5Gb3JVbnRpbEluc3RydWN0aW9uIiwiZWlmZmVsLmFzdC5Gb3JVbnRpbEluc3RydWN0aW9uLmNvbnN0cnVjdG9yIiwiZWlmZmVsLmFzdC5Gb3JVbnRpbEluc3RydWN0aW9uLmFjY2VwdCIsImVpZmZlbC5hc3QuQXNzaWdubWVudCIsImVpZmZlbC5hc3QuQXNzaWdubWVudC5jb25zdHJ1Y3RvciIsImVpZmZlbC5hc3QuQXNzaWdubWVudC5hY2NlcHQiLCJlaWZmZWwuYXN0LkNyZWF0ZUluc3RydWN0aW9uIiwiZWlmZmVsLmFzdC5DcmVhdGVJbnN0cnVjdGlvbi5jb25zdHJ1Y3RvciIsImVpZmZlbC5hc3QuQ3JlYXRlSW5zdHJ1Y3Rpb24uYWNjZXB0IiwiZWlmZmVsLmFzdC5VbmFyeU9wIiwiZWlmZmVsLmFzdC5VbmFyeU9wLmNvbnN0cnVjdG9yIiwiZWlmZmVsLmFzdC5VbmFyeU9wLmFjY2VwdCIsImVpZmZlbC5hc3QuQmluYXJ5T3AiLCJlaWZmZWwuYXN0LkJpbmFyeU9wLmNvbnN0cnVjdG9yIiwiZWlmZmVsLmFzdC5CaW5hcnlPcC5hY2NlcHQiLCJlaWZmZWwuYXN0LkNhbGxFeHByZXNzaW9uIiwiZWlmZmVsLmFzdC5DYWxsRXhwcmVzc2lvbi5jb25zdHJ1Y3RvciIsImVpZmZlbC5hc3QuQ2FsbEV4cHJlc3Npb24uYWNjZXB0IiwiZWlmZmVsLmFzdC5JbmRleEV4cHJlc3Npb24iLCJlaWZmZWwuYXN0LkluZGV4RXhwcmVzc2lvbi5jb25zdHJ1Y3RvciIsImVpZmZlbC5hc3QuSW5kZXhFeHByZXNzaW9uLmFjY2VwdCIsImVpZmZlbC5zZW1hbnRpY3MiLCJlaWZmZWwuc2VtYW50aWNzLmFuYWx5emUiLCJlaWZmZWwuc2VtYW50aWNzLkFuYWx5c2lzQ29udGV4dCIsImVpZmZlbC5zZW1hbnRpY3MuQW5hbHlzaXNDb250ZXh0LmNvbnN0cnVjdG9yIiwiZWlmZmVsLnNlbWFudGljcy5GZWF0dXJlRGlzY292ZXJ5IiwiZWlmZmVsLnNlbWFudGljcy5GZWF0dXJlRGlzY292ZXJ5LmNvbnN0cnVjdG9yIiwiZWlmZmVsLnNlbWFudGljcy5GZWF0dXJlRGlzY292ZXJ5LnZDbGFzcyIsImVpZmZlbC5zZW1hbnRpY3MuRmVhdHVyZURpc2NvdmVyeS52RmVhdHVyZSIsImVpZmZlbC5zZW1hbnRpY3MuRmVhdHVyZURpc2NvdmVyeS52QXR0ciIsImVpZmZlbC5zZW1hbnRpY3MuRmVhdHVyZURpc2NvdmVyeS52RnVuY3Rpb24iLCJlaWZmZWwuc2VtYW50aWNzLkZlYXR1cmVEaXNjb3ZlcnkudlByb2NlZHVyZSIsImVpZmZlbC5zZW1hbnRpY3MuRmVhdHVyZURpc2NvdmVyeS52Q29uc3RhbnRBdHRyaWJ1dGUiLCJlaWZmZWwuc3ltYm9scyIsImVpZmZlbC5zeW1ib2xzLlN5bWJvbCIsImVpZmZlbC5zeW1ib2xzLlN5bWJvbC5jb25zdHJ1Y3RvciIsImVpZmZlbC5zeW1ib2xzLlJvdXRpbmVTeW1ib2wiLCJlaWZmZWwuc3ltYm9scy5Sb3V0aW5lU3ltYm9sLmNvbnN0cnVjdG9yIiwiZWlmZmVsLnN5bWJvbHMuRnVuY3Rpb25TeW1ib2wiLCJlaWZmZWwuc3ltYm9scy5GdW5jdGlvblN5bWJvbC5jb25zdHJ1Y3RvciIsImVpZmZlbC5zeW1ib2xzLlByb2NlZHVyZVN5bWJvbCIsImVpZmZlbC5zeW1ib2xzLlByb2NlZHVyZVN5bWJvbC5jb25zdHJ1Y3RvciIsImVpZmZlbC5zeW1ib2xzLkNsYXNzU3ltYm9sIiwiZWlmZmVsLnN5bWJvbHMuQ2xhc3NTeW1ib2wuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7QUFFQSxJQUFPLE1BQU0sQ0ErSlo7QUEvSkQsQ0FBQSxVQUFPLE1BQU0sRUFBQTtBQUFDQSxRQUFBQSxHQUFHQSxDQStKaEJBO0FBL0phQSxLQUFBQSxVQUFBQSxJQUFHQSxFQUFDQTtBQUdoQkMsWUFBYUEsT0FBT0EsR0FBQUEsQ0FBQUEsWUFBQUE7QUFBcEJDLHFCQUFhQSxPQUFPQSxHQUFBQSxFQTJKbkJDO0FBMUpDRCxtQkFBQUEsQ0FBQUEsU0FBQUEsQ0FBQUEsTUFBTUEsR0FBTkEsVUFBT0EsTUFBWUEsRUFBRUEsR0FBS0EsRUFBQUE7QUFDeEJFLHVCQUFPQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxNQUFNQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTthQUNuQ0EsQ0FBQUE7QUFFREYsbUJBQUFBLENBQUFBLFNBQUFBLENBQUFBLFlBQVlBLEdBQVpBLFVBQWFBLFdBQXVCQSxFQUFFQSxHQUFLQSxFQUFBQTtBQUN6Q0csdUJBQU9BLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFdBQVdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO2FBQ3hDQSxDQUFBQTtBQUVESCxtQkFBQUEsQ0FBQUEsU0FBQUEsQ0FBQUEsUUFBUUEsR0FBUkEsVUFB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LyA8cmVmZXJlbmNlIHBhdGg9XCJhc3QudHNcIiAvPlxuXG5tb2R1bGUgZWlmZmVsLmFzdCB7XG5cblxuICBleHBvcnQgY2xhc3MgVmlzaXRvcjxBLCBSPiB7XG4gICAgdkNsYXNzKF9jbGFzczpDbGFzcywgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHRoaXMudkRlZmF1bHQoX2NsYXNzLCBhcmcpO1xuICAgIH1cblxuICAgIHZGZWF0dXJlTGlzdChmZWF0dXJlTGlzdDpGZWF0dXJlTGlzdCwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHRoaXMudkRlZmF1bHQoZmVhdHVyZUxpc3QsIGFyZyk7XG4gICAgfVxuXG4gICAgdkZlYXR1cmUoZmVhdHVyZTpGZWF0dXJlLCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdGhpcy52RGVmYXVsdChmZWF0dXJlLCBhcmcpO1xuICAgIH1cblxuICAgIHZBdHRyKGF0dHI6QXR0cmlidXRlLCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdGhpcy52VmFyT3JDb25zdEF0dHJpYnV0ZShhdHRyLCBhcmcpO1xuICAgIH1cblxuICAgIHZSb3V0aW5lKGZlYXR1cmU6Um91dGluZSwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHRoaXMudkZlYXR1cmUoZmVhdHVyZSwgYXJnKTtcbiAgICB9XG5cbiAgICB2RnVuY3Rpb24oZnVuYzogZWlmZmVsLmFzdC5GdW5jdGlvbiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHRoaXMudlJvdXRpbmUoZnVuYywgYXJnKTtcbiAgICB9XG5cbiAgICB2UHJvY2VkdXJlKHByb2NlZHVyZTpQcm9jZWR1cmUsIGFyZzpBKTpSIHtcbiAgICAgIHJldHVybiB0aGlzLnZSb3V0aW5lKHByb2NlZHVyZSwgYXJnKTtcbiAgICB9XG5cbiAgICB2Q2hpbGRyZW4oYXN0OkFTVCwgYXJnOkEpOlIge1xuICAgICAgbGV0IHJlc3VsdCA9IG51bGw7XG4gICAgICBhc3QuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAodDpBU1QpIHtcbiAgICAgICAgcmVzdWx0ID0gdC5fYWNjZXB0b3IuYWNjZXB0KHRoaXMsIGFyZyk7XG4gICAgICB9LCB0aGlzKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgdklkZW50aWZpZXIoaWRlbnRpZmllcjpJZGVudGlmaWVyLCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdGhpcy52RGVmYXVsdChpZGVudGlmaWVyLCBhcmcpO1xuICAgIH1cblxuICAgIHZUeXBlKHR5cGU6VHlwZSwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHRoaXMudkRlZmF1bHQodHlwZSwgYXJnKTtcbiAgICB9XG5cbiAgICB2UGFyZW50KHBhcmVudDpQYXJlbnQsIGFyZzpBKTpSIHtcbiAgICAgIHJldHVybiB0aGlzLnZEZWZhdWx0KHBhcmVudCwgYXJnKTtcbiAgICB9XG5cbiAgICB2UGFyYW1ldGVyKHBhcmFtZXRlcjpQYXJhbWV0ZXIsIGFyZzpBKTpSIHtcbiAgICAgIHJldHVybiB0aGlzLnZEZWZhdWx0KHBhcmFtZXRlciwgYXJnKTtcbiAgICB9XG5cbiAgICB2SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb246SW5zdHJ1Y3Rpb24sIGFyZzpBKTpSIHtcbiAgICAgIHJldHVybiB0aGlzLnZEZWZhdWx0KGluc3RydWN0aW9uLCBhcmcpO1xuICAgIH1cblxuICAgIHZEZWZhdWx0KGFzdDpBU1QsIGFyZzpBKTpSIHtcbiAgICAgIHJldHVybiB0aGlzLnZDaGlsZHJlbihhc3QsIGFyZyk7XG4gICAgfVxuXG4gICAgdkNyZWF0aW9uQ2xhdXNlKGNyZWF0aW9uQ2xhdXNlOkNyZWF0aW9uQ2xhdXNlLCBhcmc6QSkge1xuICAgICAgcmV0dXJuIHRoaXMudkluc3RydWN0aW9uKGNyZWF0aW9uQ2xhdXNlLCBhcmcpO1xuICAgIH1cblxuICAgIHZDcmVhdGVJbnN0cnVjdGlvbihjcmVhdGVJbnN0cnVjdGlvbjpDcmVhdGVJbnN0cnVjdGlvbiwgYXJnOkEpIHtcbiAgICAgIHJldHVybiB0aGlzLnZJbnN0cnVjdGlvbihjcmVhdGVJbnN0cnVjdGlvbiwgYXJnKTtcbiAgICB9XG5cbiAgICB2SWZFbHNlKGlmRWxzZTpJZkVsc2UsIGFyZzpBKSB7XG4gICAgICByZXR1cm4gdGhpcy52SW5zdHJ1Y3Rpb24oaWZFbHNlLCBhcmcpO1xuICAgIH1cblxuICAgIHZBc3NpZ25tZW50KGFzc2lnbm1lbnQ6QXNzaWdubWVudCwgYXJnOkEpIHtcbiAgICAgIHJldHVybiB0aGlzLnZJbnN0cnVjdGlvbihhc3NpZ25tZW50LCBhcmcpO1xuICAgIH1cblxuICAgIHZGb3JVbnRpbChmb3JVbnRpbDpGb3JVbnRpbEluc3RydWN0aW9uLCBhcmc6QSkge1xuICAgICAgcmV0dXJuIHRoaXMudkluc3RydWN0aW9uKGZvclVudGlsLCBhcmcpO1xuICAgIH1cblxuICAgIHZFeHBvcnRDaGFuZ2VTZXQoZXhwb3J0Q2hhbmdlU2V0OkV4cG9ydENoYW5nZVNldCwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHRoaXMudkRlZmF1bHQoZXhwb3J0Q2hhbmdlU2V0LCBhcmcpO1xuICAgIH1cblxuICAgIHZQcmVjb25kaXRpb24ocHJlY29uZGl0aW9uOlByZWNvbmRpdGlvbiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHRoaXMudkNvbmRpdGlvbihwcmVjb25kaXRpb24sIGFyZyk7XG4gICAgfVxuXG4gICAgdlBvc3Rjb25kaXRpb24ocG9zdGNvbmRpdGlvbjogUG9zdGNvbmRpdGlvbiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHRoaXMudkNvbmRpdGlvbihwb3N0Y29uZGl0aW9uLCBhcmcpO1xuICAgIH1cblxuICAgIHZDb25kaXRpb24oY29uZGl0aW9uOiBDb25kaXRpb24sIGFyZzpBKTpSIHtcbiAgICAgIHJldHVybiB0aGlzLnZEZWZhdWx0KGNvbmRpdGlvbiwgYXJnKTtcbiAgICB9XG5cbiAgICB2VW5hcnlPcCh1bmFyeU9wOiBVbmFyeU9wLCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdGhpcy52RXhwcmVzc2lvbih1bmFyeU9wLCBhcmcpO1xuICAgIH1cblxuICAgIHZCaW5hcnlPcChiaW5hcnlPcDogQmluYXJ5T3AsIGFyZzpBKTpSIHtcbiAgICAgIHJldHVybiB0aGlzLnZFeHByZXNzaW9uKGJpbmFyeU9wLCBhcmcpO1xuICAgIH1cblxuICAgIHZFeHByZXNzaW9uKGV4cHJlc3Npb246RXhwcmVzc2lvbiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHRoaXMudkRlZmF1bHQoZXhwcmVzc2lvbiwgYXJnKTtcbiAgICB9XG5cbiAgICB2Q3VycmVudEV4cHIoY3VycmVudEV4cHJlc3Npb246IEN1cnJlbnRFeHByZXNzaW9uLCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdGhpcy52RGVmYXVsdChjdXJyZW50RXhwcmVzc2lvbiwgYXJnKTtcbiAgICB9XG5cbiAgICB2SW50TGl0ZXJhbChpbnRMaXRlcmFsOiBJbnRMaXRlcmFsLCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdGhpcy52TGl0ZXJhbChpbnRMaXRlcmFsLCBhcmcpO1xuICAgIH1cblxuICAgIHZTdHJpbmdMaXRlcmFsKHN0cmluZ0xpdGVyYWw6IFN0cmluZ0xpdGVyYWwsIGFyZzpBKTpSIHtcbiAgICAgIHJldHVybiB0aGlzLnZMaXRlcmFsKHN0cmluZ0xpdGVyYWwsIGFyZyk7XG4gICAgfVxuXG4gICAgdkxpdGVyYWwobGl0ZXJhbDogTGl0ZXJhbDxhbnk+LCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdGhpcy52RGVmYXVsdChsaXRlcmFsLCBhcmcpO1xuICAgIH1cblxuICAgIHZDb25zdGFudEF0dHJpYnV0ZShjb25zdGFudEF0dHJpYnV0ZTogQ29uc3RhbnRBdHRyaWJ1dGUsIGFyZzpBKTpSIHtcbiAgICAgIHJldHVybiB0aGlzLnZWYXJPckNvbnN0QXR0cmlidXRlKGNvbnN0YW50QXR0cmlidXRlLCBhcmcpO1xuICAgIH1cblxuICAgIHZWYXJPckNvbnN0QXR0cmlidXRlKHZhck9yQ29uc3RBdHRyaWJ1dGU6VmFyT3JDb25zdEF0dHJpYnV0ZSwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHRoaXMudkZlYXR1cmUodmFyT3JDb25zdEF0dHJpYnV0ZSwgYXJnKTtcbiAgICB9XG4gICAgdkFsaWFzKGFsaWFzOiBBbGlhcywgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHRoaXMudkRlZmF1bHQoYWxpYXMsIGFyZyk7XG4gICAgfVxuXG4gICAgdkNoYXJMaXRlcmFsKGNoYXJMaXRlcmFsOiBDaGFyTGl0ZXJhbCwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHRoaXMudkxpdGVyYWwoY2hhckxpdGVyYWwsIGFyZyk7XG4gICAgfVxuXG4gICAgdkJvb2xlYW5MaXRlcmFsKGJvb2xlYW5MaXRlcmFsOiBCb29sZWFuTGl0ZXJhbCwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHRoaXMudkxpdGVyYWwoYm9vbGVhbkxpdGVyYWwsIGFyZyk7XG4gICAgfVxuXG4gICAgdlZvaWRMaXRlcmFsKHZvaWRMaXRlcmFsOiBWb2lkTGl0ZXJhbCwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHRoaXMudkxpdGVyYWwodm9pZExpdGVyYWwsIGFyZyk7XG4gICAgfVxuXG4gICAgdkNhbGxFeHByZXNzaW9uKGNhbGxFeHByZXNzaW9uOiBDYWxsRXhwcmVzc2lvbiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHRoaXMudkV4cHJlc3Npb24oY2FsbEV4cHJlc3Npb24sIGFyZyk7XG4gICAgfVxuXG4gICAgdkluZGV4RXhwcmVzc2lvbihpbmRleEV4cHJlc3Npb246IEluZGV4RXhwcmVzc2lvbiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHRoaXMudkV4cHJlc3Npb24oaW5kZXhFeHByZXNzaW9uLCBhcmcpO1xuICAgIH1cbiAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImFzdC50c1wiIC8+XG52YXIgZWlmZmVsO1xuKGZ1bmN0aW9uIChlaWZmZWwpIHtcbiAgICB2YXIgYXN0O1xuICAgIChmdW5jdGlvbiAoX2FzdCkge1xuICAgICAgICB2YXIgVmlzaXRvciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBWaXNpdG9yKCkge1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudkNsYXNzID0gZnVuY3Rpb24gKF9jbGFzcywgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudkRlZmF1bHQoX2NsYXNzLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFZpc2l0b3IucHJvdG90eXBlLnZGZWF0dXJlTGlzdCA9IGZ1bmN0aW9uIChmZWF0dXJlTGlzdCwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudkRlZmF1bHQoZmVhdHVyZUxpc3QsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudkZlYXR1cmUgPSBmdW5jdGlvbiAoZmVhdHVyZSwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudkRlZmF1bHQoZmVhdHVyZSwgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBWaXNpdG9yLnByb3RvdHlwZS52QXR0ciA9IGZ1bmN0aW9uIChhdHRyLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52VmFyT3JDb25zdEF0dHJpYnV0ZShhdHRyLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFZpc2l0b3IucHJvdG90eXBlLnZSb3V0aW5lID0gZnVuY3Rpb24gKGZlYXR1cmUsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZGZWF0dXJlKGZlYXR1cmUsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudkZ1bmN0aW9uID0gZnVuY3Rpb24gKGZ1bmMsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZSb3V0aW5lKGZ1bmMsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudlByb2NlZHVyZSA9IGZ1bmN0aW9uIChwcm9jZWR1cmUsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZSb3V0aW5lKHByb2NlZHVyZSwgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBWaXNpdG9yLnByb3RvdHlwZS52Q2hpbGRyZW4gPSBmdW5jdGlvbiAoYXN0LCBhcmcpIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICBhc3QuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0Ll9hY2NlcHRvci5hY2NlcHQodGhpcywgYXJnKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFZpc2l0b3IucHJvdG90eXBlLnZJZGVudGlmaWVyID0gZnVuY3Rpb24gKGlkZW50aWZpZXIsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZEZWZhdWx0KGlkZW50aWZpZXIsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudlR5cGUgPSBmdW5jdGlvbiAodHlwZSwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudkRlZmF1bHQodHlwZSwgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBWaXNpdG9yLnByb3RvdHlwZS52UGFyZW50ID0gZnVuY3Rpb24gKHBhcmVudCwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudkRlZmF1bHQocGFyZW50LCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFZpc2l0b3IucHJvdG90eXBlLnZQYXJhbWV0ZXIgPSBmdW5jdGlvbiAocGFyYW1ldGVyLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52RGVmYXVsdChwYXJhbWV0ZXIsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudkluc3RydWN0aW9uID0gZnVuY3Rpb24gKGluc3RydWN0aW9uLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52RGVmYXVsdChpbnN0cnVjdGlvbiwgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBWaXNpdG9yLnByb3RvdHlwZS52RGVmYXVsdCA9IGZ1bmN0aW9uIChhc3QsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZDaGlsZHJlbihhc3QsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudkNyZWF0aW9uQ2xhdXNlID0gZnVuY3Rpb24gKGNyZWF0aW9uQ2xhdXNlLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52SW5zdHJ1Y3Rpb24oY3JlYXRpb25DbGF1c2UsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudkNyZWF0ZUluc3RydWN0aW9uID0gZnVuY3Rpb24gKGNyZWF0ZUluc3RydWN0aW9uLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52SW5zdHJ1Y3Rpb24oY3JlYXRlSW5zdHJ1Y3Rpb24sIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudklmRWxzZSA9IGZ1bmN0aW9uIChpZkVsc2UsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZJbnN0cnVjdGlvbihpZkVsc2UsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudkFzc2lnbm1lbnQgPSBmdW5jdGlvbiAoYXNzaWdubWVudCwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudkluc3RydWN0aW9uKGFzc2lnbm1lbnQsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudkZvclVudGlsID0gZnVuY3Rpb24gKGZvclVudGlsLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52SW5zdHJ1Y3Rpb24oZm9yVW50aWwsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudkV4cG9ydENoYW5nZVNldCA9IGZ1bmN0aW9uIChleHBvcnRDaGFuZ2VTZXQsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZEZWZhdWx0KGV4cG9ydENoYW5nZVNldCwgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBWaXNpdG9yLnByb3RvdHlwZS52UHJlY29uZGl0aW9uID0gZnVuY3Rpb24gKHByZWNvbmRpdGlvbiwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudkNvbmRpdGlvbihwcmVjb25kaXRpb24sIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudlBvc3Rjb25kaXRpb24gPSBmdW5jdGlvbiAocG9zdGNvbmRpdGlvbiwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudkNvbmRpdGlvbihwb3N0Y29uZGl0aW9uLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFZpc2l0b3IucHJvdG90eXBlLnZDb25kaXRpb24gPSBmdW5jdGlvbiAoY29uZGl0aW9uLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52RGVmYXVsdChjb25kaXRpb24sIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudlVuYXJ5T3AgPSBmdW5jdGlvbiAodW5hcnlPcCwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudkV4cHJlc3Npb24odW5hcnlPcCwgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBWaXNpdG9yLnByb3RvdHlwZS52QmluYXJ5T3AgPSBmdW5jdGlvbiAoYmluYXJ5T3AsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZFeHByZXNzaW9uKGJpbmFyeU9wLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFZpc2l0b3IucHJvdG90eXBlLnZFeHByZXNzaW9uID0gZnVuY3Rpb24gKGV4cHJlc3Npb24sIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZEZWZhdWx0KGV4cHJlc3Npb24sIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudkN1cnJlbnRFeHByID0gZnVuY3Rpb24gKGN1cnJlbnRFeHByZXNzaW9uLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52RGVmYXVsdChjdXJyZW50RXhwcmVzc2lvbiwgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBWaXNpdG9yLnByb3RvdHlwZS52SW50TGl0ZXJhbCA9IGZ1bmN0aW9uIChpbnRMaXRlcmFsLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52TGl0ZXJhbChpbnRMaXRlcmFsLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFZpc2l0b3IucHJvdG90eXBlLnZTdHJpbmdMaXRlcmFsID0gZnVuY3Rpb24gKHN0cmluZ0xpdGVyYWwsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZMaXRlcmFsKHN0cmluZ0xpdGVyYWwsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudkxpdGVyYWwgPSBmdW5jdGlvbiAobGl0ZXJhbCwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudkRlZmF1bHQobGl0ZXJhbCwgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBWaXNpdG9yLnByb3RvdHlwZS52Q29uc3RhbnRBdHRyaWJ1dGUgPSBmdW5jdGlvbiAoY29uc3RhbnRBdHRyaWJ1dGUsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZWYXJPckNvbnN0QXR0cmlidXRlKGNvbnN0YW50QXR0cmlidXRlLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFZpc2l0b3IucHJvdG90eXBlLnZWYXJPckNvbnN0QXR0cmlidXRlID0gZnVuY3Rpb24gKHZhck9yQ29uc3RBdHRyaWJ1dGUsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZGZWF0dXJlKHZhck9yQ29uc3RBdHRyaWJ1dGUsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudkFsaWFzID0gZnVuY3Rpb24gKGFsaWFzLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52RGVmYXVsdChhbGlhcywgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBWaXNpdG9yLnByb3RvdHlwZS52Q2hhckxpdGVyYWwgPSBmdW5jdGlvbiAoY2hhckxpdGVyYWwsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZMaXRlcmFsKGNoYXJMaXRlcmFsLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFZpc2l0b3IucHJvdG90eXBlLnZCb29sZWFuTGl0ZXJhbCA9IGZ1bmN0aW9uIChib29sZWFuTGl0ZXJhbCwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudkxpdGVyYWwoYm9vbGVhbkxpdGVyYWwsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVmlzaXRvci5wcm90b3R5cGUudlZvaWRMaXRlcmFsID0gZnVuY3Rpb24gKHZvaWRMaXRlcmFsLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52TGl0ZXJhbCh2b2lkTGl0ZXJhbCwgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBWaXNpdG9yLnByb3RvdHlwZS52Q2FsbEV4cHJlc3Npb24gPSBmdW5jdGlvbiAoY2FsbEV4cHJlc3Npb24sIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZFeHByZXNzaW9uKGNhbGxFeHByZXNzaW9uLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFZpc2l0b3IucHJvdG90eXBlLnZJbmRleEV4cHJlc3Npb24gPSBmdW5jdGlvbiAoaW5kZXhFeHByZXNzaW9uLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52RXhwcmVzc2lvbihpbmRleEV4cHJlc3Npb24sIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIFZpc2l0b3I7XG4gICAgICAgIH0pKCk7XG4gICAgICAgIF9hc3QuVmlzaXRvciA9IFZpc2l0b3I7XG4gICAgfSkoYXN0ID0gZWlmZmVsLmFzdCB8fCAoZWlmZmVsLmFzdCA9IHt9KSk7XG59KShlaWZmZWwgfHwgKGVpZmZlbCA9IHt9KSk7XG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ2aXNpdG9yLnRzXCIgLz5cbnZhciBfX2V4dGVuZHMgPSB0aGlzLl9fZXh0ZW5kcyB8fCBmdW5jdGlvbiAoZCwgYikge1xuICAgIGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdO1xuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgIF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlO1xuICAgIGQucHJvdG90eXBlID0gbmV3IF9fKCk7XG59O1xudmFyIGVpZmZlbDtcbihmdW5jdGlvbiAoZWlmZmVsKSB7XG4gICAgdmFyIGFzdDtcbiAgICAoZnVuY3Rpb24gKGFzdCkge1xuICAgICAgICB2YXIgQVNUID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIEFTVChpbXBsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWNjZXB0b3IgPSBpbXBsO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBBU1Q7XG4gICAgICAgIH0pKCk7XG4gICAgICAgIGFzdC5BU1QgPSBBU1Q7XG4gICAgICAgIHZhciBJZGVudGlmaWVyID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyhJZGVudGlmaWVyLCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gSWRlbnRpZmllcihuYW1lLCBzdGFydCwgZW5kKSB7XG4gICAgICAgICAgICAgICAgX3N1cGVyLmNhbGwodGhpcywgdGhpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmQgPSBlbmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBJZGVudGlmaWVyLnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbiAodmlzaXRvciwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpc2l0b3IudklkZW50aWZpZXIodGhpcywgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gSWRlbnRpZmllcjtcbiAgICAgICAgfSkoQVNUKTtcbiAgICAgICAgYXN0LklkZW50aWZpZXIgPSBJZGVudGlmaWVyO1xuICAgICAgICB2YXIgUG9zID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIFBvcyhvZmZzZXQsIGxpbmUsIGNvbHVtbikge1xuICAgICAgICAgICAgICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgICAgICAgICAgIHRoaXMubGluZSA9IGxpbmU7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2x1bW4gPSBjb2x1bW47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUG9zO1xuICAgICAgICB9KSgpO1xuICAgICAgICBhc3QuUG9zID0gUG9zO1xuICAgICAgICB2YXIgQ2xhc3MgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICAgICAgX19leHRlbmRzKENsYXNzLCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gQ2xhc3MobmFtZSwgbm90ZSwgcGFyZW50cywgY3JlYXRpb25DbGF1c2UsIGZlYXR1cmVMaXN0cykge1xuICAgICAgICAgICAgICAgIF9zdXBlci5jYWxsKHRoaXMsIHRoaXMpO1xuICAgICAgICAgICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5wdXNoKG5hbWUpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50cyA9IHBhcmVudHM7XG4gICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkodGhpcy5jaGlsZHJlbiwgcGFyZW50cyk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGlvbkNsYXVzZSA9IGNyZWF0aW9uQ2xhdXNlO1xuICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMuY2hpbGRyZW4sIGNyZWF0aW9uQ2xhdXNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZlYXR1cmVMaXN0cyA9IGZlYXR1cmVMaXN0cztcbiAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSh0aGlzLmNoaWxkcmVuLCBmZWF0dXJlTGlzdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgQ2xhc3MucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uICh2aXNpdG9yLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlzaXRvci52Q2xhc3ModGhpcywgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gQ2xhc3M7XG4gICAgICAgIH0pKEFTVCk7XG4gICAgICAgIGFzdC5DbGFzcyA9IENsYXNzO1xuICAgICAgICB2YXIgRmVhdHVyZUxpc3QgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICAgICAgX19leHRlbmRzKEZlYXR1cmVMaXN0LCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gRmVhdHVyZUxpc3QoZXhwb3J0cywgZmVhdHVyZXMpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuY2FsbCh0aGlzLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmV4cG9ydHMgPSBleHBvcnRzO1xuICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMuY2hpbGRyZW4sIGV4cG9ydHMpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmVhdHVyZXMgPSBmZWF0dXJlcztcbiAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSh0aGlzLmNoaWxkcmVuLCBmZWF0dXJlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBGZWF0dXJlTGlzdC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24gKHZpc2l0b3IsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB2aXNpdG9yLnZGZWF0dXJlTGlzdCh0aGlzLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBGZWF0dXJlTGlzdDtcbiAgICAgICAgfSkoQVNUKTtcbiAgICAgICAgYXN0LkZlYXR1cmVMaXN0ID0gRmVhdHVyZUxpc3Q7XG4gICAgICAgIHZhciBSb3V0aW5lID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyhSb3V0aW5lLCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gUm91dGluZShuYW1lLCBwYXJhbWV0ZXJzLCBhbGlhcywgcnQsIHByZWNvbmRpdGlvbnMsIGluc3RydWN0aW9ucywgcG9zdGNvbmRpdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuY2FsbCh0aGlzLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICAgICAgICAgIHRoaXMucGFyYW1ldGVycyA9IHBhcmFtZXRlcnM7XG4gICAgICAgICAgICAgICAgdGhpcy5hbGlhcyA9IGFsaWFzO1xuICAgICAgICAgICAgICAgIHRoaXMucHJlY29uZGl0aW9ucyA9IHByZWNvbmRpdGlvbnM7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0cnVjdGlvbnMgPSBpbnN0cnVjdGlvbnM7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3N0Y29uZGl0aW9ucyA9IHBvc3Rjb25kaXRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgUm91dGluZS5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24gKHZpc2l0b3IsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB2aXNpdG9yLnZSb3V0aW5lKHRoaXMsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIFJvdXRpbmU7XG4gICAgICAgIH0pKEFTVCk7XG4gICAgICAgIGFzdC5Sb3V0aW5lID0gUm91dGluZTtcbiAgICAgICAgdmFyIFBhcmFtZXRlciA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgICAgICBfX2V4dGVuZHMoUGFyYW1ldGVyLCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gUGFyYW1ldGVyKCkge1xuICAgICAgICAgICAgICAgIF9zdXBlci5jYWxsKHRoaXMsIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgUGFyYW1ldGVyLnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbiAodmlzaXRvciwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpc2l0b3IudlBhcmFtZXRlcih0aGlzLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBQYXJhbWV0ZXI7XG4gICAgICAgIH0pKEFTVCk7XG4gICAgICAgIGFzdC5QYXJhbWV0ZXIgPSBQYXJhbWV0ZXI7XG4gICAgICAgIHZhciBUeXBlID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyhUeXBlLCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gVHlwZSgpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuY2FsbCh0aGlzLCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFR5cGUucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uICh2aXNpdG9yLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlzaXRvci52VHlwZSh0aGlzLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBUeXBlO1xuICAgICAgICB9KShBU1QpO1xuICAgICAgICBhc3QuVHlwZSA9IFR5cGU7XG4gICAgICAgIHZhciBGdW5jdGlvbiA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgICAgICBfX2V4dGVuZHMoRnVuY3Rpb24sIF9zdXBlcik7XG4gICAgICAgICAgICBmdW5jdGlvbiBGdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIEZ1bmN0aW9uLnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbiAodmlzaXRvciwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpc2l0b3IudkZ1bmN0aW9uKHRoaXMsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIEZ1bmN0aW9uO1xuICAgICAgICB9KShSb3V0aW5lKTtcbiAgICAgICAgYXN0LkZ1bmN0aW9uID0gRnVuY3Rpb247XG4gICAgICAgIHZhciBQcm9jZWR1cmUgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICAgICAgX19leHRlbmRzKFByb2NlZHVyZSwgX3N1cGVyKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIFByb2NlZHVyZSgpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFByb2NlZHVyZS5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24gKHZpc2l0b3IsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB2aXNpdG9yLnZQcm9jZWR1cmUodGhpcywgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gUHJvY2VkdXJlO1xuICAgICAgICB9KShSb3V0aW5lKTtcbiAgICAgICAgYXN0LlByb2NlZHVyZSA9IFByb2NlZHVyZTtcbiAgICAgICAgdmFyIEFsaWFzID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyhBbGlhcywgX3N1cGVyKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIEFsaWFzKG5hbWUsIHN0YXJ0LCBlbmQpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuY2FsbCh0aGlzLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICAgICAgICAgICAgICB0aGlzLmVuZCA9IGVuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIEFsaWFzLnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbiAodmlzaXRvciwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpc2l0b3IudkFsaWFzKHRoaXMsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIEFsaWFzO1xuICAgICAgICB9KShBU1QpO1xuICAgICAgICBhc3QuQWxpYXMgPSBBbGlhcztcbiAgICAgICAgdmFyIEN1cnJlbnRFeHByZXNzaW9uID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyhDdXJyZW50RXhwcmVzc2lvbiwgX3N1cGVyKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIEN1cnJlbnRFeHByZXNzaW9uKHBvcywgZW5kKSB7XG4gICAgICAgICAgICAgICAgX3N1cGVyLmNhbGwodGhpcywgdGhpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydCA9IHBvcztcbiAgICAgICAgICAgICAgICB0aGlzLmVuZCA9IGVuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIEN1cnJlbnRFeHByZXNzaW9uLnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbiAodmlzaXRvciwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpc2l0b3IudkN1cnJlbnRFeHByKHRoaXMsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIEN1cnJlbnRFeHByZXNzaW9uO1xuICAgICAgICB9KShBU1QpO1xuICAgICAgICBhc3QuQ3VycmVudEV4cHJlc3Npb24gPSBDdXJyZW50RXhwcmVzc2lvbjtcbiAgICAgICAgdmFyIFZhck9yQ29uc3RBdHRyaWJ1dGUgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICAgICAgX19leHRlbmRzKFZhck9yQ29uc3RBdHRyaWJ1dGUsIF9zdXBlcik7XG4gICAgICAgICAgICBmdW5jdGlvbiBWYXJPckNvbnN0QXR0cmlidXRlKG5hbWUsIHJhd1R5cGUpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuY2FsbCh0aGlzLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICAgICAgICAgIHRoaXMucmF3VHlwZSA9IHJhd1R5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBWYXJPckNvbnN0QXR0cmlidXRlLnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbiAodmlzaXRvciwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpc2l0b3IudlZhck9yQ29uc3RBdHRyaWJ1dGUodGhpcywgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gVmFyT3JDb25zdEF0dHJpYnV0ZTtcbiAgICAgICAgfSkoQVNUKTtcbiAgICAgICAgYXN0LlZhck9yQ29uc3RBdHRyaWJ1dGUgPSBWYXJPckNvbnN0QXR0cmlidXRlO1xuICAgICAgICB2YXIgQXR0cmlidXRlID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyhBdHRyaWJ1dGUsIF9zdXBlcik7XG4gICAgICAgICAgICBmdW5jdGlvbiBBdHRyaWJ1dGUoKSB7XG4gICAgICAgICAgICAgICAgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBBdHRyaWJ1dGUucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uICh2aXNpdG9yLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlzaXRvci52QXR0cih0aGlzLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBBdHRyaWJ1dGU7XG4gICAgICAgIH0pKFZhck9yQ29uc3RBdHRyaWJ1dGUpO1xuICAgICAgICBhc3QuQXR0cmlidXRlID0gQXR0cmlidXRlO1xuICAgICAgICB2YXIgQ29uc3RhbnRBdHRyaWJ1dGUgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICAgICAgX19leHRlbmRzKENvbnN0YW50QXR0cmlidXRlLCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gQ29uc3RhbnRBdHRyaWJ1dGUobmFtZSwgcmF3VHlwZSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuY2FsbCh0aGlzLCBuYW1lLCByYXdUeXBlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBDb25zdGFudEF0dHJpYnV0ZS5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24gKHZpc2l0b3IsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB2aXNpdG9yLnZDb25zdGFudEF0dHJpYnV0ZSh0aGlzLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBDb25zdGFudEF0dHJpYnV0ZTtcbiAgICAgICAgfSkoVmFyT3JDb25zdEF0dHJpYnV0ZSk7XG4gICAgICAgIGFzdC5Db25zdGFudEF0dHJpYnV0ZSA9IENvbnN0YW50QXR0cmlidXRlO1xuICAgICAgICB2YXIgQ3JlYXRpb25DbGF1c2UgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICAgICAgX19leHRlbmRzKENyZWF0aW9uQ2xhdXNlLCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gQ3JlYXRpb25DbGF1c2UoaWRlbnRpZmllcnMpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuY2FsbCh0aGlzLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZlYXR1cmVzID0gaWRlbnRpZmllcnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBDcmVhdGlvbkNsYXVzZS5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24gKHZpc2l0b3IsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB2aXNpdG9yLnZDcmVhdGlvbkNsYXVzZSh0aGlzLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBDcmVhdGlvbkNsYXVzZTtcbiAgICAgICAgfSkoQVNUKTtcbiAgICAgICAgYXN0LkNyZWF0aW9uQ2xhdXNlID0gQ3JlYXRpb25DbGF1c2U7XG4gICAgICAgIHZhciBQYXJlbnQgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICAgICAgX19leHRlbmRzKFBhcmVudCwgX3N1cGVyKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIFBhcmVudCgpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuY2FsbCh0aGlzLCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFBhcmVudC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24gKHZpc2l0b3IsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB2aXNpdG9yLnZQYXJlbnQodGhpcywgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gUGFyZW50O1xuICAgICAgICB9KShBU1QpO1xuICAgICAgICBhc3QuUGFyZW50ID0gUGFyZW50O1xuICAgICAgICB2YXIgTGl0ZXJhbCA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgICAgICBfX2V4dGVuZHMoTGl0ZXJhbCwgX3N1cGVyKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIExpdGVyYWwoKSB7XG4gICAgICAgICAgICAgICAgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gTGl0ZXJhbDtcbiAgICAgICAgfSkoQVNUKTtcbiAgICAgICAgYXN0LkxpdGVyYWwgPSBMaXRlcmFsO1xuICAgICAgICB2YXIgQ2hhckxpdGVyYWwgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICAgICAgX19leHRlbmRzKENoYXJMaXRlcmFsLCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gQ2hhckxpdGVyYWwodmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuY2FsbCh0aGlzLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgICAgICAgICAgICAgIHRoaXMuZW5kID0gZW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgQ2hhckxpdGVyYWwucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uICh2aXNpdG9yLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlzaXRvci52Q2hhckxpdGVyYWwodGhpcywgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gQ2hhckxpdGVyYWw7XG4gICAgICAgIH0pKExpdGVyYWwpO1xuICAgICAgICBhc3QuQ2hhckxpdGVyYWwgPSBDaGFyTGl0ZXJhbDtcbiAgICAgICAgdmFyIEJvb2xlYW5MaXRlcmFsID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyhCb29sZWFuTGl0ZXJhbCwgX3N1cGVyKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIEJvb2xlYW5MaXRlcmFsKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gICAgICAgICAgICAgICAgX3N1cGVyLmNhbGwodGhpcywgdGhpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICAgICAgICAgICAgICB0aGlzLmVuZCA9IGVuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIEJvb2xlYW5MaXRlcmFsLnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbiAodmlzaXRvciwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpc2l0b3IudkJvb2xlYW5MaXRlcmFsKHRoaXMsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIEJvb2xlYW5MaXRlcmFsO1xuICAgICAgICB9KShMaXRlcmFsKTtcbiAgICAgICAgYXN0LkJvb2xlYW5MaXRlcmFsID0gQm9vbGVhbkxpdGVyYWw7XG4gICAgICAgIHZhciBJbnRMaXRlcmFsID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyhJbnRMaXRlcmFsLCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gSW50TGl0ZXJhbCh2YWx1ZSwgc3RhcnQsIGVuZCkge1xuICAgICAgICAgICAgICAgIF9zdXBlci5jYWxsKHRoaXMsIHRoaXMpO1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmQgPSBlbmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBJbnRMaXRlcmFsLnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbiAodmlzaXRvciwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpc2l0b3IudkludExpdGVyYWwodGhpcywgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gSW50TGl0ZXJhbDtcbiAgICAgICAgfSkoTGl0ZXJhbCk7XG4gICAgICAgIGFzdC5JbnRMaXRlcmFsID0gSW50TGl0ZXJhbDtcbiAgICAgICAgdmFyIFZvaWRMaXRlcmFsID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyhWb2lkTGl0ZXJhbCwgX3N1cGVyKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIFZvaWRMaXRlcmFsKHN0YXJ0LCBlbmQpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuY2FsbCh0aGlzLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmQgPSBlbmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBWb2lkTGl0ZXJhbC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24gKHZpc2l0b3IsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB2aXNpdG9yLnZWb2lkTGl0ZXJhbCh0aGlzLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBWb2lkTGl0ZXJhbDtcbiAgICAgICAgfSkoTGl0ZXJhbCk7XG4gICAgICAgIGFzdC5Wb2lkTGl0ZXJhbCA9IFZvaWRMaXRlcmFsO1xuICAgICAgICB2YXIgU3RyaW5nTGl0ZXJhbCA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgICAgICBfX2V4dGVuZHMoU3RyaW5nTGl0ZXJhbCwgX3N1cGVyKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIFN0cmluZ0xpdGVyYWwodmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuY2FsbCh0aGlzLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgICAgICAgICAgICAgIHRoaXMuZW5kID0gZW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgU3RyaW5nTGl0ZXJhbC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24gKHZpc2l0b3IsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB2aXNpdG9yLnZTdHJpbmdMaXRlcmFsKHRoaXMsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIFN0cmluZ0xpdGVyYWw7XG4gICAgICAgIH0pKExpdGVyYWwpO1xuICAgICAgICBhc3QuU3RyaW5nTGl0ZXJhbCA9IFN0cmluZ0xpdGVyYWw7XG4gICAgICAgIHZhciBBbGwgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gQWxsKCkge1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIEFsbDtcbiAgICAgICAgfSkoKTtcbiAgICAgICAgYXN0LkFsbCA9IEFsbDtcbiAgICAgICAgdmFyIEV4cG9ydENoYW5nZVNldCA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgICAgICBfX2V4dGVuZHMoRXhwb3J0Q2hhbmdlU2V0LCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gRXhwb3J0Q2hhbmdlU2V0KCkge1xuICAgICAgICAgICAgICAgIF9zdXBlci5jYWxsKHRoaXMsIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgRXhwb3J0Q2hhbmdlU2V0LnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbiAodmlzaXRvciwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpc2l0b3IudkV4cG9ydENoYW5nZVNldCh0aGlzLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBFeHBvcnRDaGFuZ2VTZXQ7XG4gICAgICAgIH0pKEFTVCk7XG4gICAgICAgIGFzdC5FeHBvcnRDaGFuZ2VTZXQgPSBFeHBvcnRDaGFuZ2VTZXQ7XG4gICAgICAgIHZhciBUeXBlSW5zdGFuY2UgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gVHlwZUluc3RhbmNlKCkge1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFR5cGVJbnN0YW5jZTtcbiAgICAgICAgfSkoKTtcbiAgICAgICAgYXN0LlR5cGVJbnN0YW5jZSA9IFR5cGVJbnN0YW5jZTtcbiAgICAgICAgdmFyIElmRWxzZSA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgICAgICBfX2V4dGVuZHMoSWZFbHNlLCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gSWZFbHNlKCkge1xuICAgICAgICAgICAgICAgIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgSWZFbHNlLnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbiAodmlzaXRvciwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpc2l0b3IudklmRWxzZSh0aGlzLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBJZkVsc2U7XG4gICAgICAgIH0pKEFTVCk7XG4gICAgICAgIGFzdC5JZkVsc2UgPSBJZkVsc2U7XG4gICAgICAgIHZhciBDb25kaXRpb24gPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICAgICAgX19leHRlbmRzKENvbmRpdGlvbiwgX3N1cGVyKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIENvbmRpdGlvbihsYWJlbCwgY29uZGl0aW9uKSB7XG4gICAgICAgICAgICAgICAgX3N1cGVyLmNhbGwodGhpcywgdGhpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25kaXRpb24gPSBjb25kaXRpb247XG4gICAgICAgICAgICAgICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgQ29uZGl0aW9uLnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbiAodmlzaXRvciwgYXJnKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBzaG91bGQgbm90IGJlIGNhbGxlZFwiKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gQ29uZGl0aW9uO1xuICAgICAgICB9KShBU1QpO1xuICAgICAgICBhc3QuQ29uZGl0aW9uID0gQ29uZGl0aW9uO1xuICAgICAgICB2YXIgUHJlY29uZGl0aW9uID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyhQcmVjb25kaXRpb24sIF9zdXBlcik7XG4gICAgICAgICAgICBmdW5jdGlvbiBQcmVjb25kaXRpb24oKSB7XG4gICAgICAgICAgICAgICAgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBQcmVjb25kaXRpb24ucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uICh2aXNpdG9yLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlzaXRvci52UHJlY29uZGl0aW9uKHRoaXMsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIFByZWNvbmRpdGlvbjtcbiAgICAgICAgfSkoQ29uZGl0aW9uKTtcbiAgICAgICAgYXN0LlByZWNvbmRpdGlvbiA9IFByZWNvbmRpdGlvbjtcbiAgICAgICAgdmFyIFBvc3Rjb25kaXRpb24gPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICAgICAgX19leHRlbmRzKFBvc3Rjb25kaXRpb24sIF9zdXBlcik7XG4gICAgICAgICAgICBmdW5jdGlvbiBQb3N0Y29uZGl0aW9uKCkge1xuICAgICAgICAgICAgICAgIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgUG9zdGNvbmRpdGlvbi5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24gKHZpc2l0b3IsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB2aXNpdG9yLnZQb3N0Y29uZGl0aW9uKHRoaXMsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIFBvc3Rjb25kaXRpb247XG4gICAgICAgIH0pKENvbmRpdGlvbik7XG4gICAgICAgIGFzdC5Qb3N0Y29uZGl0aW9uID0gUG9zdGNvbmRpdGlvbjtcbiAgICAgICAgdmFyIEZvclVudGlsSW5zdHJ1Y3Rpb24gPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICAgICAgX19leHRlbmRzKEZvclVudGlsSW5zdHJ1Y3Rpb24sIF9zdXBlcik7XG4gICAgICAgICAgICBmdW5jdGlvbiBGb3JVbnRpbEluc3RydWN0aW9uKCkge1xuICAgICAgICAgICAgICAgIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgRm9yVW50aWxJbnN0cnVjdGlvbi5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24gKHZpc2l0b3IsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB2aXNpdG9yLnZGb3JVbnRpbCh0aGlzLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBGb3JVbnRpbEluc3RydWN0aW9uO1xuICAgICAgICB9KShBU1QpO1xuICAgICAgICBhc3QuRm9yVW50aWxJbnN0cnVjdGlvbiA9IEZvclVudGlsSW5zdHJ1Y3Rpb247XG4gICAgICAgIHZhciBBc3NpZ25tZW50ID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyhBc3NpZ25tZW50LCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gQXNzaWdubWVudChsZWZ0LCByaWdodCkge1xuICAgICAgICAgICAgICAgIF9zdXBlci5jYWxsKHRoaXMsIHRoaXMpO1xuICAgICAgICAgICAgICAgIHRoaXMubGVmdCA9IGxlZnQ7XG4gICAgICAgICAgICAgICAgdGhpcy5yaWdodCA9IHJpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgQXNzaWdubWVudC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24gKHZpc2l0b3IsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB2aXNpdG9yLnZBc3NpZ25tZW50KHRoaXMsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIEFzc2lnbm1lbnQ7XG4gICAgICAgIH0pKEFTVCk7XG4gICAgICAgIGFzdC5Bc3NpZ25tZW50ID0gQXNzaWdubWVudDtcbiAgICAgICAgdmFyIENyZWF0ZUluc3RydWN0aW9uID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyhDcmVhdGVJbnN0cnVjdGlvbiwgX3N1cGVyKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIENyZWF0ZUluc3RydWN0aW9uKHRhcmdldCwgbWV0aG9kLCBhcmd1bWVudHMpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuY2FsbCh0aGlzLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICAgICAgICAgICAgICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgICAgICAgICAgICB0aGlzLmFyZ3VtZW50cyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIENyZWF0ZUluc3RydWN0aW9uLnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbiAodmlzaXRvciwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpc2l0b3IudkNyZWF0ZUluc3RydWN0aW9uKHRoaXMsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIENyZWF0ZUluc3RydWN0aW9uO1xuICAgICAgICB9KShBU1QpO1xuICAgICAgICBhc3QuQ3JlYXRlSW5zdHJ1Y3Rpb24gPSBDcmVhdGVJbnN0cnVjdGlvbjtcbiAgICAgICAgdmFyIFVuYXJ5T3AgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICAgICAgX19leHRlbmRzKFVuYXJ5T3AsIF9zdXBlcik7XG4gICAgICAgICAgICBmdW5jdGlvbiBVbmFyeU9wKCkge1xuICAgICAgICAgICAgICAgIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgVW5hcnlPcC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24gKHZpc2l0b3IsIGFyZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB2aXNpdG9yLnZVbmFyeU9wKHRoaXMsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIFVuYXJ5T3A7XG4gICAgICAgIH0pKEFTVCk7XG4gICAgICAgIGFzdC5VbmFyeU9wID0gVW5hcnlPcDtcbiAgICAgICAgdmFyIEJpbmFyeU9wID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyhCaW5hcnlPcCwgX3N1cGVyKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIEJpbmFyeU9wKCkge1xuICAgICAgICAgICAgICAgIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgQmluYXJ5T3AucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uICh2aXNpdG9yLCBhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlzaXRvci52QmluYXJ5T3AodGhpcywgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gQmluYXJ5T3A7XG4gICAgICAgIH0pKEFTVCk7XG4gICAgICAgIGFzdC5CaW5hcnlPcCA9IEJpbmFyeU9wO1xuICAgICAgICB2YXIgc3RyaW5nVG9VbmFyeU9wID0ge1xuICAgICAgICAgICAgXCItXCI6IDAgLyogTWludXMgKi8sXG4gICAgICAgICAgICBcIitcIjogMSAvKiBQbHVzICovLFxuICAgICAgICAgICAgXCJub3RcIjogMiAvKiBOb3QgKi8sXG4gICAgICAgICAgICBcIm9sZFwiOiAzIC8qIE9sZCAqLyxcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHN0cmluZ1RvQmluYXJ5T3AgPSB7XG4gICAgICAgICAgICBcIi1cIjogMCAvKiBNaW51cyAqLyxcbiAgICAgICAgICAgIFwiK1wiOiAxIC8qIFBsdXMgKi8sXG4gICAgICAgICAgICBcIipcIjogMiAvKiBNdWx0aXBsaWNhdGlvbiAqLyxcbiAgICAgICAgICAgIFwiL1wiOiAzIC8qIERpdmlzaW9uICovLFxuICAgICAgICAgICAgXCIvL1wiOiA0IC8qIEludGVnZXJEaXZpc2lvbiAqLyxcbiAgICAgICAgICAgIFwiXFxcXFxcXFxcIjogNSAvKiBNb2R1bG8gKi8sXG4gICAgICAgICAgICBcIl5cIjogNiAvKiBFeHBvbmVudGlhbCAqLyxcbiAgICAgICAgICAgIFwiLi5cIjogNyAvKiBEb3REb3QgKi8sXG4gICAgICAgICAgICBcIj1cIjogOCAvKiBJZGVudGljYWwgKi8sXG4gICAgICAgICAgICBcIi89XCI6IDkgLyogTm90SWRlbnRpY2FsICovLFxuICAgICAgICAgICAgXCJ+XCI6IDEwIC8qIElzRXF1YWwgKi8sXG4gICAgICAgICAgICBcIi9+XCI6IDExIC8qIE5vdElzRXF1YWwgKi8sXG4gICAgICAgICAgICBcIjxcIjogMTIgLyogTGVzc1RoYW4gKi8sXG4gICAgICAgICAgICBcIj5cIjogMTMgLyogR3JlYXRlclRoYW4gKi8sXG4gICAgICAgICAgICBcIjw9XCI6IDE0IC8qIExlc3NPckVxdWFsICovLFxuICAgICAgICAgICAgXCI+PVwiOiAxNSAvKiBHcmVhdGVyT3JFcXVhbCAqLyxcbiAgICAgICAgICAgIFwiYW5kXCI6IDE2IC8qIEFuZCAqLyxcbiAgICAgICAgICAgIFwiYW5kIHRoZW5cIjogMTcgLyogQW5kVGhlbiAqLyxcbiAgICAgICAgICAgIFwib3JcIjogMTggLyogT3IgKi8sXG4gICAgICAgICAgICBcIm9yIGVsc2VcIjogMTkgLyogT3JFbHNlICovLFxuICAgICAgICAgICAgXCJ4b3JcIjogMjAgLyogWG9yICovLFxuICAgICAgICAgICAgXCJpbXBsaWVzXCI6IDIxIC8qIEltcGxpZXMgKi8sXG4gICAgICAgIH07XG4gICAgICAgIHZhciBDYWxsRXhwcmVzc2lvbiA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgICAgICBfX2V4dGVuZHMoQ2FsbEV4cHJlc3Npb24sIF9zdXBlcik7XG4gICAgICAgICAgICBmdW5jdGlvbiBDYWxsRXhwcmVzc2lvbigpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIENhbGxFeHByZXNzaW9uLnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbiAodmlzaXRvciwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpc2l0b3IudkNhbGxFeHByZXNzaW9uKHRoaXMsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIENhbGxFeHByZXNzaW9uO1xuICAgICAgICB9KShBU1QpO1xuICAgICAgICBhc3QuQ2FsbEV4cHJlc3Npb24gPSBDYWxsRXhwcmVzc2lvbjtcbiAgICAgICAgdmFyIEluZGV4RXhwcmVzc2lvbiA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgICAgICBfX2V4dGVuZHMoSW5kZXhFeHByZXNzaW9uLCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gSW5kZXhFeHByZXNzaW9uKCkge1xuICAgICAgICAgICAgICAgIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgSW5kZXhFeHByZXNzaW9uLnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbiAodmlzaXRvciwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpc2l0b3IudkluZGV4RXhwcmVzc2lvbih0aGlzLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBJbmRleEV4cHJlc3Npb247XG4gICAgICAgIH0pKEFTVCk7XG4gICAgICAgIGFzdC5JbmRleEV4cHJlc3Npb24gPSBJbmRleEV4cHJlc3Npb247XG4gICAgfSkoYXN0ID0gZWlmZmVsLmFzdCB8fCAoZWlmZmVsLmFzdCA9IHt9KSk7XG59KShlaWZmZWwgfHwgKGVpZmZlbCA9IHt9KSk7XG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ2aXNpdG9yLnRzXCIgLz5cbnZhciBfX2V4dGVuZHMgPSB0aGlzLl9fZXh0ZW5kcyB8fCBmdW5jdGlvbiAoZCwgYikge1xuICAgIGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdO1xuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgIF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlO1xuICAgIGQucHJvdG90eXBlID0gbmV3IF9fKCk7XG59O1xudmFyIGVpZmZlbDtcbihmdW5jdGlvbiAoZWlmZmVsKSB7XG4gICAgdmFyIHNlbWFudGljcztcbiAgICAoZnVuY3Rpb24gKHNlbWFudGljcykge1xuICAgICAgICBmdW5jdGlvbiBhbmFseXplKGFzdHMpIHtcbiAgICAgICAgICAgIHZhciBhbmFseXNpc0NvbnRleHQgPSBuZXcgQW5hbHlzaXNDb250ZXh0KCk7XG4gICAgICAgICAgICBhc3RzLmZvckVhY2goZnVuY3Rpb24gKGFzdCkge1xuICAgICAgICAgICAgICAgIGFzdC5hY2NlcHQobmV3IEZlYXR1cmVEaXNjb3ZlcnkoYW5hbHlzaXNDb250ZXh0LmNsYXNzU3ltYm9scyksIG51bGwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBzZW1hbnRpY3MuYW5hbHl6ZSA9IGFuYWx5emU7XG4gICAgICAgIHZhciBBbmFseXNpc0NvbnRleHQgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gQW5hbHlzaXNDb250ZXh0KCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xhc3NTeW1ib2xzID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gQW5hbHlzaXNDb250ZXh0O1xuICAgICAgICB9KSgpO1xuICAgICAgICB2YXIgRmVhdHVyZURpc2NvdmVyeSA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgICAgICAgICBfX2V4dGVuZHMoRmVhdHVyZURpc2NvdmVyeSwgX3N1cGVyKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIEZlYXR1cmVEaXNjb3ZlcnkoY2xhc3NTeW1ib2xzKSB7XG4gICAgICAgICAgICAgICAgX3N1cGVyLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGFzc1N5bWJvbHMgPSBjbGFzc1N5bWJvbHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBGZWF0dXJlRGlzY292ZXJ5LnByb3RvdHlwZS52Q2xhc3MgPSBmdW5jdGlvbiAoX2NsYXNzLCBhcmcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhfY2xhc3MubmFtZS5uYW1lKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhfY2xhc3MpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZDaGlsZHJlbihfY2xhc3MsIF9jbGFzcyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgRmVhdHVyZURpc2NvdmVyeS5wcm90b3R5cGUudkZlYXR1cmUgPSBmdW5jdGlvbiAoZmVhdHVyZSwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9zdXBlci5wcm90b3R5cGUudkZlYXR1cmUuY2FsbCh0aGlzLCBmZWF0dXJlLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIEZlYXR1cmVEaXNjb3ZlcnkucHJvdG90eXBlLnZBdHRyID0gZnVuY3Rpb24gKGF0dHIsIGFyZykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGF0dHIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBfc3VwZXIucHJvdG90eXBlLnZBdHRyLmNhbGwodGhpcywgYXR0ciwgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBGZWF0dXJlRGlzY292ZXJ5LnByb3RvdHlwZS52RnVuY3Rpb24gPSBmdW5jdGlvbiAoZnVuYywgYXJnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZnVuYyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9zdXBlci5wcm90b3R5cGUudkZ1bmN0aW9uLmNhbGwodGhpcywgZnVuYywgYXJnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBGZWF0dXJlRGlzY292ZXJ5LnByb3RvdHlwZS52UHJvY2VkdXJlID0gZnVuY3Rpb24gKHByb2NlZHVyZSwgYXJnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocHJvY2VkdXJlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3N1cGVyLnByb3RvdHlwZS52UHJvY2VkdXJlLmNhbGwodGhpcywgcHJvY2VkdXJlLCBhcmcpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIEZlYXR1cmVEaXNjb3ZlcnkucHJvdG90eXBlLnZDb25zdGFudEF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChjb25zdGFudEF0dHJpYnV0ZSwgYXJnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9zdXBlci5wcm90b3R5cGUudkNvbnN0YW50QXR0cmlidXRlLmNhbGwodGhpcywgY29uc3RhbnRBdHRyaWJ1dGUsIGFyZyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIEZlYXR1cmVEaXNjb3Zlcnk7XG4gICAgICAgIH0pKGVpZmZlbC5hc3QuVmlzaXRvcik7XG4gICAgfSkoc2VtYW50aWNzID0gZWlmZmVsLnNlbWFudGljcyB8fCAoZWlmZmVsLnNlbWFudGljcyA9IHt9KSk7XG59KShlaWZmZWwgfHwgKGVpZmZlbCA9IHt9KSk7XG5cbnZhciBfX2V4dGVuZHMgPSB0aGlzLl9fZXh0ZW5kcyB8fCBmdW5jdGlvbiAoZCwgYikge1xuICAgIGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdO1xuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgIF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlO1xuICAgIGQucHJvdG90eXBlID0gbmV3IF9fKCk7XG59O1xudmFyIGVpZmZlbDtcbihmdW5jdGlvbiAoZWlmZmVsKSB7XG4gICAgdmFyIHN5bWJvbHM7XG4gICAgKGZ1bmN0aW9uIChzeW1ib2xzKSB7XG4gICAgICAgIHZhciBTeW1ib2wgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gU3ltYm9sKCkge1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFN5bWJvbDtcbiAgICAgICAgfSkoKTtcbiAgICAgICAgc3ltYm9scy5TeW1ib2wgPSBTeW1ib2w7XG4gICAgICAgIHZhciBSb3V0aW5lU3ltYm9sID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyhSb3V0aW5lU3ltYm9sLCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gUm91dGluZVN5bWJvbCgpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSb3V0aW5lU3ltYm9sO1xuICAgICAgICB9KShTeW1ib2wpO1xuICAgICAgICBzeW1ib2xzLlJvdXRpbmVTeW1ib2wgPSBSb3V0aW5lU3ltYm9sO1xuICAgICAgICB2YXIgRnVuY3Rpb25TeW1ib2wgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICAgICAgX19leHRlbmRzKEZ1bmN0aW9uU3ltYm9sLCBfc3VwZXIpO1xuICAgICAgICAgICAgZnVuY3Rpb24gRnVuY3Rpb25TeW1ib2woKSB7XG4gICAgICAgICAgICAgICAgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gRnVuY3Rpb25TeW1ib2w7XG4gICAgICAgIH0pKFJvdXRpbmVTeW1ib2wpO1xuICAgICAgICBzeW1ib2xzLkZ1bmN0aW9uU3ltYm9sID0gRnVuY3Rpb25TeW1ib2w7XG4gICAgICAgIHZhciBQcm9jZWR1cmVTeW1ib2wgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICAgICAgX19leHRlbmRzKFByb2NlZHVyZVN5bWJvbCwgX3N1cGVyKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIFByb2NlZHVyZVN5bWJvbCgpIHtcbiAgICAgICAgICAgICAgICBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBQcm9jZWR1cmVTeW1ib2w7XG4gICAgICAgIH0pKFJvdXRpbmVTeW1ib2wpO1xuICAgICAgICBzeW1ib2xzLlByb2NlZHVyZVN5bWJvbCA9IFByb2NlZHVyZVN5bWJvbDtcbiAgICAgICAgdmFyIENsYXNzU3ltYm9sID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICAgICAgICAgIF9fZXh0ZW5kcyhDbGFzc1N5bWJvbCwgX3N1cGVyKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIENsYXNzU3ltYm9sKCkge1xuICAgICAgICAgICAgICAgIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIHRoaXMuZnVuY3Rpb25zID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9jZWR1cmVzID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gQ2xhc3NTeW1ib2w7XG4gICAgICAgIH0pKFN5bWJvbCk7XG4gICAgICAgIHN5bWJvbHMuQ2xhc3NTeW1ib2wgPSBDbGFzc1N5bWJvbDtcbiAgICB9KShzeW1ib2xzID0gZWlmZmVsLnN5bWJvbHMgfHwgKGVpZmZlbC5zeW1ib2xzID0ge30pKTtcbn0pKGVpZmZlbCB8fCAoZWlmZmVsID0ge30pKTtcblxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidmlzaXRvci50c1wiIC8+XG5cbm1vZHVsZSBlaWZmZWwuYXN0IHtcblxuICBleHBvcnQgaW50ZXJmYWNlIFZpc2l0b3JBY2NlcHRvciBleHRlbmRzIEFTVCB7XG4gICAgY2hpbGRyZW46IEFTVFtdO1xuICAgIGFjY2VwdDxBLCBSPih2aXNpdG9yOlZpc2l0b3I8QSwgUj4sIGFyZzpBKTogUjtcbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBBU1Qge1xuICAgIGNvbnN0cnVjdG9yKGltcGw6VmlzaXRvckFjY2VwdG9yKSB7XG4gICAgICB0aGlzLl9hY2NlcHRvciA9IGltcGw7XG4gICAgICB0aGlzLmNoaWxkcmVuID0gW107XG4gICAgfVxuXG4gICAgY2hpbGRyZW46QVNUW107XG4gICAgX2FjY2VwdG9yOlZpc2l0b3JBY2NlcHRvcjtcbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBJZGVudGlmaWVyIGV4dGVuZHMgQVNUIGltcGxlbWVudHMgVmlzaXRvckFjY2VwdG9yIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lOnN0cmluZywgc3RhcnQ6ZWlmZmVsLmFzdC5Qb3MsIGVuZDplaWZmZWwuYXN0LlBvcykge1xuICAgICAgc3VwZXIodGhpcyk7XG5cbiAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICB0aGlzLmVuZCA9IGVuZDtcbiAgICB9XG5cbiAgICBhY2NlcHQ8QSwgUj4odmlzaXRvcjpWaXNpdG9yPEEsIFI+LCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdmlzaXRvci52SWRlbnRpZmllcih0aGlzLCBhcmcpO1xuICAgIH1cblxuICAgIG5hbWU6c3RyaW5nO1xuICAgIHN0YXJ0OlBvcztcbiAgICBlbmQ6UG9zO1xuICB9XG5cbiAgZXhwb3J0IGNsYXNzIFBvcyB7XG4gICAgY29uc3RydWN0b3Iob2Zmc2V0LCBsaW5lLCBjb2x1bW4pIHtcbiAgICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgdGhpcy5saW5lID0gbGluZTtcbiAgICAgIHRoaXMuY29sdW1uID0gY29sdW1uO1xuICAgIH1cblxuICAgIC8vIFplcm8gYmFzZWQgaW5kZXggcmVzcGVjdGl2ZSB0byBzdGFydCBvZiBpbnB1dFxuICAgIG9mZnNldDpudW1iZXI7XG4gICAgLy8gMSBiYXNlZCBsaW5lIG51bWJlclxuICAgIGxpbmU6bnVtYmVyO1xuICAgIC8vIDEgYmFzZWQgY29sdW1uIG51bWJlclxuICAgIGNvbHVtbjpudW1iZXI7XG4gIH1cblxuICBleHBvcnQgY2xhc3MgQ2xhc3MgZXh0ZW5kcyBBU1QgaW1wbGVtZW50cyBWaXNpdG9yQWNjZXB0b3Ige1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgbmFtZTogSWRlbnRpZmllcixcbiAgICAgIG5vdGU6IGFueSwgcGFyZW50czogUGFyZW50W10sXG4gICAgICBjcmVhdGlvbkNsYXVzZTogSWRlbnRpZmllcltdLFxuICAgICAgZmVhdHVyZUxpc3RzOiBGZWF0dXJlTGlzdFtdXG4gICAgKSB7XG4gICAgICBzdXBlcih0aGlzKTtcbiAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICB0aGlzLmNoaWxkcmVuLnB1c2gobmFtZSk7XG5cbiAgICAgIHRoaXMucGFyZW50cyA9IHBhcmVudHM7XG4gICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSh0aGlzLmNoaWxkcmVuLCBwYXJlbnRzKTtcblxuICAgICAgdGhpcy5jcmVhdGlvbkNsYXVzZSA9IGNyZWF0aW9uQ2xhdXNlO1xuICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkodGhpcy5jaGlsZHJlbiwgY3JlYXRpb25DbGF1c2UpO1xuXG4gICAgICB0aGlzLmZlYXR1cmVMaXN0cyA9IGZlYXR1cmVMaXN0cztcbiAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMuY2hpbGRyZW4sIGZlYXR1cmVMaXN0cyk7XG4gICAgfVxuXG4gICAgY2hpbGRyZW46QVNUW107XG5cbiAgICBuYW1lOklkZW50aWZpZXI7XG4gICAgcGFyZW50czpQYXJlbnRbXTtcbiAgICBjcmVhdGlvbkNsYXVzZTpJZGVudGlmaWVyW107XG4gICAgZmVhdHVyZUxpc3RzOkZlYXR1cmVMaXN0W107XG5cbiAgICBhY2NlcHQ8QSwgUj4odmlzaXRvcjpWaXNpdG9yPEEsIFI+LCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdmlzaXRvci52Q2xhc3ModGhpcywgYXJnKTtcbiAgICB9XG4gIH1cblxuICBleHBvcnQgY2xhc3MgRmVhdHVyZUxpc3QgZXh0ZW5kcyBBU1QgaW1wbGVtZW50cyBWaXNpdG9yQWNjZXB0b3Ige1xuICAgIGNvbnN0cnVjdG9yKGV4cG9ydHM6IElkZW50aWZpZXJbXSwgZmVhdHVyZXM6IEZlYXR1cmVbXSkge1xuICAgICAgc3VwZXIodGhpcyk7XG4gICAgICB0aGlzLmV4cG9ydHMgPSBleHBvcnRzO1xuICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkodGhpcy5jaGlsZHJlbiwgZXhwb3J0cyk7XG4gICAgICB0aGlzLmZlYXR1cmVzID0gZmVhdHVyZXM7XG4gICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSh0aGlzLmNoaWxkcmVuLCBmZWF0dXJlcyk7XG4gICAgfVxuXG4gICAgZXhwb3J0czpJZGVudGlmaWVyW107XG4gICAgZmVhdHVyZXM6RmVhdHVyZVtdO1xuXG4gICAgYWNjZXB0PEEsIFI+KHZpc2l0b3I6VmlzaXRvcjxBLCBSPiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHZpc2l0b3IudkZlYXR1cmVMaXN0KHRoaXMsIGFyZyk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGludGVyZmFjZSBGZWF0dXJlIGV4dGVuZHMgQVNULCBWaXNpdG9yQWNjZXB0b3Ige1xuICAgIG5hbWU6IElkZW50aWZpZXI7XG4gIH1cblxuICBleHBvcnQgY2xhc3MgUm91dGluZSBleHRlbmRzIEFTVCBpbXBsZW1lbnRzIEZlYXR1cmUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWU6IElkZW50aWZpZXIsIHBhcmFtZXRlcnM6IFBhcmFtZXRlcltdLCBhbGlhczogQWxpYXMsIHJ0OiBhbnksIHByZWNvbmRpdGlvbnM6IFByZWNvbmRpdGlvbltdLCBpbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10sIHBvc3Rjb25kaXRpb25zOiBQb3N0Y29uZGl0aW9uW10pIHtcbiAgICAgIHN1cGVyKHRoaXMpO1xuICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgIHRoaXMucGFyYW1ldGVycyA9IHBhcmFtZXRlcnM7XG4gICAgICB0aGlzLmFsaWFzID0gYWxpYXM7XG4gICAgICB0aGlzLnByZWNvbmRpdGlvbnMgPSBwcmVjb25kaXRpb25zO1xuICAgICAgdGhpcy5pbnN0cnVjdGlvbnMgPSBpbnN0cnVjdGlvbnM7XG4gICAgICB0aGlzLnBvc3Rjb25kaXRpb25zID0gcG9zdGNvbmRpdGlvbnM7XG4gICAgfVxuXG4gICAgY2hpbGRyZW46QVNUW107XG4gICAgX2FjY2VwdG9yOlZpc2l0b3JBY2NlcHRvcjtcbiAgICBuYW1lOklkZW50aWZpZXI7XG4gICAgaW5zdHJ1Y3Rpb25zOmVpZmZlbC5hc3QuSW5zdHJ1Y3Rpb25bXTtcbiAgICBwcmVjb25kaXRpb25zOlByZWNvbmRpdGlvbltdO1xuICAgIHBvc3Rjb25kaXRpb25zOlBvc3Rjb25kaXRpb25bXTtcbiAgICBwYXJhbWV0ZXJzOlBhcmFtZXRlcltdO1xuICAgIHN5bTogZWlmZmVsLnN5bWJvbHMuUm91dGluZVN5bWJvbDtcbiAgICBhbGlhczogQWxpYXM7XG5cbiAgICBhY2NlcHQ8QSwgUj4odmlzaXRvcjpWaXNpdG9yPEEsIFI+LCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdmlzaXRvci52Um91dGluZSh0aGlzLCBhcmcpO1xuICAgIH1cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBQYXJhbWV0ZXIgZXh0ZW5kcyBBU1QgaW1wbGVtZW50cyBWaXNpdG9yQWNjZXB0b3Ige1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgc3VwZXIodGhpcyk7XG4gICAgfVxuXG4gICAgbmFtZTpJZGVudGlmaWVyO1xuXG4gICAgYWNjZXB0PEEsIFI+KHZpc2l0b3I6VmlzaXRvcjxBLCBSPiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHZpc2l0b3IudlBhcmFtZXRlcih0aGlzLCBhcmcpO1xuICAgIH1cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBUeXBlIGV4dGVuZHMgQVNUIGltcGxlbWVudHMgVmlzaXRvckFjY2VwdG9yIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHN1cGVyKHRoaXMpO1xuICAgIH1cblxuICAgIG5hbWU6SWRlbnRpZmllcjtcbiAgICBwYXJhbWV0ZXJzOlR5cGVbXTtcblxuICAgIGFjY2VwdDxBLCBSPih2aXNpdG9yOlZpc2l0b3I8QSwgUj4sIGFyZzpBKTpSIHtcbiAgICAgIHJldHVybiB2aXNpdG9yLnZUeXBlKHRoaXMsIGFyZyk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIEZ1bmN0aW9uIGV4dGVuZHMgUm91dGluZSB7XG4gICAgYWNjZXB0PEEsIFI+KHZpc2l0b3I6VmlzaXRvcjxBLCBSPiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHZpc2l0b3IudkZ1bmN0aW9uKHRoaXMsIGFyZyk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIFByb2NlZHVyZSBleHRlbmRzIFJvdXRpbmUge1xuICAgIGFjY2VwdDxBLCBSPih2aXNpdG9yOlZpc2l0b3I8QSwgUj4sIGFyZzpBKTpSIHtcbiAgICAgIHJldHVybiB2aXNpdG9yLnZQcm9jZWR1cmUodGhpcywgYXJnKTtcbiAgICB9XG4gIH1cblxuICBleHBvcnQgY2xhc3MgQWxpYXMgZXh0ZW5kcyBBU1QgaW1wbGVtZW50cyBWaXNpdG9yQWNjZXB0b3Ige1xuICAgIG5hbWU6ZWlmZmVsLmFzdC5TdHJpbmdMaXRlcmFsO1xuICAgIHN0YXJ0OmVpZmZlbC5hc3QuUG9zO1xuICAgIGVuZDplaWZmZWwuYXN0LlBvcztcblxuICAgIGNvbnN0cnVjdG9yKG5hbWU6IFN0cmluZ0xpdGVyYWwsIHN0YXJ0OiBQb3MsIGVuZDogUG9zKSB7XG4gICAgICBzdXBlcih0aGlzKTtcbiAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICB0aGlzLmVuZCA9IGVuZDtcbiAgICB9XG5cbiAgICBhY2NlcHQ8QSwgUj4odmlzaXRvcjpWaXNpdG9yPEEsIFI+LCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdmlzaXRvci52QWxpYXModGhpcywgYXJnKTtcbiAgICB9XG4gIH1cblxuICBleHBvcnQgY2xhc3MgQ3VycmVudEV4cHJlc3Npb24gZXh0ZW5kcyBBU1QgaW1wbGVtZW50cyBFeHByZXNzaW9uIHtcbiAgICBjb25zdHJ1Y3Rvcihwb3M6IFBvcywgZW5kOiBQb3MpIHtcbiAgICAgIHN1cGVyKHRoaXMpO1xuICAgICAgdGhpcy5zdGFydCA9IHBvcztcbiAgICAgIHRoaXMuZW5kID0gZW5kO1xuICAgIH1cblxuICAgIHN0YXJ0OiBQb3M7XG4gICAgZW5kOiBQb3M7XG5cbiAgICBzeW06IFR5cGVJbnN0YW5jZTtcblxuICAgIGFjY2VwdDxBLCBSPih2aXNpdG9yOlZpc2l0b3I8QSwgUj4sIGFyZzpBKTpSIHtcbiAgICAgIHJldHVybiB2aXNpdG9yLnZDdXJyZW50RXhwcih0aGlzLCBhcmcpO1xuICAgIH1cbiAgfVxuXG5cbiAgZXhwb3J0IGNsYXNzIFZhck9yQ29uc3RBdHRyaWJ1dGUgZXh0ZW5kcyBBU1QgaW1wbGVtZW50cyBGZWF0dXJlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBJZGVudGlmaWVyLCByYXdUeXBlOiBUeXBlKSB7XG4gICAgICBzdXBlcih0aGlzKTtcbiAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICB0aGlzLnJhd1R5cGUgPSByYXdUeXBlO1xuICAgIH1cblxuICAgIG5hbWU6SWRlbnRpZmllcjtcbiAgICByYXdUeXBlOmVpZmZlbC5hc3QuVHlwZTtcblxuICAgIGFjY2VwdDxBLCBSPih2aXNpdG9yOlZpc2l0b3I8QSwgUj4sIGFyZzpBKTpSIHtcbiAgICAgIHJldHVybiB2aXNpdG9yLnZWYXJPckNvbnN0QXR0cmlidXRlKHRoaXMsIGFyZyk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIEF0dHJpYnV0ZSBleHRlbmRzIFZhck9yQ29uc3RBdHRyaWJ1dGUge1xuICAgIGFjY2VwdDxBLCBSPih2aXNpdG9yOlZpc2l0b3I8QSwgUj4sIGFyZzpBKTpSIHtcbiAgICAgIHJldHVybiB2aXNpdG9yLnZBdHRyKHRoaXMsIGFyZyk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIENvbnN0YW50QXR0cmlidXRlIGV4dGVuZHMgVmFyT3JDb25zdEF0dHJpYnV0ZSB7XG4gICAgY29uc3RydWN0b3IobmFtZTogZWlmZmVsLmFzdC5JZGVudGlmaWVyLCByYXdUeXBlOiBlaWZmZWwuYXN0LlR5cGUsIHZhbHVlOiBlaWZmZWwuYXN0LkxpdGVyYWw8YW55Pikge1xuICAgICAgc3VwZXIobmFtZSwgcmF3VHlwZSk7XG4gICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuXG4gICAgdmFsdWU6IExpdGVyYWw8YW55PlxuXG4gICAgYWNjZXB0PEEsIFI+KHZpc2l0b3I6VmlzaXRvcjxBLCBSPiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHZpc2l0b3IudkNvbnN0YW50QXR0cmlidXRlKHRoaXMsIGFyZyk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIENyZWF0aW9uQ2xhdXNlIGV4dGVuZHMgQVNUIGltcGxlbWVudHMgSW5zdHJ1Y3Rpb24sIFZpc2l0b3JBY2NlcHRvciB7XG4gICAgY29uc3RydWN0b3IoaWRlbnRpZmllcnM6SWRlbnRpZmllcltdKSB7XG4gICAgICBzdXBlcih0aGlzKTtcbiAgICAgIHRoaXMuZmVhdHVyZXMgPSBpZGVudGlmaWVycztcbiAgICB9XG5cbiAgICBmZWF0dXJlczpJZGVudGlmaWVyW107XG5cbiAgICBzeW06VHlwZUluc3RhbmNlO1xuXG4gICAgYWNjZXB0PEEsIFI+KHZpc2l0b3I6VmlzaXRvcjxBLCBSPiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHZpc2l0b3IudkNyZWF0aW9uQ2xhdXNlKHRoaXMsIGFyZyk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIFBhcmVudCBleHRlbmRzIEFTVCBpbXBsZW1lbnRzIFZpc2l0b3JBY2NlcHRvciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICBzdXBlcih0aGlzKTtcbiAgICB9XG5cbiAgICBuYW1lOklkZW50aWZpZXI7XG4gICAgdW5kZWZpbmU6SWRlbnRpZmllcltdO1xuICAgIHJlZGVmZWluZTpJZGVudGlmaWVyW107XG4gICAgcmVuYW1lOklkZW50aWZpZXJbXTtcbiAgICBuZXdleHBvcnQ6SWRlbnRpZmllcltdIHwgQWxsO1xuXG4gICAgYWNjZXB0PEEsIFI+KHZpc2l0b3I6VmlzaXRvcjxBLCBSPiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHZpc2l0b3IudlBhcmVudCh0aGlzLCBhcmcpO1xuICAgIH1cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBMaXRlcmFsPFQ+IGV4dGVuZHMgQVNUIHtcbiAgICB2YWx1ZTogVDtcbiAgICBlbmQ6IGVpZmZlbC5hc3QuUG9zO1xuICAgIHN0YXJ0OiBlaWZmZWwuYXN0LlBvcztcbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBDaGFyTGl0ZXJhbCBleHRlbmRzIExpdGVyYWw8c3RyaW5nPiBpbXBsZW1lbnRzIFZpc2l0b3JBY2NlcHRvciB7XG4gICAgY29uc3RydWN0b3IodmFsdWU6IHN0cmluZywgc3RhcnQ6IFBvcywgZW5kOiBQb3MpIHtcbiAgICAgIHN1cGVyKHRoaXMpO1xuICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgICAgdGhpcy5lbmQgPSBlbmQ7XG4gICAgfVxuXG4gICAgYWNjZXB0PEEsIFI+KHZpc2l0b3I6VmlzaXRvcjxBLCBSPiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHZpc2l0b3IudkNoYXJMaXRlcmFsKHRoaXMsIGFyZyk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIEJvb2xlYW5MaXRlcmFsIGV4dGVuZHMgTGl0ZXJhbDxib29sZWFuPiBpbXBsZW1lbnRzIFZpc2l0b3JBY2NlcHRvciB7XG4gICAgY29uc3RydWN0b3IodmFsdWU6IGJvb2xlYW4sIHN0YXJ0OiBQb3MsIGVuZDogUG9zKSB7XG4gICAgICBzdXBlcih0aGlzKTtcbiAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICAgIHRoaXMuZW5kID0gZW5kO1xuICAgIH1cblxuXG4gICAgYWNjZXB0PEEsIFI+KHZpc2l0b3I6VmlzaXRvcjxBLCBSPiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHZpc2l0b3IudkJvb2xlYW5MaXRlcmFsKHRoaXMsIGFyZyk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIEludExpdGVyYWwgZXh0ZW5kcyBMaXRlcmFsPG51bWJlcj4gaW1wbGVtZW50cyBWaXNpdG9yQWNjZXB0b3Ige1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlOiBudW1iZXIsIHN0YXJ0OiBQb3MsIGVuZDogUG9zKSB7XG4gICAgICBzdXBlcih0aGlzKTtcbiAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICAgIHRoaXMuZW5kID0gZW5kO1xuICAgIH1cblxuICAgIGFjY2VwdDxBLCBSPih2aXNpdG9yOlZpc2l0b3I8QSwgUj4sIGFyZzpBKTpSIHtcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IudkludExpdGVyYWwodGhpcywgYXJnKTtcbiAgICAgIH1cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBWb2lkTGl0ZXJhbCBleHRlbmRzIExpdGVyYWw8YW55PiBpbXBsZW1lbnRzIFZpc2l0b3JBY2NlcHRvciB7XG4gICAgY29uc3RydWN0b3Ioc3RhcnQ6IFBvcywgZW5kOiBQb3MpIHtcbiAgICAgIHN1cGVyKHRoaXMpO1xuICAgICAgdGhpcy52YWx1ZSA9IG51bGw7XG4gICAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICB0aGlzLmVuZCA9IGVuZDtcbiAgICB9XG5cbiAgICBhY2NlcHQ8QSwgUj4odmlzaXRvcjpWaXNpdG9yPEEsIFI+LCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdmlzaXRvci52Vm9pZExpdGVyYWwodGhpcywgYXJnKTtcbiAgICB9XG5cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBTdHJpbmdMaXRlcmFsIGV4dGVuZHMgTGl0ZXJhbDxzdHJpbmc+IGltcGxlbWVudHMgVmlzaXRvckFjY2VwdG9ye1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlOiBzdHJpbmcsIHN0YXJ0OiBQb3MsIGVuZDogUG9zKSB7XG4gICAgICBzdXBlcih0aGlzKTtcbiAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICAgIHRoaXMuZW5kID0gZW5kO1xuICAgIH1cblxuICAgIGFjY2VwdDxBLCBSPih2aXNpdG9yOlZpc2l0b3I8QSwgUj4sIGFyZzpBKTpSIHtcbiAgICAgIHJldHVybiB2aXNpdG9yLnZTdHJpbmdMaXRlcmFsKHRoaXMsIGFyZyk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIEFsbCB7XG5cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBFeHBvcnRDaGFuZ2VTZXQgZXh0ZW5kcyBBU1QgaW1wbGVtZW50cyBWaXNpdG9yQWNjZXB0b3Ige1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgc3VwZXIodGhpcyk7XG4gICAgfVxuXG4gICAgYWNjZXB0PEEsIFI+KHZpc2l0b3I6VmlzaXRvcjxBLCBSPiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHZpc2l0b3IudkV4cG9ydENoYW5nZVNldCh0aGlzLCBhcmcpO1xuICAgIH1cblxuICAgIGFjY2VzczpJZGVudGlmaWVyW107XG4gICAgZmVhdHVyZXM6SWRlbnRpZmllcltdO1xuICB9XG5cbiAgZXhwb3J0IGNsYXNzIFR5cGVJbnN0YW5jZSB7XG5cbiAgfVxuXG4gIGV4cG9ydCBpbnRlcmZhY2UgSW5zdHJ1Y3Rpb24gZXh0ZW5kcyBFeHByZXNzaW9uLCBWaXNpdG9yQWNjZXB0b3Ige1xuICB9XG5cbiAgZXhwb3J0IGNsYXNzIElmRWxzZSBleHRlbmRzIEFTVCBpbXBsZW1lbnRzIEluc3RydWN0aW9uIHtcbiAgICBjb25kaXRpb246RXhwcmVzc2lvbltdO1xuICAgIHRoZW46SW5zdHJ1Y3Rpb25bXTtcbiAgICBvdGhlcndpc2U6SW5zdHJ1Y3Rpb25bXTtcbiAgICBzeW06VHlwZUluc3RhbmNlO1xuXG4gICAgYWNjZXB0PEEsIFI+KHZpc2l0b3I6VmlzaXRvcjxBLCBSPiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHZpc2l0b3IudklmRWxzZSh0aGlzLCBhcmcpO1xuICAgIH1cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBDb25kaXRpb24gZXh0ZW5kcyBBU1QgaW1wbGVtZW50cyBWaXNpdG9yQWNjZXB0b3Ige1xuXG4gICAgY29uc3RydWN0b3IobGFiZWw6IElkZW50aWZpZXIsIGNvbmRpdGlvbjogRXhwcmVzc2lvbikge1xuICAgICAgc3VwZXIodGhpcyk7XG4gICAgICB0aGlzLmNvbmRpdGlvbiA9IGNvbmRpdGlvbjtcbiAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcbiAgICB9XG5cbiAgICBjb25kaXRpb246RXhwcmVzc2lvbjtcbiAgICBsYWJlbDpJZGVudGlmaWVyO1xuXG4gICAgYWNjZXB0PEEsIFI+KHZpc2l0b3I6IFZpc2l0b3I8QSwgUj4sIGFyZzpBKTpSIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgc2hvdWxkIG5vdCBiZSBjYWxsZWRcIik7XG4gICAgfVxuXG4gIH1cblxuICBleHBvcnQgY2xhc3MgUHJlY29uZGl0aW9uIGV4dGVuZHMgQ29uZGl0aW9uIGltcGxlbWVudHMgVmlzaXRvckFjY2VwdG9yIHtcbiAgICBhY2NlcHQ8QSwgUj4odmlzaXRvcjpWaXNpdG9yPEEsIFI+LCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdmlzaXRvci52UHJlY29uZGl0aW9uKHRoaXMsIGFyZyk7XG4gICAgfVxuXG4gIH1cblxuICBleHBvcnQgY2xhc3MgUG9zdGNvbmRpdGlvbiBleHRlbmRzIENvbmRpdGlvbiBpbXBsZW1lbnRzIFZpc2l0b3JBY2NlcHRvciB7XG4gICAgYWNjZXB0PEEsIFI+KHZpc2l0b3I6VmlzaXRvcjxBLCBSPiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHZpc2l0b3IudlBvc3Rjb25kaXRpb24odGhpcywgYXJnKTtcbiAgICB9XG5cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBGb3JVbnRpbEluc3RydWN0aW9uIGV4dGVuZHMgQVNUIGltcGxlbWVudHMgSW5zdHJ1Y3Rpb24ge1xuICAgIHN5bTpUeXBlSW5zdGFuY2U7XG5cbiAgICBhY2NlcHQ8QSwgUj4odmlzaXRvcjpWaXNpdG9yPEEsIFI+LCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdmlzaXRvci52Rm9yVW50aWwodGhpcywgYXJnKTtcbiAgICB9XG5cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBBc3NpZ25tZW50IGV4dGVuZHMgQVNUIGltcGxlbWVudHMgSW5zdHJ1Y3Rpb24ge1xuXG4gICAgY29uc3RydWN0b3IobGVmdDplaWZmZWwuYXN0LkV4cHJlc3Npb24sIHJpZ2h0OmVpZmZlbC5hc3QuRXhwcmVzc2lvbikge1xuICAgICAgc3VwZXIodGhpcyk7XG4gICAgICB0aGlzLmxlZnQgPSBsZWZ0O1xuICAgICAgdGhpcy5yaWdodCA9IHJpZ2h0O1xuICAgIH1cblxuICAgIGxlZnQ6RXhwcmVzc2lvbjtcbiAgICByaWdodDpFeHByZXNzaW9uO1xuICAgIHN5bTpUeXBlSW5zdGFuY2U7XG5cbiAgICBhY2NlcHQ8QSwgUj4odmlzaXRvcjpWaXNpdG9yPEEsIFI+LCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdmlzaXRvci52QXNzaWdubWVudCh0aGlzLCBhcmcpO1xuICAgIH1cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBDcmVhdGVJbnN0cnVjdGlvbiBleHRlbmRzIEFTVCBpbXBsZW1lbnRzIEluc3RydWN0aW9uIHtcblxuICAgIGNvbnN0cnVjdG9yKHRhcmdldDplaWZmZWwuYXN0LklkZW50aWZpZXIsIG1ldGhvZDplaWZmZWwuYXN0LklkZW50aWZpZXIsIGFyZ3VtZW50czplaWZmZWwuYXN0LkV4cHJlc3Npb25bXSkge1xuICAgICAgc3VwZXIodGhpcyk7XG4gICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICAgIHRoaXMubWV0aG9kID0gbWV0aG9kO1xuICAgICAgdGhpcy5hcmd1bWVudHMgPSBhcmd1bWVudHM7XG4gICAgfVxuXG4gICAgdGFyZ2V0OklkZW50aWZpZXI7XG4gICAgbWV0aG9kOiBJZGVudGlmaWVyO1xuICAgIGFyZ3VtZW50czogRXhwcmVzc2lvbltdO1xuICAgIHN5bTpUeXBlSW5zdGFuY2U7XG5cbiAgICBhY2NlcHQ8QSwgUj4odmlzaXRvcjpWaXNpdG9yPEEsIFI+LCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdmlzaXRvci52Q3JlYXRlSW5zdHJ1Y3Rpb24odGhpcywgYXJnKTtcbiAgICB9XG4gIH1cblxuICBleHBvcnQgaW50ZXJmYWNlIEV4cHJlc3Npb24gZXh0ZW5kcyBBU1QsIFZpc2l0b3JBY2NlcHRvciB7XG4gICAgc3ltOiBUeXBlSW5zdGFuY2U7XG4gIH1cblxuICBleHBvcnQgY2xhc3MgVW5hcnlPcCBleHRlbmRzIEFTVCBpbXBsZW1lbnRzIEV4cHJlc3Npb24ge1xuICAgIG9wZXJhdG9yOlVuYXJ5T3BlcmF0b3I7XG4gICAgb3BlcmFuZDpFeHByZXNzaW9uO1xuICAgIHN5bTpUeXBlSW5zdGFuY2U7XG5cbiAgICBhY2NlcHQ8QSwgUj4odmlzaXRvcjpWaXNpdG9yPEEsIFI+LCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdmlzaXRvci52VW5hcnlPcCh0aGlzLCBhcmcpO1xuICAgIH1cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBCaW5hcnlPcCBleHRlbmRzIEFTVCBpbXBsZW1lbnRzIEV4cHJlc3Npb24ge1xuICAgIG9wZXJhdG9yOkJpbmFyeU9wZXJhdG9yO1xuICAgIGxlZnQ6RXhwcmVzc2lvbjtcbiAgICByaWdodDpFeHByZXNzaW9uO1xuICAgIHN5bTpUeXBlSW5zdGFuY2U7XG5cbiAgICBhY2NlcHQ8QSwgUj4odmlzaXRvcjpWaXNpdG9yPEEsIFI+LCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdmlzaXRvci52QmluYXJ5T3AodGhpcywgYXJnKTtcbiAgICB9XG4gIH1cblxuXG4gIGNvbnN0IGVudW0gVW5hcnlPcGVyYXRvciB7XG4gICAgTWludXMsXG4gICAgUGx1cyxcbiAgICBOb3QsXG4gICAgT2xkLFxuICB9XG5cbiAgY29uc3QgZW51bSBCaW5hcnlPcGVyYXRvciB7XG4gICAgTWludXMsXG4gICAgUGx1cyxcbiAgICBNdWx0aXBsaWNhdGlvbixcbiAgICBEaXZpc2lvbixcbiAgICBJbnRlZ2VyRGl2aXNpb24sXG4gICAgTW9kdWxvLFxuICAgIEV4cG9uZW50aWFsLFxuICAgIERvdERvdCxcbiAgICBJZGVudGljYWwsXG4gICAgTm90SWRlbnRpY2FsLFxuICAgIElzRXF1YWwsXG4gICAgTm90SXNFcXVhbCxcbiAgICBMZXNzVGhhbixcbiAgICBHcmVhdGVyVGhhbixcbiAgICBMZXNzT3JFcXVhbCxcbiAgICBHcmVhdGVyT3JFcXVhbCxcbiAgICBBbmQsXG4gICAgQW5kVGhlbixcbiAgICBPcixcbiAgICBPckVsc2UsXG4gICAgWG9yLFxuICAgIEltcGxpZXMsXG4gIH1cblxuICB2YXIgc3RyaW5nVG9VbmFyeU9wOkxvb2t1cFRhYmxlPFVuYXJ5T3BlcmF0b3I+ID0ge1xuICAgIFwiLVwiOiBVbmFyeU9wZXJhdG9yLk1pbnVzLFxuICAgIFwiK1wiOiBVbmFyeU9wZXJhdG9yLlBsdXMsXG4gICAgXCJub3RcIjogVW5hcnlPcGVyYXRvci5Ob3QsXG4gICAgXCJvbGRcIjogVW5hcnlPcGVyYXRvci5PbGQsXG4gIH07XG5cbiAgdmFyIHN0cmluZ1RvQmluYXJ5T3A6TG9va3VwVGFibGU8QmluYXJ5T3BlcmF0b3I+ID0ge1xuICAgIFwiLVwiOiBCaW5hcnlPcGVyYXRvci5NaW51cyxcbiAgICBcIitcIjogQmluYXJ5T3BlcmF0b3IuUGx1cyxcbiAgICBcIipcIjogQmluYXJ5T3BlcmF0b3IuTXVsdGlwbGljYXRpb24sXG4gICAgXCIvXCI6IEJpbmFyeU9wZXJhdG9yLkRpdmlzaW9uLFxuICAgIFwiLy9cIjogQmluYXJ5T3BlcmF0b3IuSW50ZWdlckRpdmlzaW9uLFxuICAgIFwiXFxcXFxcXFxcIjogQmluYXJ5T3BlcmF0b3IuTW9kdWxvLFxuICAgIFwiXlwiOiBCaW5hcnlPcGVyYXRvci5FeHBvbmVudGlhbCxcbiAgICBcIi4uXCI6IEJpbmFyeU9wZXJhdG9yLkRvdERvdCxcbiAgICBcIj1cIjogQmluYXJ5T3BlcmF0b3IuSWRlbnRpY2FsLFxuICAgIFwiLz1cIjogQmluYXJ5T3BlcmF0b3IuTm90SWRlbnRpY2FsLFxuICAgIFwiflwiOiBCaW5hcnlPcGVyYXRvci5Jc0VxdWFsLFxuICAgIFwiL35cIjogQmluYXJ5T3BlcmF0b3IuTm90SXNFcXVhbCxcbiAgICBcIjxcIjogQmluYXJ5T3BlcmF0b3IuTGVzc1RoYW4sXG4gICAgXCI+XCI6IEJpbmFyeU9wZXJhdG9yLkdyZWF0ZXJUaGFuLFxuICAgIFwiPD1cIjogQmluYXJ5T3BlcmF0b3IuTGVzc09yRXF1YWwsXG4gICAgXCI+PVwiOiBCaW5hcnlPcGVyYXRvci5HcmVhdGVyT3JFcXVhbCxcbiAgICBcImFuZFwiOiBCaW5hcnlPcGVyYXRvci5BbmQsXG4gICAgXCJhbmQgdGhlblwiOiBCaW5hcnlPcGVyYXRvci5BbmRUaGVuLFxuICAgIFwib3JcIjogQmluYXJ5T3BlcmF0b3IuT3IsXG4gICAgXCJvciBlbHNlXCI6IEJpbmFyeU9wZXJhdG9yLk9yRWxzZSxcbiAgICBcInhvclwiOiBCaW5hcnlPcGVyYXRvci5Yb3IsXG4gICAgXCJpbXBsaWVzXCI6IEJpbmFyeU9wZXJhdG9yLkltcGxpZXMsXG4gIH07XG5cbiAgZXhwb3J0IGNsYXNzIENhbGxFeHByZXNzaW9uIGV4dGVuZHMgQVNUIGltcGxlbWVudHMgRXhwcmVzc2lvbiwgVmlzaXRvckFjY2VwdG9yIHtcbiAgICBzeW06ZWlmZmVsLmFzdC5UeXBlSW5zdGFuY2U7XG5cbiAgICBhY2NlcHQ8QSwgUj4odmlzaXRvcjpWaXNpdG9yPEEsIFI+LCBhcmc6QSk6UiB7XG4gICAgICByZXR1cm4gdmlzaXRvci52Q2FsbEV4cHJlc3Npb24odGhpcywgYXJnKTtcbiAgICB9XG4gIH1cblxuICBleHBvcnQgY2xhc3MgSW5kZXhFeHByZXNzaW9uIGV4dGVuZHMgQVNUIGltcGxlbWVudHMgRXhwcmVzc2lvbiwgVmlzaXRvckFjY2VwdG9yIHtcbiAgICBcblxuICAgIHRhcmdldDogRXhwcmVzc2lvbjtcbiAgICBhcmd1bWVudDogRXhwcmVzc2lvbjtcblxuXG4gICAgc3ltOmVpZmZlbC5hc3QuVHlwZUluc3RhbmNlO1xuXG4gICAgYWNjZXB0PEEsIFI+KHZpc2l0b3I6VmlzaXRvcjxBLCBSPiwgYXJnOkEpOlIge1xuICAgICAgcmV0dXJuIHZpc2l0b3IudkluZGV4RXhwcmVzc2lvbih0aGlzLCBhcmcpO1xuICAgIH1cbiAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInZpc2l0b3IudHNcIiAvPlxuXG5tb2R1bGUgZWlmZmVsLnNlbWFudGljcyB7XG4gIGltcG9ydCBzeW0gPSBlaWZmZWwuc3ltYm9scztcblxuICBleHBvcnQgZnVuY3Rpb24gYW5hbHl6ZShhc3RzOiBhc3QuQ2xhc3NbXSk6IEFuYWx5c2lzUmVzdWx0IHtcbiAgICB2YXIgYW5hbHlzaXNDb250ZXh0ID0gbmV3IEFuYWx5c2lzQ29udGV4dCgpO1xuICAgIGFzdHMuZm9yRWFjaChmdW5jdGlvbiAoYXN0KSB7XG4gICAgICBhc3QuYWNjZXB0KG5ldyBGZWF0dXJlRGlzY292ZXJ5KGFuYWx5c2lzQ29udGV4dC5jbGFzc1N5bWJvbHMpLCBudWxsKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNsYXNzIEFuYWx5c2lzQ29udGV4dCB7XG4gICAgY2xhc3NTeW1ib2xzOiBMb29rdXBUYWJsZTxzeW0uQ2xhc3NTeW1ib2w+ID0ge307XG4gIH1cblxuICBjbGFzcyBGZWF0dXJlRGlzY292ZXJ5IGV4dGVuZHMgYXN0LlZpc2l0b3I8YXN0LkNsYXNzLCBhbnk+IHtcbiAgICBjbGFzc1N5bWJvbHM6TG9va3VwVGFibGU8c3ltLkNsYXNzU3ltYm9sPjtcblxuXG4gICAgY29uc3RydWN0b3IoY2xhc3NTeW1ib2xzOiBMb29rdXBUYWJsZTxzeW0uQ2xhc3NTeW1ib2w+KSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5jbGFzc1N5bWJvbHMgPSBjbGFzc1N5bWJvbHM7XG4gICAgfVxuXG4gICAgdkNsYXNzKF9jbGFzczplaWZmZWwuYXN0LkNsYXNzLCBhcmc6ZWlmZmVsLmFzdC5DbGFzcyk6YW55IHtcbiAgICAgIGNvbnNvbGUubG9nKF9jbGFzcy5uYW1lLm5hbWUpO1xuICAgICAgY29uc29sZS5sb2coX2NsYXNzKTtcbiAgICAgIHJldHVybiB0aGlzLnZDaGlsZHJlbihfY2xhc3MsIF9jbGFzcyk7XG4gICAgfVxuXG4gICAgdkZlYXR1cmUoZmVhdHVyZTplaWZmZWwuYXN0LkZlYXR1cmUsIGFyZzplaWZmZWwuYXN0LkNsYXNzKTphbnkge1xuICAgICAgcmV0dXJuIHN1cGVyLnZGZWF0dXJlKGZlYXR1cmUsIGFyZyk7XG4gICAgfVxuXG5cbiAgICB2QXR0cihhdHRyOmVpZmZlbC5hc3QuQXR0cmlidXRlLCBhcmc6ZWlmZmVsLmFzdC5DbGFzcyk6YW55IHtcbiAgICAgIGNvbnNvbGUubG9nKGF0dHIpO1xuICAgICAgcmV0dXJuIHN1cGVyLnZBdHRyKGF0dHIsIGFyZyk7XG4gICAgfVxuXG4gICAgdkZ1bmN0aW9uKGZ1bmM6ZWlmZmVsLmFzdC5GdW5jdGlvbiwgYXJnOmVpZmZlbC5hc3QuQ2xhc3MpOmFueSB7XG4gICAgICBjb25zb2xlLmxvZyhmdW5jKTtcbiAgICAgIHJldHVybiBzdXBlci52RnVuY3Rpb24oZnVuYywgYXJnKTtcbiAgICB9XG5cbiAgICB2UHJvY2VkdXJlKHByb2NlZHVyZTplaWZmZWwuYXN0LlByb2NlZHVyZSwgYXJnOmVpZmZlbC5hc3QuQ2xhc3MpOmFueSB7XG4gICAgICBjb25zb2xlLmxvZyhwcm9jZWR1cmUpO1xuICAgICAgcmV0dXJuIHN1cGVyLnZQcm9jZWR1cmUocHJvY2VkdXJlLCBhcmcpO1xuICAgIH1cblxuICAgIHZDb25zdGFudEF0dHJpYnV0ZShjb25zdGFudEF0dHJpYnV0ZTplaWZmZWwuYXN0LkNvbnN0YW50QXR0cmlidXRlLCBhcmc6ZWlmZmVsLmFzdC5DbGFzcyk6YW55IHtcbiAgICAgIHJldHVybiBzdXBlci52Q29uc3RhbnRBdHRyaWJ1dGUoY29uc3RhbnRBdHRyaWJ1dGUsIGFyZyk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGludGVyZmFjZSBBbmFseXNpc1Jlc3VsdCB7XG4gICAgYXN0OiBlaWZmZWwuYXN0LkNsYXNzW107XG4gICAgZXJyb3JzOiBhbnlbXTtcbiAgfVxufVxuIiwibW9kdWxlIGVpZmZlbC5zeW1ib2xzIHtcbiAgICBleHBvcnQgY2xhc3MgU3ltYm9sIHtcbiAgICAgICAgbmFtZTogU3RyaW5nO1xuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBSb3V0aW5lU3ltYm9sIGV4dGVuZHMgU3ltYm9sIHtcblxuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBGdW5jdGlvblN5bWJvbCBleHRlbmRzIFJvdXRpbmVTeW1ib2wge1xuICAgICAgcmF3UmV0dXJuVHlwZTogZWlmZmVsLmFzdC5UeXBlO1xuXG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIFByb2NlZHVyZVN5bWJvbCBleHRlbmRzIFJvdXRpbmVTeW1ib2wge1xuICAgICAgcmF3UmV0dXJuVHlwZTogZWlmZmVsLmFzdC5UeXBlO1xuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBDbGFzc1N5bWJvbCBleHRlbmRzIFN5bWJvbCB7XG4gICAgICBmdW5jdGlvbnM6IExvb2t1cFRhYmxlPEZ1bmN0aW9uU3ltYm9sPiA9IHt9O1xuICAgICAgcHJvY2VkdXJlczogTG9va3VwVGFibGU8UHJvY2VkdXJlU3ltYm9sPiA9IHt9O1xuICAgIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==