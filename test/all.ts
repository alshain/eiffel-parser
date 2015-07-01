/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/ts/fromJS.d.ts" />
/// <reference path="../src/ts/ast.ts" />
/// <reference path="../src/ts/symbols.ts" />
/// <reference path="../src/ts/util.ts" />
/// <reference path="../src/ts/semantics.ts" />

interface ErrorDiff {
  query: string;
  params: any[];
}

function testAll() {
  function fail(message) {
    ok(false, message);
  }
  QUnit.module("Grunt");
  test("generated files exist", function() {
    ok(okTests);
  });



  QUnit.module("Parser");
  test("the base function exists", function() {
    ok(eiffel);
  });
  test("parser exists", function() {
    ok(eiffel.parser);
  });
  test("parser.parse exists", function() {
    ok(eiffel.parser.parse);
  });


  QUnit.module("OKTests");
  okTests.forEach(function (file__content: {filename: string; content: string}) {

    test("Parsing " + file__content.filename, function() {
      try {
        eiffel.parser.parse(file__content.content);
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
        value: true,
        start: {offset: 0},
        end: {},
      },
    ],

    [
      "False parses",
      "Expression",
      "False",
      {
        __instanceof: eiffel.ast.BooleanLiteral,
        value: false,
        start: {},
        end: { offset: 5},
      },
    ],

    [
      "1 parses",
      "Expression",
      "1",
      {
        value: 1,
        start: {},
        end: {},
      },
    ],
    [
      "'1' parses",
      "Expression",
      "'1'",
      {
        value: "1",
        start: {},
        end: {},
      },
    ],

    [
      "%n parses",
      "Expression",
      '"%n%""',
      {
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
        start: {},
        end: {},
      },
    ],
    [
      "Verbatim string",
      "Expression",
      '"{\ntest\ntest\n}"',
      {
        start: {},
        end: {},
      },
    ],

  ];

  function compareAst(expected: any, actual: any) {

    var noDifferences = true;
    var differences: ErrorDiff[] = [];

    function compare(expected, actual, query) {
      function diff(...params: any[]) {
        noDifferences = false;
        differences.push({query: query, params: params});
      }
      if (expected === actual) {
        return;
      }

      if (expected === null && actual !== null) {
        diff("expected is null, actual is not", actual);
      }
      if (expected !== null && actual == null) {
        diff("actual is null when it should have been", actual);
        return;
      }

      if (typeof expected !== typeof actual) {
        diff("different types", "typeof expected " + typeof expected, "typeof actual " + typeof actual)
        return;
      }

      if (Array.isArray(expected)) {
        if (!Array.isArray(actual)) {
          diff("expected is object, actual is not", actual);
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
            if (key === "__instanceof") {
              if (!(actual instanceof expected[key])) {
                diff("actual has wrong type");
              }
            }
            else{
              if (actual.hasOwnProperty(key)) {
                compare(expected[key], actual[key], query + "[" + key + "]");
              }
              else {
                diff("actual is missing key " + key);
              }
            }
          }
        }
        return;
      }

      else {
        diff("different values", "Expected: ", expected, "Actual ", actual);
        return;
      }

      diff("unknown difference");
    }

    //compare(expected, actual, "this");

    if (differences.length) {
      return function () {
        differences.forEach(function (d) {
          console.group(d.query);
          console.error.apply(console, d.params);
          console.groupEnd();
        })
      }
    }
    else {
      return null;
    }
  }

  function okAst(errorFunction) {
    if (errorFunction) {
      errorFunction();
      ok(false, "AST was not equal");
    }
    else {
      ok(true);
    }
  }

  function nokAst(errorFunction) {
    if (errorFunction) {
      ok(true);
    }
    else {
      errorFunction();
      ok(false, "AST was not equal");
    }
  }

  QUnit.module("AST comparison function");
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

  QUnit.module("AST");
  astTests.forEach(function(n_s_t_e) {
    var name: string = <string> n_s_t_e[0];
    var start = n_s_t_e[1];
    var expression = n_s_t_e[2];
    var expected = n_s_t_e[3];

    test(name, function() {
      var actual = eiffel.parser.parse(<string>  <any> expression, {startRule: start});
      okAst(compareAst(expected, actual));

    });
  });

  QUnit.module("Analyzer");

  function analyze(...sources: string[]) {
    console.time("Parsing");
    var parsed = Array.prototype.map.call(sources, function (x, i) { return eiffel.parser.parse(x)});
    var analyzed = eiffel.semantics.analyze.apply(null, parsed);
    console.timeEnd("Parsing");
    if (analyzed.errors.errors.length > 0) {
      console.group("Analysis Failure");

      console.groupCollapsed("Sources");
      console.error(sources);
      console.groupEnd();

      console.group("Errors");
      analyzed.errors.errors.forEach((error) => {console.log(error)});
      console.groupEnd();
      console.info("Context: ", analyzed);
      console.groupEnd();
    }
    return analyzed;
  }
  test("should pass", function () {
    analyze("class CLASSNAME end");
    ok(true);
  });


  function analyzerHasClass(analyzed, className) {
    var hasClass = analyzed.context.hasClass(className);
    if (!hasClass) {
      console.log(analyzed.context.classSymbols);
    }
    ok(hasClass, "doesn't have class " + className);
  }

  function classHasSymbol(analyzed, className, symbolName) {
    var classSymbol = analyzed.context.classWithName(className);
    var hasSymbol = classSymbol.hasSymbol(symbolName);
    var errorMessage = "Class " + className + " does not have symbol " + symbolName;
    if (!hasSymbol) {
      console.error(errorMessage);
      console.log(analyzed);
      console.log(analyzed.context.classWithName(className));
    }
    ok(hasSymbol, errorMessage);

    var symbol = classSymbol.resolveSymbol(symbolName);
    var actualName = symbol.lowerCaseName;
    equal(actualName.toLowerCase(), symbolName.toLowerCase(), "Symbol has wrong name");
    var actualLowerCaseName = symbol.lowerCaseName;
    equal(actualLowerCaseName, symbolName.toLowerCase(), "Symbol has wrong name");
  }

  test("should find symbol", function() {
    var analyzed = analyze("class CLASSNAME feature test: INTEGER end");
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
    classHasSymbol(analyzed, "ANY", "Io");

  });

  test("Local variables exist", function () {
    var analyzed = analyze("class HASLOCALS feature abcd local var: INTEGER do end end");
    var local = analyzed.context.classWithName("HASLOCALS").declaredRoutines.get("abcd").localsAndParamsByName.get("var");
    equal(local.name, "var", "Local variable is not named var");
  });


  test("Symbols resolve correctly in attributes", function () {
    var analyzed = analyze("class A feature a: A end", "class B feature a: A end class C feature b: B end");
    var aSym = analyzed.context.classWithName("A");
    var bSym = analyzed.context.classWithName("B");
    var cSym = analyzed.context.classWithName("C");
    ok(aSym.resolveSymbol("a").typeInstance.baseType === aSym, "Type was not resolved");
    ok(bSym.resolveSymbol("a").typeInstance.baseType === aSym, "Type was not resolved");
    ok(cSym.resolveSymbol("b").typeInstance.baseType === bSym, "Type was not resolved");
  });


  test("Alias registers correctly", function () {
    var analyzed = analyze('class A feature b  alias "and then" (other: A): A do end end');

    ok(analyzed.context.classWithName("A").resolveSymbol("b") === analyzed.context.classWithName("A").aliases["and then"], "Alias was not registered");
    try{
      var analyzed = analyze('class A feature b  alias "and then" (other: A; other3: A): A do end end');
      ok(false, "Did not throw");
    } catch (e){
      equal(e.message, "This alias requires exactly 1 parameters. b has 2",  "Throws on wrong parameter count");
    }
  });


  test("Function return types resolve correctly", function () {
    var analyzed = analyze("class A feature b: A do end end");
    ok(analyzed.context.classWithName("A").resolveSymbol("b").typeInstance.baseType === analyzed.context.classWithName("A"), "Type was not resolved");
  });

  test("Local variables type resolves correctly", function () {
    var analyzed = analyze("class HASLOCALS feature abcd local var: INTEGER do end end");
    console.log("LOCAL VARS", analyzed);
    var local = analyzed.context.classWithName("HASLOCALS").declaredRoutines["abcd"].localsAndParamsByName["var"];
    ok(local.type.baseSymbol === analyzed.context.classWithName("INTEGER"), "Type was not resolved");

    equal(local.name, "var", "Local variable is not named var");
  });

}

eiffel.semantics.start(null, testAll, testAll);


