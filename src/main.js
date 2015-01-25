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

  function dispatchOnType(node, fs) {
    var type = node.type;
    if(!fs.hasOwnProperty(type)) {
      console.log("Node");
      console.log(node);
      console.log(fs);
      throw new Error("Function for type " + type + " does not exist");
    }

    fs[type](node);
  }
  /*jshint unused:false*/
  var AstTraversal = function(ast) {
      this.className = function className() {
        return ast.name;
      };
    /*jshint unused:true*/
  };
  /*jshint unused:false*/
  var Analyzer = function Analyzer() {
    /*jshint unused:true*/
    this.classes = {};

    var discoverSymbols = function discoverSymbols() {

      function initRoutine(ast, classSymbol) {
        /*jshint validthis:true*/
        this.name = ast.name;
        this.owningClass = classSymbol;
        this.locals = {};
        this.ast = ast;

        ast.localLists.forEach(function(localList) {
          localList.forEach(function(local) {
            var localName = local.name;
            this.locals[localName] = new LocalSymbol(local, this);

          }, this);
        }, this);
      }

      function LocalSymbol(ast, owningMethod) {
        this.name = ast.name;
        this.owningMethod = owningMethod;

      }

      function FunctionSymbol(ast, classSymbol) {
        initRoutine.bind(this)(ast, classSymbol);

      }

      function ProcedureSymbol(ast, classSymbol) {
        initRoutine.bind(this)(ast, classSymbol);

      }

      function AttributeSymbol(ast, classSymbol) {
        this.name = ast.name;
        this.owningClass = classSymbol;
        this.ast = ast;

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
      }
      var discoverSymbolsInClassAsts = function (arrayOfClasses) {
        Array.prototype.forEach.call(arrayOfClasses, discoverSymbolsInSingleClass);
      }.bind(this);

      var discoverSymbolsInSingleClass = function (singleClass) {
        var trav = new AstTraversal(singleClass);
        var className = trav.className();
        var cSym = new ClassSymbol(className);
        this.classes[className] = cSym;
        debug("Analyzing class: " + trav.className());

        var analyzeFeatureList = function analyzeFeatureList(featureList) {
          var analyzeFeature = function analyzeFeature(feature) {
            var analyzeAttribute = function analyzeAttribute(attribute) {
              var attrName = attribute.name;
              cSym.attributes[attrName] = new AttributeSymbol(attribute, cSym);

            }.bind(this);

            var analyzeProcedure = function analyzeProcedure(procedure) {
              var procName = procedure.name;
              cSym.procedures[procName] = new ProcedureSymbol(procedure, cSym);
              cSym.methods[procName] = cSym.procedures[procName];

            }.bind(this);

            var analyzeFunction = function analyzeFunction(func) {
              var funcName = func.name;
              cSym.functions[funcName] = new FunctionSymbol(func, cSym);
              cSym.methods[funcName] = cSym.functions[funcName];

            }.bind(this);

            var fs = {
              "attribute": analyzeAttribute,
              "procedure": analyzeProcedure,
              "function": analyzeFunction,
            };
            dispatchOnType(feature, fs);

          };

          featureList.features.forEach(analyzeFeature, this);
        }.bind(this);

        singleClass.featureLists.forEach(analyzeFeatureList, this);
      }.bind(this);


      Array.prototype.forEach.call(arguments, discoverSymbolsInClassAsts);
    }.bind(this);

    this.analyze = function analyze() {
      discoverSymbols.apply(this, arguments);
    };

  };

  return {
    parser: parser,
    Analyzer: Analyzer,
    AstTraversal: AstTraversal,
  };
};


// Version.
vees.VERSION = '0.0.0';


// Export to the root, which is probably `window`.
root.vees = vees();
