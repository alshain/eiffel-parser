/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/ts/fromJS.d.ts" />
/// <reference path="../src/ts/ast.ts" />
/// <reference path="../src/ts/symbols.ts" />
/// <reference path="../src/ts/util.ts" />
/// <reference path="../src/ts/semantics.ts" />

import caseIgnoreEquals = eiffel.util.caseIgnoreEquals;
import cartesianProduct = eiffel.util.cartesianProduct;
import pairs = eiffel.util.pairs;

QUnit.module("Util Tests");

test("pairs", function () {
  var ps = pairs([1, 2, 3]);
  var actual = ps.length;
  check(actual === 3, "Expected length 3, actual: " + actual, ps);
});

test("cartesian", function () {
  var ps = cartesianProduct([1, 2, 3]);
  var actual = ps.length;
  check(actual === 3, "Expected length 3, actual: " + actual, ps);
  check(ps[0].length === 1, "Expected inner length to be 1, actual: " + ps[0].length, ps[0]);
});

test("cartesian with multiple args", function () {
  var ps = cartesianProduct([1, 2, 3], [1, 2, 3]);
  var actual = ps.length;
  check(actual === 3 * 3, "Expected length 9, actual: " + actual, ps);
  check(ps[0].length === 2, "Expected inner length to be 2, actual: " + ps[0].length, ps[0]);
});
