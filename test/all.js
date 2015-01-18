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
      type: "literal",
      kind: "bool",
      value: true,
    },
  ],

  */
  [
    "True parses",
    "Expression",
    "True",
    {
      type: "literal",
      kind: "bool",
      value: true,
    },
  ],

  [
    "False parses",
    "Expression",
    "False",
    {
      type: "literal",
      kind: "bool",
      value: false,
    },
  ],

  [
    "1 parses",
    "Expression",
    "1",
    {
      type: "literal",
      kind: "int",
      value: 1,
    },
  ],

  [
    "%n parses",
    "Expression",
    '"%n"',
    {
      type: "literal",
      kind: "string",
      value: "\n",
    },
  ],

 ];

function compareAst(expected, actual) {

  for (var key in expected) {
    if (expected.hasOwnProperty(key)) {
      var v = expected[key];

      if (!actual.hasOwnProperty(key)) {
        return false;
      }

      if (v === null) {
        if (actual[key] !== null) {
          return false;
        }
        else {
          continue;
        }
      }

      if (typeof v !== typeof actual) {
        return false;
      }

      if (typeof v === 'object') {
        if (!compareAst(v, actual[key])) {
          return false;
        }
        continue;
      }

      if (v === actual[key]) {
        continue;
      }
      return false;
    }
  }
  return true;
}
astTests.forEach(function(n_s_t_e) {
  var name = n_s_t_e[0];
  var start = n_s_t_e[1];
  var expression = n_s_t_e[2];
  var expected = n_s_t_e[3];

  test(name, function() {
  
    ok(compareAst(vees.parser.parse(expression, {startRule: start}), expected));
  });
});
