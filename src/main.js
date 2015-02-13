/* @flow */
/* eiffel-parser main */

// Base function.
var vees = function() {
  // Add functionality here.
  var parser = generatedParser;
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

  function FunctionSymbol(name, classSymbol, ast) {
    initRoutine.bind(this)(name, classSymbol, ast);
  }

  function ProcedureSymbol(name, classSymbol, ast) {
    initRoutine.bind(this)(name, classSymbol, ast);
  }

  function AttributeSymbol(name, classSymbol) {
    this.name = name;
    this.owningClass = classSymbol;
  }

  function ClassSymbol(className) {
    this.name = className;
    this.methods = {};
    this.functions = {};
    this.procedures = {};
    this.attributes = {};
    this.parents = [];

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

      throw new Error("Symbol not found");
    };

    this.addSymbol = function addSymbol(sym) {
      if (sym instanceof ProcedureSymbol) {
        this.methods[sym.name] = sym;
        this.procedures[sym.name] = sym;
      }
      else if (sym instanceof FunctionSymbol) {
        this.functions[sym.name] = sym;
        this.methods[sym.name] = sym;
      }
      else if (sym instanceof AttributeSymbol) {
        this.attributes[sym.name] = sym;
      }
    };
}

  function initRoutine(name, classSymbol, ast) {
    /*jshint validthis:true*/
    this.name = name;
    this.owningClass = classSymbol;
    this.locals = {};

    if (ast) {
      ast.localLists.forEach(function(localList) {
        localList.forEach(function(local) {
          var localName = local.name.name;
          this.locals[localName] = new LocalSymbol(local, this);

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
        this.classes[name] = new ClassSymbol(name);
        console.log(name);
      
      }.bind(this);

      var funcDef = function funcDef(name, params) {
      }.bind(this);

      var attrDef = function attrDef(name, params) {
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
        debug("Analyzing class: " + trav.className());

        var analyzeFeatureList = function analyzeFeatureList(featureList) {
          var analyzeFeature = function analyzeFeature(feature) {
            var analyzeAttribute = function analyzeAttribute(attribute) {
              var attrSym = new AttributeSymbol(attribute.name.name, cSym);
              attrSym.ast = attribute;
              cSym.addSymbol(attrSym);
              attribute.sym = attrSym;

            }.bind(this);

            var analyzeProcedure = function analyzeProcedure(proc) {
              var procSym = new ProcedureSymbol(proc.name.name, cSym, proc);
              procSym.proc = proc;
              cSym.addSymbol(procSym);
              proc.sym = procSym;

            }.bind(this);

            var analyzeFunction = function analyzeFunction(func) {
              var funcSym = new FunctionSymbol(func.name.name, cSym, func);
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

    this.initBuiltin();
    this.analyze = function analyze() {
      discoverSymbols.apply(this, arguments);
    };
  };

  function Visitor(handlers) {
    function recurse(ast) {
    
    }
  }

  var builtin = {
    classes: [],
    _util: {
      c: function(name, parents, fields, funcs, procs, consts) {
        var cSym = new ClassSymbol();
      },
      a: function() {
      },
      p: function() {
      },
      f: function() {
      }
    },
  
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
