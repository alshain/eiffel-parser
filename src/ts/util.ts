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

  export function group<K, V>(vs, groupBy: (v: V) => K): Map<K, V[]> {
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

  /**
   * result.length == min(xs.length, ys.length)
   * @param xs
   * @param ys
   */
  export function zip<X, Y>(xs: X[], ys: Y[]) : [X, Y][] {
    var result = [];
    var maxI = Math.min(xs.length, ys.length);
    for (var i = 0; i < maxI; i++) {
      result.push([xs[i], ys[i]]);
    }
    return result;
  }

  export function debugAssert(mustBeTrue: boolean, message: string) {
    if (!mustBeTrue) {
      console.error(message);
      debugger;
      throw new Error(message);
    }
  }

  export class Graph<N, D> {
    edges: Map<N, Set<N>>;
    nodes: Set<N>;

    constructor(nodes: N[]) {
      this.nodes = new Set<N>();
      this.edges = new Map<N, Set<N>>();
      nodes.forEach(function (node) {
        debugAssert(!this.nodes.has(node), "Duplicate node in graph");
        this.nodes.add(node);
      }, this);
    }

    connect(from: N, to: N, debugDuplicate: boolean = false) {
      debugAssert(from !== null && from !== undefined, "First argument is null or undefiined");
      debugAssert(to !== null && to !== undefined, "Second argument is null or undefiined");
      debugAssert(this.nodes.has(from), "Cannot work with nodes that aren't in graph");
      debugAssert(this.nodes.has(to), "Cannot work with nodes that aren't in graph");
      debugAssert(from !== to, "self-cycles are not supported");

      var edges = this.edgesFor(from);
      if (debugDuplicate && edges.has(to)) {
        debugAssert(true, "Edge already exists in graph");
      }

      edges.add(to);

      return this;
    }

    goesTo(from: N, potentialTarget: N): boolean {
      return this.edgesFor(from).has(potentialTarget);
    }

    edgesFor(node: N) {
      debugAssert(this.nodes.has(node), "Node is not in graph");
      if (!this.edges.has(node)) {
        this.edges.set(node, new Set<N>());
      }
      return this.edges.get(node);
    }

    tarjan() {
      var stack: N[] = [];
      var onStack = new Set<N>();
      var assignment = new Map<N, number>();
      var lowLinks = new Map<N, number>();
      var results = [];
      var index = 0;
      var graph = this;
      function getStronglyConnectedComponent(node: N) {
        if (assignment.has(node)) {
          return;
        }
        else {
          stack.push(node);
          onStack.add(node);
          console.log(node);
          assignment.set(node, index);
          lowLinks.set(node, index);
          index++;
        }

        var edges = graph.edgesFor(node);
        edges.forEach(function (targetNode) {
          console.log("Visiting edge: ", node, targetNode);
          if (!assignment.has(targetNode)) {
            getStronglyConnectedComponent(targetNode);
            lowLinks.set(node, Math.min(lowLinks.get(node),  lowLinks.get(targetNode)));
          }
          else if (onStack.has(targetNode)) {
            lowLinks.set(node, Math.min(lowLinks.get(node),  lowLinks.get(targetNode)));
          }
        });

        if (lowLinks.get(node) === assignment.get(node)) {
          // All items on Stack are in current component, all reachable from it and have backlinks
          var component = [];
          var stackNode;
          do {
            stackNode = stack.pop();
            component.push(stackNode);
            onStack.delete(stackNode);
          } while (stackNode !== node);
          results.push(component);
        }
      }
      debugAssert(stack.length === 0, "Stack is not empty");
      this.nodes.forEach(getStronglyConnectedComponent);
      return results;
    }
  }
}
