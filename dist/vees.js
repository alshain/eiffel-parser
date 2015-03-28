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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIl9pbnRyby5qcyIsIm1haW4uanMiLCJfb3V0cm8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDemJBO0FBQ0EiLCJmaWxlIjoidmVlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbihyb290LCB1bmRlZmluZWQpIHtcclxuXHJcbiAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgdmFyIGdlbmVyYXRlZFBhcnNlciA9IG51bGw7XHJcbiIsIi8qIEBmbG93ICovXG4vKiBlaWZmZWwtcGFyc2VyIG1haW4gKi9cblxuLy8gQmFzZSBmdW5jdGlvbi5cbnZhciB2ZWVzID0gZnVuY3Rpb24oKSB7XG4gIC8vIEFkZCBmdW5jdGlvbmFsaXR5IGhlcmUuXG4gIHZhciBwYXJzZXIgPSBlaWZmZWwucGFyc2VyO1xuICBmdW5jdGlvbiBkZWJ1ZygpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGFyZ3VtZW50cywgZnVuY3Rpb24gKG1zZykge1xuICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY3Vyc2UoYXN0LCBkaXNwYXRjaGVyKSB7XG4gIH1cblxuICB2YXIgc2FuY3Rpb25lZEFzdFR5cGVzID0gW1xuICAgIFwiZmVhdHVyZS5hdHRyaWJ1dGVcIixcbiAgICBcImZlYXR1cmUuY29uc3RhbnRcIixcbiAgICBcImZlYXR1cmUuZnVuY3Rpb25cIixcbiAgICBcImZlYXR1cmUucHJvY2VkdXJlXCIsXG4gICAgXCJjb250cm9sLmlmXCIsXG4gICAgXCJjb250cm9sLmVsc2VcIixcbiAgICBcImNvbnRyb2wuZnJvbVwiLFxuICAgIFwiY29udHJvbC5hY3Jvc3NcIixcbiAgICBcImNvbnRyYWN0LmludmFyaWFudFwiLFxuICAgIFwiY29udHJhY3QucHJlY29uZGl0aW9uXCIsXG4gICAgXCJjb250cmFjdC5wb3N0Y29uZGl0aW9uXCIsXG4gICAgXCJjb250cmFjdC52YXJpYW50XCIsXG4gICAgXCJleHAuYmluLitcIixcbiAgICBcImV4cC5iaW4uLVwiLFxuICAgIFwiZXhwLmJpbi4qXCIsXG4gICAgXCJleHAuYmluLi9cIixcbiAgICBcImV4cC5iaW4uXFxcXFwiLFxuICAgIFwiZXhwLmJpbi5cXFxcXFxcXFwiLFxuICAgIFwiZXhwLmJpbi5eXCIsXG4gICAgXCJleHAuYmluLm9yXCIsXG4gICAgXCJleHAuYmluLm9yX2VcIixcbiAgICBcImV4cC5iaW4uYW5kXCIsXG4gICAgXCJleHAuYmluLmltcGxpZXNcIixcbiAgICBcImV4cC5iaW4uZG90ZG90XCIsXG4gICAgXCJleHAuYmluLlwiLFxuICAgIFwiZXhwLmJpbi5hbmRcIixcbiAgXTtcblxuICB2YXIgc2FuY3Rpb25lZEFsaWFzZXMgPSB7XG4gICAgXCJhbmRcIjogMSxcbiAgICBcImFuZCB0aGVuXCI6IDEsXG4gICAgXCJvclwiOiAxLFxuICAgIFwib3IgZWxzZVwiOiAxLFxuICAgIFwieG9yXCI6IDEsXG4gICAgXCJpbXBsZXNcIjogMSxcbiAgICBcIm5vdFwiOiAwLFxuICAgIFwiW11cIjogXCIqXCIsXG4gIH07XG5cbiAgZnVuY3Rpb24gZGlzcGF0Y2hPblR5cGUobm9kZSwgZnMpIHtcbiAgICB2YXIgdHlwZSA9IG5vZGUubm9kZVR5cGU7XG4gICAgdmFyIHNwbGl0dGVkID0gdHlwZS5zcGxpdChcIi5cIik7XG4gICAgdmFyIHR5cGVCeVNwZWNpZml0eSA9IHNwbGl0dGVkLm1hcChmdW5jdGlvbihfLCBpLCBhbGwpIHtcbiAgICAgIHJldHVybiBhbGwuc2xpY2UoMCwgYWxsLmxlbmd0aCAtIGkpLmpvaW4oXCIuXCIpO1xuICAgIH0pO1xuXG4gICAgdmFyIGZvdW5kRnVuY3Rpb24gPSBmYWxzZTtcbiAgICB0eXBlQnlTcGVjaWZpdHkuc29tZShmdW5jdGlvbih0eXBlUGFydCkge1xuICAgICAgaWYoZnMuaGFzT3duUHJvcGVydHkodHlwZVBhcnQpKSB7XG4gICAgICAgIGZvdW5kRnVuY3Rpb24gPSB0cnVlO1xuICAgICAgICBmc1t0eXBlUGFydF0obm9kZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbiAgICBpZiAoZm91bmRGdW5jdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiTm9kZVwiKTtcbiAgICAgIGNvbnNvbGUubG9nKG5vZGUpO1xuICAgICAgY29uc29sZS5sb2coZnMpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRnVuY3Rpb24gZm9yIHR5cGUgXCIgKyB0eXBlICsgXCIgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gTG9jYWxTeW1ib2woYXN0LCBvd25pbmdNZXRob2QpIHtcbiAgICB0aGlzLm5hbWUgPSBhc3QubmFtZS5uYW1lO1xuICAgIHRoaXMub3duaW5nTWV0aG9kID0gb3duaW5nTWV0aG9kO1xuICB9XG5cbiAgZnVuY3Rpb24gRnVuY3Rpb25TeW1ib2wobmFtZSwgcGFyYW1ldGVycywgcmF3VHlwZSwgYWxpYXMsIGFzdCkge1xuICAgIHRoaXMucmF3VHlwZSA9IHJhd1R5cGU7XG4gICAgdGhpcy5hbGlhcyA9IGFsaWFzO1xuICAgIGluaXRSb3V0aW5lLmJpbmQodGhpcykobmFtZSwgcGFyYW1ldGVycywgYXN0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIFByb2NlZHVyZVN5bWJvbChuYW1lLCBwYXJhbWV0ZXJzLCBhc3QpIHtcbiAgICBpbml0Um91dGluZS5iaW5kKHRoaXMpKG5hbWUsIHBhcmFtZXRlcnMsIGFzdCk7XG4gIH1cblxuICBmdW5jdGlvbiBBdHRyaWJ1dGVTeW1ib2wobmFtZSwgcmF3VHlwZSkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5yYXdUeXBlID0gcmF3VHlwZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIFR5cGVJbnN0YW5jZShiYXNlU3ltYm9sLCBwYXJhbWV0ZXJJbnN0YW5jZXMpIHtcbiAgICB0aGlzLmJhc2VTeW1ib2wgPSBiYXNlU3ltYm9sO1xuICAgIHRoaXMucGFyYW1ldGVycyA9IHBhcmFtZXRlckluc3RhbmNlcztcbiAgfVxuXG4gIGZ1bmN0aW9uIENsYXNzU3ltYm9sKGNsYXNzTmFtZSkge1xuICAgIHRoaXMubmFtZSA9IGNsYXNzTmFtZTtcbiAgICB0aGlzLm1ldGhvZHMgPSB7fTtcbiAgICB0aGlzLmZ1bmN0aW9ucyA9IHt9O1xuICAgIHRoaXMucHJvY2VkdXJlcyA9IHt9O1xuICAgIHRoaXMuYXR0cmlidXRlcyA9IHt9O1xuICAgIHRoaXMucGFyZW50cyA9IFtdO1xuICAgIHRoaXMuYWxpYXNlcyA9IHt9O1xuXG4gICAgdGhpcy5oYXNTeW1ib2wgPSBmdW5jdGlvbiBoYXNTeW1ib2wobmFtZSkge1xuICAgICAgaWYgKHRoaXMubWV0aG9kcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5mdW5jdGlvbnMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wcm9jZWR1cmVzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIHRoaXMucmVzb2x2ZVN5bWJvbCA9IGZ1bmN0aW9uIHJlc29sdmVTeW1ib2wobmFtZSkge1xuICAgICAgaWYgKHRoaXMubWV0aG9kcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5tZXRob2RzW25hbWVdO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucHJvY2VkdXJlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9jZWR1cmVzW25hbWVdO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZnVuY3Rpb25zLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZ1bmN0aW9uc1tuYW1lXTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlc1tuYW1lXTtcbiAgICAgIH1cblxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3ltYm9sICdcIiArIG5hbWUgKyBcIicgbm90IGZvdW5kIGluIGNsYXNzICdcIiArIHRoaXMubmFtZSArIFwiJ1wiKTtcbiAgICB9O1xuXG4gICAgdGhpcy5hZGRTeW1ib2wgPSBmdW5jdGlvbiBhZGRTeW1ib2woc3ltKSB7XG4gICAgICBpZiAoc3ltIGluc3RhbmNlb2YgUHJvY2VkdXJlU3ltYm9sKSB7XG4gICAgICAgIHRoaXMubWV0aG9kc1tzeW0ubmFtZV0gPSBzeW07XG4gICAgICAgIHRoaXMucHJvY2VkdXJlc1tzeW0ubmFtZV0gPSBzeW07XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChzeW0gaW5zdGFuY2VvZiBGdW5jdGlvblN5bWJvbCkge1xuICAgICAgICB0aGlzLmZ1bmN0aW9uc1tzeW0ubmFtZV0gPSBzeW07XG4gICAgICAgIHRoaXMubWV0aG9kc1tzeW0ubmFtZV0gPSBzeW07XG4gICAgICAgIGlmIChzeW0uYWxpYXMpIHtcbiAgICAgICAgICBpZiAoIXNhbmN0aW9uZWRBbGlhc2VzLmhhc093blByb3BlcnR5KHN5bS5hbGlhcykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgYWxpYXM6IFwiICsgc3ltLmFsaWFzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIHJlcXVpcmVkUGFyYW1Db3VudCA9IHNhbmN0aW9uZWRBbGlhc2VzW3N5bS5hbGlhc107XG4gICAgICAgICAgaWYgKHJlcXVpcmVkUGFyYW1Db3VudCAhPT0gc3ltLnBhcmFtZXRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIGFsaWFzIHJlcXVpcmVzIGV4YWN0bHkgXCIgKyByZXF1aXJlZFBhcmFtQ291bnQgKyBcIiBwYXJhbWV0ZXJzLiBcIiArXG4gICAgICAgICAgICAgICAgc3ltLm5hbWUgKyBcIiBoYXMgXCIgKyBzeW0ucGFyYW1ldGVycy5sZW5ndGhcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5hbGlhc2VzW3N5bS5hbGlhc10gPSBzeW07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHN5bSBpbnN0YW5jZW9mIEF0dHJpYnV0ZVN5bWJvbCkge1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXNbc3ltLm5hbWVdID0gc3ltO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgc3ltYm9sOiBcIiArIHN5bSk7XG4gICAgICB9XG4gICAgICBzeW0ub3duaW5nQ2xhc3MgPSB0aGlzO1xuICAgIH07XG5cbiAgICB0aGlzLmZvckVhY2hTeW1ib2wgPSBmdW5jdGlvbiBmb3JFYWNoU3ltYm9sKHN5bWJvbHMsIGYpIHtcbiAgICAgIGZvciAodmFyIHN5bU5hbWUgaW4gc3ltYm9scykge1xuICAgICAgICBpZiAoc3ltYm9scy5oYXNPd25Qcm9wZXJ0eShzeW1OYW1lKSkge1xuICAgICAgICAgIGYuY2FsbCh0aGlzLCBzeW1ib2xzW3N5bU5hbWVdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmZvckVhY2hBdHRyaWJ1dGUgPSBmdW5jdGlvbiBmb3JFYWNoQXR0cmlidXRlKGYpIHtcbiAgICAgIHRoaXMuZm9yRWFjaFN5bWJvbCh0aGlzLmF0dHJpYnV0ZXMsIGYpO1xuICAgIH07XG5cbiAgICB0aGlzLmZvckVhY2hNZXRob2QgPSBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kKGYpIHtcbiAgICAgIHRoaXMuZm9yRWFjaFN5bWJvbCh0aGlzLm1ldGhvZHMsIGYpO1xuICAgIH07XG5cbiAgICB0aGlzLmZvckVhY2hQcm9jZWR1cmUgPSBmdW5jdGlvbiBmb3JFYWNoUHJvY2VkdXJlKGYpIHtcbiAgICAgIHRoaXMuZm9yRWFjaFN5bWJvbCh0aGlzLnByb2NlZHVyZXMsIGYpO1xuICAgIH07XG5cbiAgICB0aGlzLmZvckVhY2hGdW5jdGlvbiA9IGZ1bmN0aW9uIGZvckVhY2hGdW5jdGlvbihmKSB7XG4gICAgICB0aGlzLmZvckVhY2hTeW1ib2wodGhpcy5mdW5jdGlvbnMsIGYpO1xuICAgIH07XG59XG5cbiAgZnVuY3Rpb24gaW5pdFJvdXRpbmUobmFtZSwgcGFyYW1zLCBhc3QpIHtcbiAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSovXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnBhcmFtZXRlcnMgPSBwYXJhbXM7XG4gICAgdmFyIHBhcmFtc0J5TmFtZSA9IHt9O1xuICAgIHBhcmFtcy5mb3JFYWNoKGZ1bmN0aW9uIHBhcmFtVG9QYXJhbUJ5TmFtZSAocGFyYW0pIHtcbiAgICAgIHBhcmFtc0J5TmFtZVtwYXJhbS5uYW1lXSA9IHBhcmFtO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wYXJhbWV0ZXJzQnlOYW1lID0gcGFyYW1zQnlOYW1lO1xuXG4gICAgdGhpcy5sb2NhbHMgPSBbXTtcbiAgICB0aGlzLmxvY2Fsc0J5TmFtZSA9IHt9O1xuXG4gICAgaWYgKGFzdCkge1xuICAgICAgYXN0LmxvY2FsTGlzdHMuZm9yRWFjaChmdW5jdGlvbihsb2NhbExpc3QpIHtcbiAgICAgICAgbG9jYWxMaXN0LmZvckVhY2goZnVuY3Rpb24obG9jYWwpIHtcbiAgICAgICAgICB2YXIgbG9jYWxOYW1lID0gbG9jYWwubmFtZS5uYW1lO1xuICAgICAgICAgIHZhciBuZXdMb2NhbCA9IG5ldyBMb2NhbFN5bWJvbChsb2NhbCwgdGhpcyk7XG4gICAgICAgICAgbmV3TG9jYWwuYXN0ID0gbG9jYWw7XG4gICAgICAgICAgbmV3TG9jYWwucmF3VHlwZSA9IGxvY2FsLnBhcmFtZXRlclR5cGU7XG4gICAgICAgICAgdGhpcy5sb2NhbHMucHVzaChuZXdMb2NhbCk7XG4gICAgICAgICAgdGhpcy5sb2NhbHNCeU5hbWVbbG9jYWxOYW1lXSA9IG5ld0xvY2FsO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH1cbiAgfVxuXG5cbiAgLypqc2hpbnQgdW51c2VkOmZhbHNlKi9cbiAgdmFyIEFzdFRyYXZlcnNhbCA9IGZ1bmN0aW9uKGFzdCkge1xuICAgICAgdGhpcy5jbGFzc05hbWUgPSBmdW5jdGlvbiBjbGFzc05hbWUoKSB7XG4gICAgICAgIHJldHVybiBhc3QubmFtZS5uYW1lO1xuICAgICAgfTtcbiAgICAvKmpzaGludCB1bnVzZWQ6dmFycyovXG4gIH07XG4gIC8qanNoaW50IHVudXNlZDpmYWxzZSovXG4gIHZhciBBbmFseXplciA9IGZ1bmN0aW9uIEFuYWx5emVyKCkge1xuICAgIC8qanNoaW50IHVudXNlZDp2YXJzKi9cbiAgICB0aGlzLmNsYXNzZXMgPSB7fTtcblxuICAgIHRoaXMuaW5pdEJ1aWx0aW4gPSBmdW5jdGlvbiBpbml0QnVpbHRpbigpIHtcbiAgICAgIHZhciBjbGFzc0RlZiA9IGZ1bmN0aW9uIGNsYXNzRGVmKG5hbWUsIHBhcmVudHMsIGZpZWxkcywgZnVuY3MsIHByb2NzLCBjb25zdHMpIHtcbiAgICAgICAgdmFyIGNsYXNzU3ltYm9sID0gbmV3IENsYXNzU3ltYm9sKG5hbWUpO1xuICAgICAgICB0aGlzLmNsYXNzZXNbbmFtZV0gPSBjbGFzc1N5bWJvbDtcbiAgICAgICAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24oZmllbGQsIGluZGV4KXtcbiAgICAgICAgICBjbGFzc1N5bWJvbC5hZGRTeW1ib2woZmllbGQpO1xuICAgICAgICB9KTtcbiAgICAgIH0uYmluZCh0aGlzKTtcblxuICAgICAgZnVuY3Rpb24gZ3JvdXBQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yKHZhciBrID0gMCwgcGFyYW1zTGVuZ3RoID0gcGFyYW1zLmxlbmd0aCAvIDI7IGsgPCBwYXJhbXNMZW5ndGg7IGsrKyl7XG4gICAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgICAgbmFtZTogcGFyYW1zW2sgKiAyXSxcbiAgICAgICAgICAgIHJhd1R5cGU6IHBhcnNlci5wYXJzZShwYXJhbXNbayAqIDIgKyAxXSwge3N0YXJ0UnVsZTogXCJUeXBlXCJ9KSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG5cbiAgICAgIHZhciBmdW5jRGVmID0gZnVuY3Rpb24gZnVuY0RlZihuYW1lLCBwYXJhbXMsIHJldHVyblR5cGUsIGFsaWFzKSB7XG4gICAgICAgIHJldHVybiBuZXcgRnVuY3Rpb25TeW1ib2wobmFtZSwgZ3JvdXBQYXJhbXMocGFyYW1zKSwgcGFyc2VyLnBhcnNlKHJldHVyblR5cGUsIHtzdGFydFJ1bGU6IFwiVHlwZVwifSksIGFsaWFzKTtcbiAgICAgIH0uYmluZCh0aGlzKTtcblxuICAgICAgdmFyIGF0dHJEZWYgPSBmdW5jdGlvbiBhdHRyRGVmKG5hbWUsIHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBdHRyaWJ1dGVTeW1ib2wobmFtZSwgcGFyc2VyLnBhcnNlKHR5cGUsIHtzdGFydFJ1bGU6IFwiVHlwZVwifSkpO1xuICAgICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgICB2YXIgcHJvY0RlZiA9IGZ1bmN0aW9uIHByb2NEZWYobmFtZSwgcGFyYW1zKSB7XG4gICAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAgIHZhciBjb25zdERlZiA9IGZ1bmN0aW9uIGNvbnN0RGVmKG5hbWUsIHBhcmFtcykge1xuICAgICAgfS5iaW5kKHRoaXMpO1xuXG5cbiAgICAgIHJvb3QudmVlcy5idWlsdGluLmNsYXNzZXMuZm9yRWFjaChmdW5jdGlvbihjbGFzc0Z1bmMpIHtcbiAgICAgICAgY2xhc3NGdW5jKGNsYXNzRGVmLCBhdHRyRGVmLCBwcm9jRGVmLCBmdW5jRGVmLCBjb25zdERlZik7XG5cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgZGlzY292ZXJTeW1ib2xzID0gZnVuY3Rpb24gZGlzY292ZXJTeW1ib2xzKCkge1xuXG4gICAgICB2YXIgZGlzY292ZXJTeW1ib2xzSW5DbGFzc0FzdHMgPSBmdW5jdGlvbiAoYXJyYXlPZkNsYXNzZXMpIHtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChhcnJheU9mQ2xhc3NlcywgZGlzY292ZXJTeW1ib2xzSW5TaW5nbGVDbGFzcyk7XG4gICAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAgIHZhciBkaXNjb3ZlclN5bWJvbHNJblNpbmdsZUNsYXNzID0gZnVuY3Rpb24gKHNpbmdsZUNsYXNzKSB7XG4gICAgICAgIHZhciB0cmF2ID0gbmV3IEFzdFRyYXZlcnNhbChzaW5nbGVDbGFzcyk7XG4gICAgICAgIHZhciBjbGFzc05hbWUgPSB0cmF2LmNsYXNzTmFtZSgpO1xuICAgICAgICB2YXIgY1N5bSA9IG5ldyBDbGFzc1N5bWJvbChjbGFzc05hbWUpO1xuICAgICAgICB0aGlzLmNsYXNzZXNbY2xhc3NOYW1lXSA9IGNTeW07XG4gICAgICAgIHNpbmdsZUNsYXNzLnN5bSA9IGNTeW07XG5cbiAgICAgICAgZnVuY3Rpb24gYXN0UGFyYW1zVG9MaXN0KGFzdCkge1xuICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICBhc3QucGFyYW1zLmZvckVhY2goZnVuY3Rpb24gYWRkUGFyYW1Ub0xpc3QgKHBhcmFtKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICAgIG5hbWU6IHBhcmFtLm5hbWUubmFtZSxcbiAgICAgICAgICAgICAgcmF3VHlwZTogcGFyYW0ucGFyYW1ldGVyVHlwZSxcbiAgICAgICAgICAgICAgYXN0OiBwYXJhbSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYW5hbHl6ZUZlYXR1cmVMaXN0ID0gZnVuY3Rpb24gYW5hbHl6ZUZlYXR1cmVMaXN0KGZlYXR1cmVMaXN0KSB7XG4gICAgICAgICAgdmFyIGFuYWx5emVGZWF0dXJlID0gZnVuY3Rpb24gYW5hbHl6ZUZlYXR1cmUoZmVhdHVyZSkge1xuICAgICAgICAgICAgdmFyIGFuYWx5emVBdHRyaWJ1dGUgPSBmdW5jdGlvbiBhbmFseXplQXR0cmlidXRlKGF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgICB2YXIgYXR0clN5bSA9IG5ldyBBdHRyaWJ1dGVTeW1ib2woYXR0cmlidXRlLm5hbWUubmFtZSwgYXR0cmlidXRlLmF0dHJpYnV0ZVR5cGUpO1xuICAgICAgICAgICAgICBhdHRyU3ltLmFzdCA9IGF0dHJpYnV0ZTtcbiAgICAgICAgICAgICAgY1N5bS5hZGRTeW1ib2woYXR0clN5bSk7XG4gICAgICAgICAgICAgIGF0dHJpYnV0ZS5zeW0gPSBhdHRyU3ltO1xuXG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAgICAgICAgIHZhciBhbmFseXplUHJvY2VkdXJlID0gZnVuY3Rpb24gYW5hbHl6ZVByb2NlZHVyZShwcm9jKSB7XG4gICAgICAgICAgICAgIHZhciBwcm9jU3ltID0gbmV3IFByb2NlZHVyZVN5bWJvbChwcm9jLm5hbWUubmFtZSwgYXN0UGFyYW1zVG9MaXN0KHByb2MpLCBwcm9jKTtcbiAgICAgICAgICAgICAgcHJvY1N5bS5wcm9jID0gcHJvYztcbiAgICAgICAgICAgICAgY1N5bS5hZGRTeW1ib2wocHJvY1N5bSk7XG4gICAgICAgICAgICAgIHByb2Muc3ltID0gcHJvY1N5bTtcblxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgICAgICAgICB2YXIgYW5hbHl6ZUZ1bmN0aW9uID0gZnVuY3Rpb24gYW5hbHl6ZUZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAgICAgICAgICAgdmFyIGZ1bmNTeW0gPSBuZXcgRnVuY3Rpb25TeW1ib2woZnVuYy5uYW1lLm5hbWUsIGFzdFBhcmFtc1RvTGlzdChmdW5jKSwgZnVuYy5yZXR1cm5UeXBlLCBmdW5jLmFsaWFzLCBmdW5jKTtcbiAgICAgICAgICAgICAgZnVuY1N5bS5hc3QgPSBmdW5jO1xuICAgICAgICAgICAgICBjU3ltLmFkZFN5bWJvbChmdW5jU3ltKTtcbiAgICAgICAgICAgICAgZnVuYy5zeW0gPSBmdW5jU3ltO1xuXG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAgICAgICAgIHZhciBmcyA9IHtcbiAgICAgICAgICAgICAgXCJmZWF0dXJlLmF0dHJpYnV0ZVwiOiBhbmFseXplQXR0cmlidXRlLFxuICAgICAgICAgICAgICBcImZlYXR1cmUucHJvY2VkdXJlXCI6IGFuYWx5emVQcm9jZWR1cmUsXG4gICAgICAgICAgICAgIFwiZmVhdHVyZS5mdW5jdGlvblwiOiBhbmFseXplRnVuY3Rpb24sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZGlzcGF0Y2hPblR5cGUoZmVhdHVyZSwgZnMpO1xuXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGZlYXR1cmVMaXN0LmZlYXR1cmVzLmZvckVhY2goYW5hbHl6ZUZlYXR1cmUsIHRoaXMpO1xuICAgICAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAgICAgc2luZ2xlQ2xhc3MuZmVhdHVyZUxpc3RzLmZvckVhY2goYW5hbHl6ZUZlYXR1cmVMaXN0LCB0aGlzKTtcbiAgICAgIH0uYmluZCh0aGlzKTtcblxuXG4gICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGFyZ3VtZW50cywgZGlzY292ZXJTeW1ib2xzSW5DbGFzc0FzdHMpO1xuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIHZhciBjb25uZWN0U3ltYm9scyA9IGZ1bmN0aW9uIGNvbm5lY3RTeW1ib2xzICgpIHtcbiAgICAgIHZhciByYXdUeXBlVG9UeXBlSW5zdGFuY2UgPSAgZnVuY3Rpb24gcmF3VHlwZVRvVHlwZUluc3RhbmNlKHJhd1R5cGUpIHtcbiAgICAgICAgaWYgKHJhd1R5cGUubm9kZVR5cGUgIT09IFwidHlwZVwiKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihyYXdUeXBlKTtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIEFTVDpcIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhcmFtZXRlckluc3RhbmNlcyA9IHJhd1R5cGUudHlwZVBhcmFtcy5mb3JFYWNoKHJhd1R5cGVUb1R5cGVJbnN0YW5jZSk7XG4gICAgICAgIHZhciB0eXBlTmFtZSA9IHJhd1R5cGUubmFtZS5uYW1lO1xuICAgICAgICBpZiAoIXRoaXMuY2xhc3Nlcy5oYXNPd25Qcm9wZXJ0eSh0eXBlTmFtZSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUeXBlICdcIiArIHR5cGVOYW1lICsgXCInIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBUeXBlSW5zdGFuY2UodGhpcy5jbGFzc2VzW3R5cGVOYW1lXSwgcGFyYW1ldGVySW5zdGFuY2VzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgIGZ1bmN0aW9uIGNvbm5lY3RJbkF0dHIoYVN5bSkge1xuICAgICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSovIC8vIHRoaXM9PWNsYXNzU3ltXG5cbiAgICAgICAgYVN5bS50eXBlID0gcmF3VHlwZVRvVHlwZUluc3RhbmNlKGFTeW0ucmF3VHlwZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNvbm5lY3RJbk1ldGhvZChtU3ltKSB7XG4gICAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlKi8gLy8gdGhpcz09Y2xhc3NTeW1cbiAgICAgICAgaWYgKG1TeW0gaW5zdGFuY2VvZiBGdW5jdGlvblN5bWJvbCkge1xuICAgICAgICAgIGlmIChtU3ltLnJhd1R5cGUgJiYgbVN5bS5yYXdUeXBlLm5vZGVUeXBlICE9PSBcInR5cGVcIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBBU1Q6XCIgKyBtU3ltLnJhd1R5cGUubm9kZVR5cCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG1TeW0udHlwZSA9IHJhd1R5cGVUb1R5cGVJbnN0YW5jZShtU3ltLnJhd1R5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbVN5bS5wYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gY29ubmVjdEluTWV0aG9kUGFyYW0gKHBhcmFtZXRlcikge1xuICAgICAgICAgIHBhcmFtZXRlci50eXBlID0gcmF3VHlwZVRvVHlwZUluc3RhbmNlKHBhcmFtZXRlci5yYXdUeXBlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbVN5bS5sb2NhbHMuZm9yRWFjaChmdW5jdGlvbiBjb25uZWN0SW5NZXRob2RQYXJhbSAocGFyYW1ldGVyKSB7XG4gICAgICAgICAgcGFyYW1ldGVyLnR5cGUgPSByYXdUeXBlVG9UeXBlSW5zdGFuY2UocGFyYW1ldGVyLnJhd1R5cGUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgY2xhc3NOYW1lIGluIHRoaXMuY2xhc3Nlcykge1xuICAgICAgICBpZiAodGhpcy5jbGFzc2VzLmhhc093blByb3BlcnR5KGNsYXNzTmFtZSkpIHtcbiAgICAgICAgICB2YXIgY2xhc3NTeW0gPSB0aGlzLmNsYXNzZXNbY2xhc3NOYW1lXTtcbiAgICAgICAgICBjbGFzc1N5bS5mb3JFYWNoQXR0cmlidXRlKGNvbm5lY3RJbkF0dHIpO1xuICAgICAgICAgIGNsYXNzU3ltLmZvckVhY2hNZXRob2QoY29ubmVjdEluTWV0aG9kKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIHRoaXMuaW5pdEJ1aWx0aW4oKTtcbiAgICB0aGlzLmFuYWx5emUgPSBmdW5jdGlvbiBhbmFseXplKCkge1xuICAgICAgZGlzY292ZXJTeW1ib2xzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBjb25uZWN0U3ltYm9scygpO1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gVmlzaXRvcihoYW5kbGVycykge1xuICAgIGZ1bmN0aW9uIHJlY3Vyc2UoYXN0KSB7XG5cbiAgICB9XG4gIH1cblxuICB2YXIgYnVpbHRpbiA9IHtcbiAgICBjbGFzc2VzOiBbXSxcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGJ1aWx0aW46IGJ1aWx0aW4sXG4gICAgcGFyc2VyOiBwYXJzZXIsXG4gICAgQW5hbHl6ZXI6IEFuYWx5emVyLFxuICAgIEFzdFRyYXZlcnNhbDogQXN0VHJhdmVyc2FsLFxuICB9O1xufTtcblxuXG4vLyBWZXJzaW9uLlxudmVlcy5WRVJTSU9OID0gJzAuMC4wJztcblxuXG4vLyBFeHBvcnQgdG8gdGhlIHJvb3QsIHdoaWNoIGlzIHByb2JhYmx5IGB3aW5kb3dgLlxucm9vdC52ZWVzID0gdmVlcygpO1xuIiwifSh0aGlzKSk7XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==