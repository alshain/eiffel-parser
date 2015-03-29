(function(root, undefined) {

  "use strict";
  var generatedParser = null;

/* @flow */
/* eiffel-parser main */

// Base function.
var vees = function() {
  // Add functionality here.
  var parser = eiffel.parser;
  function debug() {
    Array.prototype.forEach.call(arguments, function (msg) {
      console.log(msg);
    });
  }

  function recurse(ast, dispatcher) {
  }

  var sanctionedAstTypes = [
    "feature.attribute",
    "feature.constant",
    "feature.function",
    "feature.procedure",
    "control.if",
    "control.else",
    "control.from",
    "control.across",
    "contract.invariant",
    "contract.precondition",
    "contract.postcondition",
    "contract.variant",
    "exp.bin.+",
    "exp.bin.-",
    "exp.bin.*",
    "exp.bin./",
    "exp.bin.\\",
    "exp.bin.\\\\",
    "exp.bin.^",
    "exp.bin.or",
    "exp.bin.or_e",
    "exp.bin.and",
    "exp.bin.implies",
    "exp.bin.dotdot",
    "exp.bin.",
    "exp.bin.and",
  ];

  var sanctionedAliases = {
    "and": 1,
    "and then": 1,
    "or": 1,
    "or else": 1,
    "xor": 1,
    "imples": 1,
    "not": 0,
    "[]": "*",
  };

  function dispatchOnType(node, fs) {
    if (!(node instanceof Node)) {
      throw new Error("Node not of instance Node");
    }
    var type = node.nodeType;
    var splitted = type.split(".");
    var typeBySpecifity = splitted.map(function(_, i, all) {
      return all.slice(0, all.length - i).join(".");
    });

    var foundFunction = false;
    typeBySpecifity.some(function(typePart) {
      if(fs.hasOwnProperty(typePart)) {
        foundFunction = true;
        fs[typePart](node);
        return true;
      }

      return false;
    });

    if (foundFunction) {
      return;
    }
    else {
      console.log("Node");
      console.log(node);
      console.log(fs);
      throw new Error("Function for type " + type + " does not exist");
    }
  }

  function LocalSymbol(ast, owningMethod) {
    this.name = ast.name.name;
    this.owningMethod = owningMethod;
  }

  function FunctionSymbol(name, parameters, rawType, alias, ast) {
    this.rawType = rawType;
    this.alias = alias;
    initRoutine.bind(this)(name, parameters, ast);
  }

  function ProcedureSymbol(name, parameters, ast) {
    initRoutine.bind(this)(name, parameters, ast);
  }

  function AttributeSymbol(name, rawType) {
    this.name = name;
    this.rawType = rawType;
  }

  function TypeInstance(baseSymbol, parameterInstances) {
    this.baseSymbol = baseSymbol;
    this.parameters = parameterInstances;
  }

  function ClassSymbol(className) {
    this.name = className;
    this.methods = {};
    this.functions = {};
    this.procedures = {};
    this.attributes = {};
    this.parents = [];
    this.aliases = {};

    this.hasSymbol = function hasSymbol(name) {
      if (this.methods.hasOwnProperty(name)) {
        return true;
      }
      if (this.attributes.hasOwnProperty(name)) {
        return true;
      }
      if (this.functions.hasOwnProperty(name)) {
        return true;
      }
      if (this.procedures.hasOwnProperty(name)) {
        return true;
      }

      return false;
    };

    this.resolveSymbol = function resolveSymbol(name) {
      if (this.methods.hasOwnProperty(name)) {
        return this.methods[name];
      }
      if (this.procedures.hasOwnProperty(name)) {
        return this.procedures[name];
      }
      if (this.functions.hasOwnProperty(name)) {
        return this.functions[name];
      }
      if (this.attributes.hasOwnProperty(name)) {
        return this.attributes[name];
      }

      throw new Error("Symbol '" + name + "' not found in class '" + this.name + "'");
    };

    this.addSymbol = function addSymbol(sym) {
      if (sym instanceof ProcedureSymbol) {
        this.methods[sym.name] = sym;
        this.procedures[sym.name] = sym;
      }
      else if (sym instanceof FunctionSymbol) {
        this.functions[sym.name] = sym;
        this.methods[sym.name] = sym;
        if (sym.alias) {
          if (!sanctionedAliases.hasOwnProperty(sym.alias)) {
            throw new Error("Invalid alias: " + sym.alias);
          }
          var requiredParamCount = sanctionedAliases[sym.alias];
          if (requiredParamCount !== sym.parameters.length) {
            throw new Error("This alias requires exactly " + requiredParamCount + " parameters. " +
                sym.name + " has " + sym.parameters.length
              );
          }
          this.aliases[sym.alias] = sym;
        }
      }
      else if (sym instanceof AttributeSymbol) {
        this.attributes[sym.name] = sym;
      }
      else {
        throw new Error("Invalid symbol: " + sym);
      }
      sym.owningClass = this;
    };

    this.forEachSymbol = function forEachSymbol(symbols, f) {
      for (var symName in symbols) {
        if (symbols.hasOwnProperty(symName)) {
          f.call(this, symbols[symName]);
        }
      }
    };

    this.forEachAttribute = function forEachAttribute(f) {
      this.forEachSymbol(this.attributes, f);
    };

    this.forEachMethod = function forEachMethod(f) {
      this.forEachSymbol(this.methods, f);
    };

    this.forEachProcedure = function forEachProcedure(f) {
      this.forEachSymbol(this.procedures, f);
    };

    this.forEachFunction = function forEachFunction(f) {
      this.forEachSymbol(this.functions, f);
    };
}

  function initRoutine(name, params, ast) {
    /*jshint validthis:true*/
    this.name = name;
    this.parameters = params;
    var paramsByName = {};
    params.forEach(function paramToParamByName (param) {
      paramsByName[param.name] = param;
    });

    this.parametersByName = paramsByName;

    this.locals = [];
    this.localsByName = {};

    if (ast) {
      ast.localLists.forEach(function(localList) {
        localList.forEach(function(local) {
          var localName = local.name.name;
          var newLocal = new LocalSymbol(local, this);
          newLocal.ast = local;
          newLocal.rawType = local.parameterType;
          this.locals.push(newLocal);
          this.localsByName[localName] = newLocal;
        }, this);
      }, this);
    }
  }


  /*jshint unused:false*/
  var AstTraversal = function(ast) {
      this.className = function className() {
        return ast.name.name;
      };
    /*jshint unused:vars*/
  };
  /*jshint unused:false*/
  var Analyzer = function Analyzer() {
    /*jshint unused:vars*/
    this.classes = {};

    this.initBuiltin = function initBuiltin() {
      var classDef = function classDef(name, parents, fields, funcs, procs, consts) {
        var classSymbol = new ClassSymbol(name);
        this.classes[name] = classSymbol;
        fields.forEach(function(field, index){
          classSymbol.addSymbol(field);
        });
      }.bind(this);

      function groupParams(params) {
        var result = [];
        for(var k = 0, paramsLength = params.length / 2; k < paramsLength; k++){
          result.push({
            name: params[k * 2],
            rawType: parser.parse(params[k * 2 + 1], {startRule: "Type"}),
          });
        }

        return result;
      }

      var funcDef = function funcDef(name, params, returnType, alias) {
        return new FunctionSymbol(name, groupParams(params), parser.parse(returnType, {startRule: "Type"}), alias);
      }.bind(this);

      var attrDef = function attrDef(name, type) {
        return new AttributeSymbol(name, parser.parse(type, {startRule: "Type"}));
      }.bind(this);

      var procDef = function procDef(name, params) {
      }.bind(this);

      var constDef = function constDef(name, params) {
      }.bind(this);


      root.vees.builtin.classes.forEach(function(classFunc) {
        classFunc(classDef, attrDef, procDef, funcDef, constDef);

      });
    };

    var discoverSymbols = function discoverSymbols() {

      var discoverSymbolsInClassAsts = function (arrayOfClasses) {
        Array.prototype.forEach.call(arrayOfClasses, discoverSymbolsInSingleClass);
      }.bind(this);

      var discoverSymbolsInSingleClass = function (singleClass) {
        var trav = new AstTraversal(singleClass);
        var className = trav.className();
        var cSym = new ClassSymbol(className);
        this.classes[className] = cSym;
        singleClass.sym = cSym;

        function astParamsToList(ast) {
          var result = [];
          ast.params.forEach(function addParamToList (param) {
            result.push({
              name: param.name.name,
              rawType: param.parameterType,
              ast: param,
            });
          });
          return result;
        }

        var analyzeFeatureList = function analyzeFeatureList(featureList) {
          var analyzeFeature = function analyzeFeature(feature) {
            var analyzeAttribute = function analyzeAttribute(attribute) {
              var attrSym = new AttributeSymbol(attribute.name.name, attribute.attributeType);
              attrSym.ast = attribute;
              cSym.addSymbol(attrSym);
              attribute.sym = attrSym;

            }.bind(this);

            var analyzeProcedure = function analyzeProcedure(proc) {
              var procSym = new ProcedureSymbol(proc.name.name, astParamsToList(proc), proc);
              procSym.proc = proc;
              cSym.addSymbol(procSym);
              proc.sym = procSym;

            }.bind(this);

            var analyzeFunction = function analyzeFunction(func) {
              var funcSym = new FunctionSymbol(func.name.name, astParamsToList(func), func.returnType, func.alias, func);
              funcSym.ast = func;
              cSym.addSymbol(funcSym);
              func.sym = funcSym;

            }.bind(this);

            var fs = {
              "feature.attribute": analyzeAttribute,
              "feature.procedure": analyzeProcedure,
              "feature.function": analyzeFunction,
            };
            dispatchOnType(feature, fs);

          };

          featureList.features.forEach(analyzeFeature, this);
        }.bind(this);

        singleClass.featureLists.forEach(analyzeFeatureList, this);
      }.bind(this);


      Array.prototype.forEach.call(arguments, discoverSymbolsInClassAsts);
    }.bind(this);

    var connectSymbols = function connectSymbols () {
      var rawTypeToTypeInstance =  function rawTypeToTypeInstance(rawType) {
        if (rawType.nodeType !== "type") {
          console.error(rawType);
          throw new Error("Invalid AST:");
        }
        var parameterInstances = rawType.typeParams.forEach(rawTypeToTypeInstance);
        var typeName = rawType.name.name;
        if (!this.classes.hasOwnProperty(typeName)) {
          throw new Error("Type '" + typeName + "' does not exist");
        }

        var result = new TypeInstance(this.classes[typeName], parameterInstances);
        return result;
      }.bind(this);
      function connectInAttr(aSym) {
        /*jshint validthis:true*/ // this==classSym

        aSym.type = rawTypeToTypeInstance(aSym.rawType);
      }

      function connectInMethod(mSym) {
        /*jshint validthis:true*/ // this==classSym
        if (mSym instanceof FunctionSymbol) {
          if (mSym.rawType && mSym.rawType.nodeType !== "type") {
            throw new Error("Invalid AST:" + mSym.rawType.nodeTyp);
          }
          mSym.type = rawTypeToTypeInstance(mSym.rawType);
        }

        mSym.parameters.forEach(function connectInMethodParam (parameter) {
          parameter.type = rawTypeToTypeInstance(parameter.rawType);
        });

        mSym.locals.forEach(function connectInMethodParam (parameter) {
          parameter.type = rawTypeToTypeInstance(parameter.rawType);
        });
      }

      for (var className in this.classes) {
        if (this.classes.hasOwnProperty(className)) {
          var classSym = this.classes[className];
          classSym.forEachAttribute(connectInAttr);
          classSym.forEachMethod(connectInMethod);
        }
      }
    }.bind(this);

    this.initBuiltin();
    this.analyze = function analyze() {
      discoverSymbols.apply(this, arguments);
      connectSymbols();
    };
  };

  function Visitor(handlers) {
    function recurse(ast) {

    }
  }

  var builtin = {
    classes: [],
  };

  return {
    builtin: builtin,
    parser: parser,
    Analyzer: Analyzer,
    AstTraversal: AstTraversal,
  };
};


// Version.
vees.VERSION = '0.0.0';


// Export to the root, which is probably `window`.
root.vees = vees();

}(this));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIl9pbnRyby5qcyIsIm1haW4uanMiLCJfb3V0cm8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNWJBO0FBQ0EiLCJmaWxlIjoidmVlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbihyb290LCB1bmRlZmluZWQpIHtcclxuXHJcbiAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgdmFyIGdlbmVyYXRlZFBhcnNlciA9IG51bGw7XHJcbiIsIi8qIEBmbG93ICovXG4vKiBlaWZmZWwtcGFyc2VyIG1haW4gKi9cblxuLy8gQmFzZSBmdW5jdGlvbi5cbnZhciB2ZWVzID0gZnVuY3Rpb24oKSB7XG4gIC8vIEFkZCBmdW5jdGlvbmFsaXR5IGhlcmUuXG4gIHZhciBwYXJzZXIgPSBlaWZmZWwucGFyc2VyO1xuICBmdW5jdGlvbiBkZWJ1ZygpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGFyZ3VtZW50cywgZnVuY3Rpb24gKG1zZykge1xuICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY3Vyc2UoYXN0LCBkaXNwYXRjaGVyKSB7XG4gIH1cblxuICB2YXIgc2FuY3Rpb25lZEFzdFR5cGVzID0gW1xuICAgIFwiZmVhdHVyZS5hdHRyaWJ1dGVcIixcbiAgICBcImZlYXR1cmUuY29uc3RhbnRcIixcbiAgICBcImZlYXR1cmUuZnVuY3Rpb25cIixcbiAgICBcImZlYXR1cmUucHJvY2VkdXJlXCIsXG4gICAgXCJjb250cm9sLmlmXCIsXG4gICAgXCJjb250cm9sLmVsc2VcIixcbiAgICBcImNvbnRyb2wuZnJvbVwiLFxuICAgIFwiY29udHJvbC5hY3Jvc3NcIixcbiAgICBcImNvbnRyYWN0LmludmFyaWFudFwiLFxuICAgIFwiY29udHJhY3QucHJlY29uZGl0aW9uXCIsXG4gICAgXCJjb250cmFjdC5wb3N0Y29uZGl0aW9uXCIsXG4gICAgXCJjb250cmFjdC52YXJpYW50XCIsXG4gICAgXCJleHAuYmluLitcIixcbiAgICBcImV4cC5iaW4uLVwiLFxuICAgIFwiZXhwLmJpbi4qXCIsXG4gICAgXCJleHAuYmluLi9cIixcbiAgICBcImV4cC5iaW4uXFxcXFwiLFxuICAgIFwiZXhwLmJpbi5cXFxcXFxcXFwiLFxuICAgIFwiZXhwLmJpbi5eXCIsXG4gICAgXCJleHAuYmluLm9yXCIsXG4gICAgXCJleHAuYmluLm9yX2VcIixcbiAgICBcImV4cC5iaW4uYW5kXCIsXG4gICAgXCJleHAuYmluLmltcGxpZXNcIixcbiAgICBcImV4cC5iaW4uZG90ZG90XCIsXG4gICAgXCJleHAuYmluLlwiLFxuICAgIFwiZXhwLmJpbi5hbmRcIixcbiAgXTtcblxuICB2YXIgc2FuY3Rpb25lZEFsaWFzZXMgPSB7XG4gICAgXCJhbmRcIjogMSxcbiAgICBcImFuZCB0aGVuXCI6IDEsXG4gICAgXCJvclwiOiAxLFxuICAgIFwib3IgZWxzZVwiOiAxLFxuICAgIFwieG9yXCI6IDEsXG4gICAgXCJpbXBsZXNcIjogMSxcbiAgICBcIm5vdFwiOiAwLFxuICAgIFwiW11cIjogXCIqXCIsXG4gIH07XG5cbiAgZnVuY3Rpb24gZGlzcGF0Y2hPblR5cGUobm9kZSwgZnMpIHtcbiAgICBpZiAoIShub2RlIGluc3RhbmNlb2YgTm9kZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vZGUgbm90IG9mIGluc3RhbmNlIE5vZGVcIik7XG4gICAgfVxuICAgIHZhciB0eXBlID0gbm9kZS5ub2RlVHlwZTtcbiAgICB2YXIgc3BsaXR0ZWQgPSB0eXBlLnNwbGl0KFwiLlwiKTtcbiAgICB2YXIgdHlwZUJ5U3BlY2lmaXR5ID0gc3BsaXR0ZWQubWFwKGZ1bmN0aW9uKF8sIGksIGFsbCkge1xuICAgICAgcmV0dXJuIGFsbC5zbGljZSgwLCBhbGwubGVuZ3RoIC0gaSkuam9pbihcIi5cIik7XG4gICAgfSk7XG5cbiAgICB2YXIgZm91bmRGdW5jdGlvbiA9IGZhbHNlO1xuICAgIHR5cGVCeVNwZWNpZml0eS5zb21lKGZ1bmN0aW9uKHR5cGVQYXJ0KSB7XG4gICAgICBpZihmcy5oYXNPd25Qcm9wZXJ0eSh0eXBlUGFydCkpIHtcbiAgICAgICAgZm91bmRGdW5jdGlvbiA9IHRydWU7XG4gICAgICAgIGZzW3R5cGVQYXJ0XShub2RlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuICAgIGlmIChmb3VuZEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJOb2RlXCIpO1xuICAgICAgY29uc29sZS5sb2cobm9kZSk7XG4gICAgICBjb25zb2xlLmxvZyhmcyk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGdW5jdGlvbiBmb3IgdHlwZSBcIiArIHR5cGUgKyBcIiBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBMb2NhbFN5bWJvbChhc3QsIG93bmluZ01ldGhvZCkge1xuICAgIHRoaXMubmFtZSA9IGFzdC5uYW1lLm5hbWU7XG4gICAgdGhpcy5vd25pbmdNZXRob2QgPSBvd25pbmdNZXRob2Q7XG4gIH1cblxuICBmdW5jdGlvbiBGdW5jdGlvblN5bWJvbChuYW1lLCBwYXJhbWV0ZXJzLCByYXdUeXBlLCBhbGlhcywgYXN0KSB7XG4gICAgdGhpcy5yYXdUeXBlID0gcmF3VHlwZTtcbiAgICB0aGlzLmFsaWFzID0gYWxpYXM7XG4gICAgaW5pdFJvdXRpbmUuYmluZCh0aGlzKShuYW1lLCBwYXJhbWV0ZXJzLCBhc3QpO1xuICB9XG5cbiAgZnVuY3Rpb24gUHJvY2VkdXJlU3ltYm9sKG5hbWUsIHBhcmFtZXRlcnMsIGFzdCkge1xuICAgIGluaXRSb3V0aW5lLmJpbmQodGhpcykobmFtZSwgcGFyYW1ldGVycywgYXN0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIEF0dHJpYnV0ZVN5bWJvbChuYW1lLCByYXdUeXBlKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnJhd1R5cGUgPSByYXdUeXBlO1xuICB9XG5cbiAgZnVuY3Rpb24gVHlwZUluc3RhbmNlKGJhc2VTeW1ib2wsIHBhcmFtZXRlckluc3RhbmNlcykge1xuICAgIHRoaXMuYmFzZVN5bWJvbCA9IGJhc2VTeW1ib2w7XG4gICAgdGhpcy5wYXJhbWV0ZXJzID0gcGFyYW1ldGVySW5zdGFuY2VzO1xuICB9XG5cbiAgZnVuY3Rpb24gQ2xhc3NTeW1ib2woY2xhc3NOYW1lKSB7XG4gICAgdGhpcy5uYW1lID0gY2xhc3NOYW1lO1xuICAgIHRoaXMubWV0aG9kcyA9IHt9O1xuICAgIHRoaXMuZnVuY3Rpb25zID0ge307XG4gICAgdGhpcy5wcm9jZWR1cmVzID0ge307XG4gICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XG4gICAgdGhpcy5wYXJlbnRzID0gW107XG4gICAgdGhpcy5hbGlhc2VzID0ge307XG5cbiAgICB0aGlzLmhhc1N5bWJvbCA9IGZ1bmN0aW9uIGhhc1N5bWJvbChuYW1lKSB7XG4gICAgICBpZiAodGhpcy5tZXRob2RzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnByb2NlZHVyZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgdGhpcy5yZXNvbHZlU3ltYm9sID0gZnVuY3Rpb24gcmVzb2x2ZVN5bWJvbChuYW1lKSB7XG4gICAgICBpZiAodGhpcy5tZXRob2RzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1ldGhvZHNbbmFtZV07XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wcm9jZWR1cmVzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2NlZHVyZXNbbmFtZV07XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5mdW5jdGlvbnMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZnVuY3Rpb25zW25hbWVdO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzW25hbWVdO1xuICAgICAgfVxuXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTeW1ib2wgJ1wiICsgbmFtZSArIFwiJyBub3QgZm91bmQgaW4gY2xhc3MgJ1wiICsgdGhpcy5uYW1lICsgXCInXCIpO1xuICAgIH07XG5cbiAgICB0aGlzLmFkZFN5bWJvbCA9IGZ1bmN0aW9uIGFkZFN5bWJvbChzeW0pIHtcbiAgICAgIGlmIChzeW0gaW5zdGFuY2VvZiBQcm9jZWR1cmVTeW1ib2wpIHtcbiAgICAgICAgdGhpcy5tZXRob2RzW3N5bS5uYW1lXSA9IHN5bTtcbiAgICAgICAgdGhpcy5wcm9jZWR1cmVzW3N5bS5uYW1lXSA9IHN5bTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHN5bSBpbnN0YW5jZW9mIEZ1bmN0aW9uU3ltYm9sKSB7XG4gICAgICAgIHRoaXMuZnVuY3Rpb25zW3N5bS5uYW1lXSA9IHN5bTtcbiAgICAgICAgdGhpcy5tZXRob2RzW3N5bS5uYW1lXSA9IHN5bTtcbiAgICAgICAgaWYgKHN5bS5hbGlhcykge1xuICAgICAgICAgIGlmICghc2FuY3Rpb25lZEFsaWFzZXMuaGFzT3duUHJvcGVydHkoc3ltLmFsaWFzKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBhbGlhczogXCIgKyBzeW0uYWxpYXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgcmVxdWlyZWRQYXJhbUNvdW50ID0gc2FuY3Rpb25lZEFsaWFzZXNbc3ltLmFsaWFzXTtcbiAgICAgICAgICBpZiAocmVxdWlyZWRQYXJhbUNvdW50ICE9PSBzeW0ucGFyYW1ldGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgYWxpYXMgcmVxdWlyZXMgZXhhY3RseSBcIiArIHJlcXVpcmVkUGFyYW1Db3VudCArIFwiIHBhcmFtZXRlcnMuIFwiICtcbiAgICAgICAgICAgICAgICBzeW0ubmFtZSArIFwiIGhhcyBcIiArIHN5bS5wYXJhbWV0ZXJzLmxlbmd0aFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmFsaWFzZXNbc3ltLmFsaWFzXSA9IHN5bTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoc3ltIGluc3RhbmNlb2YgQXR0cmlidXRlU3ltYm9sKSB7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlc1tzeW0ubmFtZV0gPSBzeW07XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBzeW1ib2w6IFwiICsgc3ltKTtcbiAgICAgIH1cbiAgICAgIHN5bS5vd25pbmdDbGFzcyA9IHRoaXM7XG4gICAgfTtcblxuICAgIHRoaXMuZm9yRWFjaFN5bWJvbCA9IGZ1bmN0aW9uIGZvckVhY2hTeW1ib2woc3ltYm9scywgZikge1xuICAgICAgZm9yICh2YXIgc3ltTmFtZSBpbiBzeW1ib2xzKSB7XG4gICAgICAgIGlmIChzeW1ib2xzLmhhc093blByb3BlcnR5KHN5bU5hbWUpKSB7XG4gICAgICAgICAgZi5jYWxsKHRoaXMsIHN5bWJvbHNbc3ltTmFtZV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuZm9yRWFjaEF0dHJpYnV0ZSA9IGZ1bmN0aW9uIGZvckVhY2hBdHRyaWJ1dGUoZikge1xuICAgICAgdGhpcy5mb3JFYWNoU3ltYm9sKHRoaXMuYXR0cmlidXRlcywgZik7XG4gICAgfTtcblxuICAgIHRoaXMuZm9yRWFjaE1ldGhvZCA9IGZ1bmN0aW9uIGZvckVhY2hNZXRob2QoZikge1xuICAgICAgdGhpcy5mb3JFYWNoU3ltYm9sKHRoaXMubWV0aG9kcywgZik7XG4gICAgfTtcblxuICAgIHRoaXMuZm9yRWFjaFByb2NlZHVyZSA9IGZ1bmN0aW9uIGZvckVhY2hQcm9jZWR1cmUoZikge1xuICAgICAgdGhpcy5mb3JFYWNoU3ltYm9sKHRoaXMucHJvY2VkdXJlcywgZik7XG4gICAgfTtcblxuICAgIHRoaXMuZm9yRWFjaEZ1bmN0aW9uID0gZnVuY3Rpb24gZm9yRWFjaEZ1bmN0aW9uKGYpIHtcbiAgICAgIHRoaXMuZm9yRWFjaFN5bWJvbCh0aGlzLmZ1bmN0aW9ucywgZik7XG4gICAgfTtcbn1cblxuICBmdW5jdGlvbiBpbml0Um91dGluZShuYW1lLCBwYXJhbXMsIGFzdCkge1xuICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlKi9cbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucGFyYW1ldGVycyA9IHBhcmFtcztcbiAgICB2YXIgcGFyYW1zQnlOYW1lID0ge307XG4gICAgcGFyYW1zLmZvckVhY2goZnVuY3Rpb24gcGFyYW1Ub1BhcmFtQnlOYW1lIChwYXJhbSkge1xuICAgICAgcGFyYW1zQnlOYW1lW3BhcmFtLm5hbWVdID0gcGFyYW07XG4gICAgfSk7XG5cbiAgICB0aGlzLnBhcmFtZXRlcnNCeU5hbWUgPSBwYXJhbXNCeU5hbWU7XG5cbiAgICB0aGlzLmxvY2FscyA9IFtdO1xuICAgIHRoaXMubG9jYWxzQnlOYW1lID0ge307XG5cbiAgICBpZiAoYXN0KSB7XG4gICAgICBhc3QubG9jYWxMaXN0cy5mb3JFYWNoKGZ1bmN0aW9uKGxvY2FsTGlzdCkge1xuICAgICAgICBsb2NhbExpc3QuZm9yRWFjaChmdW5jdGlvbihsb2NhbCkge1xuICAgICAgICAgIHZhciBsb2NhbE5hbWUgPSBsb2NhbC5uYW1lLm5hbWU7XG4gICAgICAgICAgdmFyIG5ld0xvY2FsID0gbmV3IExvY2FsU3ltYm9sKGxvY2FsLCB0aGlzKTtcbiAgICAgICAgICBuZXdMb2NhbC5hc3QgPSBsb2NhbDtcbiAgICAgICAgICBuZXdMb2NhbC5yYXdUeXBlID0gbG9jYWwucGFyYW1ldGVyVHlwZTtcbiAgICAgICAgICB0aGlzLmxvY2Fscy5wdXNoKG5ld0xvY2FsKTtcbiAgICAgICAgICB0aGlzLmxvY2Fsc0J5TmFtZVtsb2NhbE5hbWVdID0gbmV3TG9jYWw7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfVxuICB9XG5cblxuICAvKmpzaGludCB1bnVzZWQ6ZmFsc2UqL1xuICB2YXIgQXN0VHJhdmVyc2FsID0gZnVuY3Rpb24oYXN0KSB7XG4gICAgICB0aGlzLmNsYXNzTmFtZSA9IGZ1bmN0aW9uIGNsYXNzTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIGFzdC5uYW1lLm5hbWU7XG4gICAgICB9O1xuICAgIC8qanNoaW50IHVudXNlZDp2YXJzKi9cbiAgfTtcbiAgLypqc2hpbnQgdW51c2VkOmZhbHNlKi9cbiAgdmFyIEFuYWx5emVyID0gZnVuY3Rpb24gQW5hbHl6ZXIoKSB7XG4gICAgLypqc2hpbnQgdW51c2VkOnZhcnMqL1xuICAgIHRoaXMuY2xhc3NlcyA9IHt9O1xuXG4gICAgdGhpcy5pbml0QnVpbHRpbiA9IGZ1bmN0aW9uIGluaXRCdWlsdGluKCkge1xuICAgICAgdmFyIGNsYXNzRGVmID0gZnVuY3Rpb24gY2xhc3NEZWYobmFtZSwgcGFyZW50cywgZmllbGRzLCBmdW5jcywgcHJvY3MsIGNvbnN0cykge1xuICAgICAgICB2YXIgY2xhc3NTeW1ib2wgPSBuZXcgQ2xhc3NTeW1ib2wobmFtZSk7XG4gICAgICAgIHRoaXMuY2xhc3Nlc1tuYW1lXSA9IGNsYXNzU3ltYm9sO1xuICAgICAgICBmaWVsZHMuZm9yRWFjaChmdW5jdGlvbihmaWVsZCwgaW5kZXgpe1xuICAgICAgICAgIGNsYXNzU3ltYm9sLmFkZFN5bWJvbChmaWVsZCk7XG4gICAgICAgIH0pO1xuICAgICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgICBmdW5jdGlvbiBncm91cFBhcmFtcyhwYXJhbXMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IodmFyIGsgPSAwLCBwYXJhbXNMZW5ndGggPSBwYXJhbXMubGVuZ3RoIC8gMjsgayA8IHBhcmFtc0xlbmd0aDsgaysrKXtcbiAgICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICBuYW1lOiBwYXJhbXNbayAqIDJdLFxuICAgICAgICAgICAgcmF3VHlwZTogcGFyc2VyLnBhcnNlKHBhcmFtc1trICogMiArIDFdLCB7c3RhcnRSdWxlOiBcIlR5cGVcIn0pLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cblxuICAgICAgdmFyIGZ1bmNEZWYgPSBmdW5jdGlvbiBmdW5jRGVmKG5hbWUsIHBhcmFtcywgcmV0dXJuVHlwZSwgYWxpYXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvblN5bWJvbChuYW1lLCBncm91cFBhcmFtcyhwYXJhbXMpLCBwYXJzZXIucGFyc2UocmV0dXJuVHlwZSwge3N0YXJ0UnVsZTogXCJUeXBlXCJ9KSwgYWxpYXMpO1xuICAgICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgICB2YXIgYXR0ckRlZiA9IGZ1bmN0aW9uIGF0dHJEZWYobmFtZSwgdHlwZSkge1xuICAgICAgICByZXR1cm4gbmV3IEF0dHJpYnV0ZVN5bWJvbChuYW1lLCBwYXJzZXIucGFyc2UodHlwZSwge3N0YXJ0UnVsZTogXCJUeXBlXCJ9KSk7XG4gICAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAgIHZhciBwcm9jRGVmID0gZnVuY3Rpb24gcHJvY0RlZihuYW1lLCBwYXJhbXMpIHtcbiAgICAgIH0uYmluZCh0aGlzKTtcblxuICAgICAgdmFyIGNvbnN0RGVmID0gZnVuY3Rpb24gY29uc3REZWYobmFtZSwgcGFyYW1zKSB7XG4gICAgICB9LmJpbmQodGhpcyk7XG5cblxuICAgICAgcm9vdC52ZWVzLmJ1aWx0aW4uY2xhc3Nlcy5mb3JFYWNoKGZ1bmN0aW9uKGNsYXNzRnVuYykge1xuICAgICAgICBjbGFzc0Z1bmMoY2xhc3NEZWYsIGF0dHJEZWYsIHByb2NEZWYsIGZ1bmNEZWYsIGNvbnN0RGVmKTtcblxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciBkaXNjb3ZlclN5bWJvbHMgPSBmdW5jdGlvbiBkaXNjb3ZlclN5bWJvbHMoKSB7XG5cbiAgICAgIHZhciBkaXNjb3ZlclN5bWJvbHNJbkNsYXNzQXN0cyA9IGZ1bmN0aW9uIChhcnJheU9mQ2xhc3Nlcykge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGFycmF5T2ZDbGFzc2VzLCBkaXNjb3ZlclN5bWJvbHNJblNpbmdsZUNsYXNzKTtcbiAgICAgIH0uYmluZCh0aGlzKTtcblxuICAgICAgdmFyIGRpc2NvdmVyU3ltYm9sc0luU2luZ2xlQ2xhc3MgPSBmdW5jdGlvbiAoc2luZ2xlQ2xhc3MpIHtcbiAgICAgICAgdmFyIHRyYXYgPSBuZXcgQXN0VHJhdmVyc2FsKHNpbmdsZUNsYXNzKTtcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IHRyYXYuY2xhc3NOYW1lKCk7XG4gICAgICAgIHZhciBjU3ltID0gbmV3IENsYXNzU3ltYm9sKGNsYXNzTmFtZSk7XG4gICAgICAgIHRoaXMuY2xhc3Nlc1tjbGFzc05hbWVdID0gY1N5bTtcbiAgICAgICAgc2luZ2xlQ2xhc3Muc3ltID0gY1N5bTtcblxuICAgICAgICBmdW5jdGlvbiBhc3RQYXJhbXNUb0xpc3QoYXN0KSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICAgIGFzdC5wYXJhbXMuZm9yRWFjaChmdW5jdGlvbiBhZGRQYXJhbVRvTGlzdCAocGFyYW0pIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgICAgICAgbmFtZTogcGFyYW0ubmFtZS5uYW1lLFxuICAgICAgICAgICAgICByYXdUeXBlOiBwYXJhbS5wYXJhbWV0ZXJUeXBlLFxuICAgICAgICAgICAgICBhc3Q6IHBhcmFtLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhbmFseXplRmVhdHVyZUxpc3QgPSBmdW5jdGlvbiBhbmFseXplRmVhdHVyZUxpc3QoZmVhdHVyZUxpc3QpIHtcbiAgICAgICAgICB2YXIgYW5hbHl6ZUZlYXR1cmUgPSBmdW5jdGlvbiBhbmFseXplRmVhdHVyZShmZWF0dXJlKSB7XG4gICAgICAgICAgICB2YXIgYW5hbHl6ZUF0dHJpYnV0ZSA9IGZ1bmN0aW9uIGFuYWx5emVBdHRyaWJ1dGUoYXR0cmlidXRlKSB7XG4gICAgICAgICAgICAgIHZhciBhdHRyU3ltID0gbmV3IEF0dHJpYnV0ZVN5bWJvbChhdHRyaWJ1dGUubmFtZS5uYW1lLCBhdHRyaWJ1dGUuYXR0cmlidXRlVHlwZSk7XG4gICAgICAgICAgICAgIGF0dHJTeW0uYXN0ID0gYXR0cmlidXRlO1xuICAgICAgICAgICAgICBjU3ltLmFkZFN5bWJvbChhdHRyU3ltKTtcbiAgICAgICAgICAgICAgYXR0cmlidXRlLnN5bSA9IGF0dHJTeW07XG5cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKTtcblxuICAgICAgICAgICAgdmFyIGFuYWx5emVQcm9jZWR1cmUgPSBmdW5jdGlvbiBhbmFseXplUHJvY2VkdXJlKHByb2MpIHtcbiAgICAgICAgICAgICAgdmFyIHByb2NTeW0gPSBuZXcgUHJvY2VkdXJlU3ltYm9sKHByb2MubmFtZS5uYW1lLCBhc3RQYXJhbXNUb0xpc3QocHJvYyksIHByb2MpO1xuICAgICAgICAgICAgICBwcm9jU3ltLnByb2MgPSBwcm9jO1xuICAgICAgICAgICAgICBjU3ltLmFkZFN5bWJvbChwcm9jU3ltKTtcbiAgICAgICAgICAgICAgcHJvYy5zeW0gPSBwcm9jU3ltO1xuXG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAgICAgICAgIHZhciBhbmFseXplRnVuY3Rpb24gPSBmdW5jdGlvbiBhbmFseXplRnVuY3Rpb24oZnVuYykge1xuICAgICAgICAgICAgICB2YXIgZnVuY1N5bSA9IG5ldyBGdW5jdGlvblN5bWJvbChmdW5jLm5hbWUubmFtZSwgYXN0UGFyYW1zVG9MaXN0KGZ1bmMpLCBmdW5jLnJldHVyblR5cGUsIGZ1bmMuYWxpYXMsIGZ1bmMpO1xuICAgICAgICAgICAgICBmdW5jU3ltLmFzdCA9IGZ1bmM7XG4gICAgICAgICAgICAgIGNTeW0uYWRkU3ltYm9sKGZ1bmNTeW0pO1xuICAgICAgICAgICAgICBmdW5jLnN5bSA9IGZ1bmNTeW07XG5cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKTtcblxuICAgICAgICAgICAgdmFyIGZzID0ge1xuICAgICAgICAgICAgICBcImZlYXR1cmUuYXR0cmlidXRlXCI6IGFuYWx5emVBdHRyaWJ1dGUsXG4gICAgICAgICAgICAgIFwiZmVhdHVyZS5wcm9jZWR1cmVcIjogYW5hbHl6ZVByb2NlZHVyZSxcbiAgICAgICAgICAgICAgXCJmZWF0dXJlLmZ1bmN0aW9uXCI6IGFuYWx5emVGdW5jdGlvbixcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBkaXNwYXRjaE9uVHlwZShmZWF0dXJlLCBmcyk7XG5cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgZmVhdHVyZUxpc3QuZmVhdHVyZXMuZm9yRWFjaChhbmFseXplRmVhdHVyZSwgdGhpcyk7XG4gICAgICAgIH0uYmluZCh0aGlzKTtcblxuICAgICAgICBzaW5nbGVDbGFzcy5mZWF0dXJlTGlzdHMuZm9yRWFjaChhbmFseXplRmVhdHVyZUxpc3QsIHRoaXMpO1xuICAgICAgfS5iaW5kKHRoaXMpO1xuXG5cbiAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoYXJndW1lbnRzLCBkaXNjb3ZlclN5bWJvbHNJbkNsYXNzQXN0cyk7XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgdmFyIGNvbm5lY3RTeW1ib2xzID0gZnVuY3Rpb24gY29ubmVjdFN5bWJvbHMgKCkge1xuICAgICAgdmFyIHJhd1R5cGVUb1R5cGVJbnN0YW5jZSA9ICBmdW5jdGlvbiByYXdUeXBlVG9UeXBlSW5zdGFuY2UocmF3VHlwZSkge1xuICAgICAgICBpZiAocmF3VHlwZS5ub2RlVHlwZSAhPT0gXCJ0eXBlXCIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKHJhd1R5cGUpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgQVNUOlwiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcGFyYW1ldGVySW5zdGFuY2VzID0gcmF3VHlwZS50eXBlUGFyYW1zLmZvckVhY2gocmF3VHlwZVRvVHlwZUluc3RhbmNlKTtcbiAgICAgICAgdmFyIHR5cGVOYW1lID0gcmF3VHlwZS5uYW1lLm5hbWU7XG4gICAgICAgIGlmICghdGhpcy5jbGFzc2VzLmhhc093blByb3BlcnR5KHR5cGVOYW1lKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlR5cGUgJ1wiICsgdHlwZU5hbWUgKyBcIicgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IFR5cGVJbnN0YW5jZSh0aGlzLmNsYXNzZXNbdHlwZU5hbWVdLCBwYXJhbWV0ZXJJbnN0YW5jZXMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfS5iaW5kKHRoaXMpO1xuICAgICAgZnVuY3Rpb24gY29ubmVjdEluQXR0cihhU3ltKSB7XG4gICAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlKi8gLy8gdGhpcz09Y2xhc3NTeW1cblxuICAgICAgICBhU3ltLnR5cGUgPSByYXdUeXBlVG9UeXBlSW5zdGFuY2UoYVN5bS5yYXdUeXBlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY29ubmVjdEluTWV0aG9kKG1TeW0pIHtcbiAgICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUqLyAvLyB0aGlzPT1jbGFzc1N5bVxuICAgICAgICBpZiAobVN5bSBpbnN0YW5jZW9mIEZ1bmN0aW9uU3ltYm9sKSB7XG4gICAgICAgICAgaWYgKG1TeW0ucmF3VHlwZSAmJiBtU3ltLnJhd1R5cGUubm9kZVR5cGUgIT09IFwidHlwZVwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIEFTVDpcIiArIG1TeW0ucmF3VHlwZS5ub2RlVHlwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbVN5bS50eXBlID0gcmF3VHlwZVRvVHlwZUluc3RhbmNlKG1TeW0ucmF3VHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICBtU3ltLnBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiBjb25uZWN0SW5NZXRob2RQYXJhbSAocGFyYW1ldGVyKSB7XG4gICAgICAgICAgcGFyYW1ldGVyLnR5cGUgPSByYXdUeXBlVG9UeXBlSW5zdGFuY2UocGFyYW1ldGVyLnJhd1R5cGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBtU3ltLmxvY2Fscy5mb3JFYWNoKGZ1bmN0aW9uIGNvbm5lY3RJbk1ldGhvZFBhcmFtIChwYXJhbWV0ZXIpIHtcbiAgICAgICAgICBwYXJhbWV0ZXIudHlwZSA9IHJhd1R5cGVUb1R5cGVJbnN0YW5jZShwYXJhbWV0ZXIucmF3VHlwZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBjbGFzc05hbWUgaW4gdGhpcy5jbGFzc2VzKSB7XG4gICAgICAgIGlmICh0aGlzLmNsYXNzZXMuaGFzT3duUHJvcGVydHkoY2xhc3NOYW1lKSkge1xuICAgICAgICAgIHZhciBjbGFzc1N5bSA9IHRoaXMuY2xhc3Nlc1tjbGFzc05hbWVdO1xuICAgICAgICAgIGNsYXNzU3ltLmZvckVhY2hBdHRyaWJ1dGUoY29ubmVjdEluQXR0cik7XG4gICAgICAgICAgY2xhc3NTeW0uZm9yRWFjaE1ldGhvZChjb25uZWN0SW5NZXRob2QpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5pbml0QnVpbHRpbigpO1xuICAgIHRoaXMuYW5hbHl6ZSA9IGZ1bmN0aW9uIGFuYWx5emUoKSB7XG4gICAgICBkaXNjb3ZlclN5bWJvbHMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGNvbm5lY3RTeW1ib2xzKCk7XG4gICAgfTtcbiAgfTtcblxuICBmdW5jdGlvbiBWaXNpdG9yKGhhbmRsZXJzKSB7XG4gICAgZnVuY3Rpb24gcmVjdXJzZShhc3QpIHtcblxuICAgIH1cbiAgfVxuXG4gIHZhciBidWlsdGluID0ge1xuICAgIGNsYXNzZXM6IFtdLFxuICB9O1xuXG4gIHJldHVybiB7XG4gICAgYnVpbHRpbjogYnVpbHRpbixcbiAgICBwYXJzZXI6IHBhcnNlcixcbiAgICBBbmFseXplcjogQW5hbHl6ZXIsXG4gICAgQXN0VHJhdmVyc2FsOiBBc3RUcmF2ZXJzYWwsXG4gIH07XG59O1xuXG5cbi8vIFZlcnNpb24uXG52ZWVzLlZFUlNJT04gPSAnMC4wLjAnO1xuXG5cbi8vIEV4cG9ydCB0byB0aGUgcm9vdCwgd2hpY2ggaXMgcHJvYmFibHkgYHdpbmRvd2AuXG5yb290LnZlZXMgPSB2ZWVzKCk7XG4iLCJ9KHRoaXMpKTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9