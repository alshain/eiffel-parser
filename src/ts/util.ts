module eiffel.util {

  export interface LookupTable<V> extends Map<string, V> {};
  export function caseIgnoreEquals(one: string, other: string) {
    var oneIsNull = one === null;
    var otherIsNull = other === null;

    if (oneIsNull !== otherIsNull) {
      // exactly one of both is null
      console.warn("caseIgnore with null values", one, other);
      return false;
    }

    if (oneIsNull && otherIsNull) {
      console.warn("caseIgnore with two null values");
      return true;
    }

    // both not null
    var firstNotAString = !(typeof one === "string");
    if(firstNotAString) {
      console.error("First param is not a string", one);
    }

    var secondNotAString = !(typeof other === "string");
    if(secondNotAString) {
      console.error("Second param is not a string", other);
    }

    if (firstNotAString || secondNotAString) {
      throw new Error("Type error in caseIgnoreEquals");
    }

    return one.toUpperCase() === other.toUpperCase();
  }

  export function cartesianProduct<T>(...arrays: T[][]): T[][] {
    return _.reduce(arrays, function (reduced, values) {
      var partialCartesians = reduced;
      return _.flatten(_.map(partialCartesians, function (partialCartesian) {
          return _.map(<any> values, function (value) {
            return partialCartesian.concat([value]);
          });
      }), true);
    }, [[]]);
  }

  export function pairs<T>(ts: T[]): [T, T][] {
    var result = [];
    for (var i = 0; i < ts.length; i++) {
      for (var j = i + 1; j < ts.length; j++) {
        result.push([ts[i], ts[j]]);
      }
    }

    return result;
  }

  export function group<K, V>(vs: V[], groupBy: (v: V) => K): Map<K, V[]> {
    var result = new Map<K, V[]>()
    vs.forEach(function (v: V) {
      var key = groupBy(v);
      if (!result.has(key)) {
        result.set(key, []);
      }
      result.get(key).push(v);
    });
    return result;
  }
}
