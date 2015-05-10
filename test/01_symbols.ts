/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/ts/fromJS.d.ts" />
/// <reference path="../src/ts/ast.ts" />
/// <reference path="../src/ts/symbols.ts" />
/// <reference path="../src/ts/util.ts" />
/// <reference path="../src/ts/semantics.ts" />

import ClassSymbol = eiffel.symbols.ClassSymbol;
import TypeInstance = eiffel.symbols.TypeInstance;

QUnit.module("TypeInstance Tests");
test("different Generic Derivation works", function() {
  var a = new ClassSymbol("A", null);
  var b = new ClassSymbol("B", null);
  var c = new ClassSymbol("C", null);
  var g1 = new ClassSymbol("G1", null);
  var g2 = new ClassSymbol("G2", null);

  var t1_1 = new TypeInstance(a, [], a);
  var t1_2 = new TypeInstance(a, [], a);

  ok(t1_1.equals(t1_2));
  ok(!t1_1.differentGenericDerivationThan(t1_2));


  var t2_1 = new TypeInstance(g1, [new TypeInstance(a, [], a)], a);
  var t2_2 = new TypeInstance(g1, [new TypeInstance(a, [], a)], a);

  var t3_1 = new TypeInstance(g2, [t2_1, t1_1], a);
  var t3_1 = new TypeInstance(g2, [t2_1, t1_1], a);



});
