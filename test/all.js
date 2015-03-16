function fail(message) {
  ok(false, message);
}
module("Grunt");
test("generated files exist", function() {
  ok(okTests);
});



module("Parser");
test("the base function exists", function() {
  ok(vees);
});
test("parser exists", function() {
  ok(vees.parser);
});
test("parser.parse exists", function() {
  ok(vees.parser.parse);
});


module("OKTests");
okTests.forEach(function (file__content) {

  test("Parsing " + file__content.filename, function() {
    try {
      vees.parser.parse(file__content.content);
      ok(true);
    }
    catch (e) {
      fail(e.message + "\nLine: " + e.line + "\nColumn: " + e.column);
    }
  });
});



var astTests = [
  /*

  [
    "True parses",
    "Expression",
    "True",
    {
      nodeType: "literal.bool",
      value: true,
    },
  ],

  */
  [
    "True parses",
    "Expression",
    "True",
    {
      nodeType: "literal.bool",
      value: true,
      start: {column: 1},
      end: {},
    },
  ],

  [
    "False parses",
    "Expression",
    "False",
    {
      nodeType: "literal.bool",
      value: false,
      start: {},
      end: { line: 1},
    },
  ],

  [
    "1 parses",
    "Expression",
    "1",
    {
      nodeType: "literal.int",
      value: 1,
      start: {},
      end: {},
    },
  ],

  [
    "%n parses",
    "Expression",
    '"%n%""',
    {
      nodeType: "literal.string",
      value: '%n%"',
      start: {},
      end: {},
    },
  ],

  [
    "Void parses",
    "Expression",
    'Void',
    {
      nodeType: "literal.void",
      start: {},
      end: {},
    },
  ],

 ];

function compareAst(expected, actual) {
  var differences = [];

  function compare(expected, actual, query) {
    function diff() {
      var msg = Array.prototype.join.call(arguments, "\n");
      differences.push([query, msg]);
    }
    if (expected === actual) {
      return;
    }

    if (expected === null && actual !== null) {
        diff("expected is null, actual is not", JSON.stringify(actual));
    }
    if (expected !== null && actual == null) {
      diff("actual is null when it should have been", JSON.stringify(actual));
      return;
    }

    if (typeof expected !== typeof actual) {
      differences.push(["different types\ntypeof expected" + typeof expected + "\ntypeof actual" + typeof expected])
      diff("different types", "typeof expected " + typeof expected, "typeof actual " + typeof actual)
      return;
    }

    if (Array.isArray(expected)) {
      if (!Array.isArray(actual)) {
        diff("expected is object, actual is not", JSON.stringify(actual));
        return;
      }
      // both are arrays
      if (expected.length > actual.length) {
        diff("expected is longer", "expected: " + expected.length, "actual: " + actual.length);
        return false;
      }

      expected.forEach(function(x, x_i) {
        compare(x, actual[x_i], query + "[" + x_i + "]");
      });
    }

    if (typeof expected === 'object') {
      for (var key in expected) {
        if (expected.hasOwnProperty(key)) {
          if (actual.hasOwnProperty(key)) {
            compare(expected[key], actual[key], query + "[" + key + "]");
          }
          else {
            diff("actual is missing key " + key);
          }
        }
      }
      return;
    }

    else {
      diff("different values", "Expected: " + JSON.stringify(expected), "Actual " + JSON.stringify(actual));
      return;
    }

    diff("unknown difference");
  }

  compare(expected, actual, "this");

  if (differences.length) {
    var msg = "\n" + differences.length + " differences:";
    differences.forEach(function(x, x_i) {
      msg += "\nDifference " + x_i + ":\n";
      msg += "Query: " + x[0] + "\n";
      msg += x[1];
    });

    msg += "\n\nExpected: " + JSON.stringify(expected);
    msg += "\n\nActual: " + JSON.stringify(actual);
    return msg;
  }
  return "";
}

function okAst(message, expected, actual) {
  if (message === "") {
    ok(true);
  }
  else {
    ok(false, message);
  }
}

function nokAst(message, expected, actual) {
  if (message !== "") {
    ok(true);
  }
  else {
    ok(false, "ASTs were equal when they shouldn't have been");
  }
}

module("AST comparison function");
test("should work for empty objects", function() {
  okAst(compareAst({}, {}));
});

test("should work for single values", function() {
  okAst(compareAst({a: 2}, {a: 2}));
  nokAst(compareAst({a: 3}, {a: 2}));
  nokAst(compareAst({a: 3}, {a: "stringstuff"}));
  okAst(compareAst({a: null}, {a: null}));
  nokAst(compareAst({a: 2}, {a: null}));
  nokAst(compareAst({a: null}, {a: 2}));
});

test("actual has more stuff", function() {
  okAst(compareAst({i: "hello"}, {i: "hello", more: 2}));
  okAst(compareAst({i: "hello"}, {i: "hello", more: 2}));
  nokAst(compareAst({i: "different"}, {i: "hello", more: 2}));
});

test("different values -> false", function() {
  nokAst(compareAst({a: 2}, {a: 3}));
  nokAst(compareAst({a: "hello"}, {a: null}));
});

test("should work for nested objects", function() {
  okAst(compareAst({flat: 6, nested: {nested: {}}}, {flat: 6, nested: {nested: {}}}));
  nokAst(compareAst({flat: 6, nested: {nested: { something: null}}}, {flat: 6, nested: {nested: {}}}));
});

test("should work for nested objects", function() {
  okAst(compareAst({flat: 6, nested: {nested: {}}}, {flat: 6, nested: {nested: {}}}));
});

test("should not work for non-records", function() {
  nokAst(compareAst(null, {}));
  nokAst(compareAst({}, null));
  okAst(compareAst(null, null));
  okAst(compareAst(2, 2));
  nokAst(compareAst(3, 2));
  nokAst(compareAst(3, {}));
});

module("AST");
astTests.forEach(function(n_s_t_e) {
  var name = n_s_t_e[0];
  var start = n_s_t_e[1];
  var expression = n_s_t_e[2];
  var expected = n_s_t_e[3];

  test(name, function() {
    var actual = vees.parser.parse(expression, {startRule: start});
    okAst(compareAst(expected, actual), "Expected: \n" + JSON.stringify(expected) + "\nActual:\n" + JSON.stringify(actual));
  });
});

module("AstTraversal");
test("should return correct class name", function() {
  var ast = vees.parser.parse("class CLASSNAME end");
  var trav = new vees.AstTraversal(ast[0]);
  equal("CLASSNAME", trav.className());
});

module("Analyzer");

function analyze() {
  var analyzer = new vees.Analyzer();
  var parsed = Array.prototype.map.call(arguments, function (x, i) { return vees.parser.parse(x)});
  analyzer.analyze.apply(analyzer, parsed);

  return analyzer;
}
test("should pass", function () {
  analyze("class CLASSNAME end");
  ok(true);
});


function analyzerHasClass(analyzed, className) {
  var hasClass = analyzed.classes.hasOwnProperty(className);
  if (!hasClass) {
    console.log(analyzed.classes);
  }
  ok(hasClass, "doesn't have class className");
}

function classHasSymbol(analyzed, className, symbolName) {
  var classSymbol = analyzed.classes[className];
  var hasSymbol = classSymbol.hasSymbol(symbolName);
  var errorMessage = "Class " + className + " does not have symbol " + symbolName;
  if (!hasSymbol) {
    console.log(errorMessage);
    console.log(analyzed.classes[className]);
  }
  ok(hasSymbol, errorMessage);

  var symbol = classSymbol.resolveSymbol(symbolName);
  var actualName = symbol.name;
  equal(actualName, symbolName, "Symbol has wrong name");
}

test("should find symbol", function() {
  var analyzed = analyze("class CLASSNAME feature test: INTEGER end");
  ok(null != analyzed.classes["CLASSNAME"]);
  classHasSymbol(analyzed, "CLASSNAME", "test");
});


test("Analyze two classes in one input", function() {
  var analyzed = analyze("class A feature test: INTEGER end class B end");
  analyzerHasClass(analyzed, "A");
  analyzerHasClass(analyzed, "B");
});

test("Analyze two classes two sources", function() {
  var analyzed = analyze("class A feature test: INTEGER end", "class B end");
  analyzerHasClass(analyzed, "A");
  analyzerHasClass(analyzed, "B");
});

test("Symbols exist", function() {
  var analyzed = analyze("class A feature test: STRING test2: INTEGER f3: INTEGER do end f4 do end end");
  classHasSymbol(analyzed, "A", "test");
  classHasSymbol(analyzed, "A", "test2");
  classHasSymbol(analyzed, "A", "f3");
  classHasSymbol(analyzed, "A", "f4");
});

test("Local variables exist", function () {
  var analyzed = analyze("class HASLOCALS feature abcd local var: INTEGER do end end");
  var local = analyzed.classes["HASLOCALS"].methods["abcd"].locals["var"];
  console.log(local);

  equal(local.name, "var", "Local variable is not named var");
});
