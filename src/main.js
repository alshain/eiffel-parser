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
