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

  export interface GraphOptions {
    autoAdd?: boolean;
  }

  export class Graph<N> {
    edges: Map<N, Set<N>>;
    incomingEdges: Map<N, Set<N>>;
    nodes: Set<N>;
    autoAdd: boolean;

    constructor(nodes: N[], options?: GraphOptions) {
      this.nodes = new Set<N>();
      this.edges = new Map<N, Set<N>>();
      if (options instanceof Object && options.hasOwnProperty("autoAdd")) {
        this.autoAdd = options.autoAdd;
      }

      nodes.forEach(function (node) {
        debugAssert(!this.nodes.has(node), "Duplicate node in graph");
        this.nodes.add(node);
      }, this);
    }

    addNode(node: N, ignoreDuplicate: boolean = true): Graph<N> {
      if (!ignoreDuplicate) {
        debugAssert(!this.nodes.has(node), "Adding node that is already in graph");
      }
      this.nodes.add(node);
      return this;
    }

    connect(from: N, to: N, debugDuplicate: boolean = false) {
      debugAssert(from !== null && from !== undefined, "First argument is null or undefiined");
      debugAssert(to !== null && to !== undefined, "Second argument is null or undefiined");
      if (this.autoAdd) {
        if (!this.nodes.has(from)) {
          this.addNode(from);
        }
        if (!this.nodes.has(to)) {
          this.addNode(to);
        }
      }
      else {
        debugAssert(this.nodes.has(from), "Cannot work with nodes that aren't in graph");
        debugAssert(this.nodes.has(to), "Cannot work with nodes that aren't in graph");
      }

      debugAssert(from !== to, "self-cycles are not supported");

      var edges = this.edgesFor(from);
      if (debugDuplicate && edges.has(to)) {
        debugAssert(true, "Edge already exists in graph");
      }
      var incomingEdges = this.edgesTo(to);

      edges.add(to);
      incomingEdges.add(from);

      return this;
    }

    disconnect(from: N, to: N, debugMissing: boolean = false) {
      debugAssert(from !== null && from !== undefined, "First argument is null or undefiined");
      debugAssert(to !== null && to !== undefined, "Second argument is null or undefiined");
      if (this.autoAdd) {
        if (!this.nodes.has(from)) {
          this.addNode(from);
        }
        if (!this.nodes.has(to)) {
          this.addNode(to);
        }
      }
      else {
        debugAssert(this.nodes.has(from), "Cannot work with nodes that aren't in graph");
        debugAssert(this.nodes.has(to), "Cannot work with nodes that aren't in graph");
      }

      debugAssert(from !== to, "self-cycles are not supported");

      var edges = this.edgesFor(from);
      if (debugMissing && !edges.has(to)) {
        debugAssert(true, "Edge to be removed does not exist");
      }
      var incomingEdges = this.edgesTo(to);

      edges.delete(to);
      incomingEdges.delete(from);

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

    edgesTo(node: N) {
      debugAssert(this.nodes.has(node), "Node is not in graph");
      if (!this.incomingEdges.has(node)) {
        this.incomingEdges.set(node, new Set<N>());
      }
      return this.incomingEdges.get(node);
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

          assignment.set(node, index);
          lowLinks.set(node, index);
          index++;
        }

        var edges = graph.edgesFor(node);
        edges.forEach(function (targetNode) {
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

  export function mapToArray<K, V>(map: Map<K, V>): V[] {
    var result = [];
    map.forEach(x => result.push(x));
    return result;
  }

  export function exactlyOne(...xs: boolean[]): boolean {
    var one = false;
    var moreThanOne = false;
    xs.forEach(x => {
      if (x && !one) {
        one = true;
      }
      else if (x && one) {
        moreThanOne = true;
      }
    });

    if (moreThanOne) {
      return false;
    }
    return one;
  }

  export class ExecutionEdge<N, E> {
    constructor(label: string, data: E, fromNode, toNode) {
      this.fromNode = fromNode;
      this.toNode = toNode;

      this.fromIndex = fromNode.edgesOut.length;
      this.toIndex = toNode.edgesIn.length;

      fromNode.edgesOut.push(this);
      toNode.edgesIn.push(this);

      this.label = label;
      this.data = data;
    }


    label: string;
    data: E;

    fromIndex: number;
    toIndex: number;

    fromNode: ExecutionNode<N, E>;
    toNode: ExecutionNode<N, E>;
  }

  export class ExecutionNode<N, E> {
    edgesOut: ExecutionEdge<N, E>[] = [];
    edgesIn: ExecutionEdge<N, E>[] = [];
    belongingGraph: ExecutionGraph<N, E>;
    subGraph: ExecutionGraph<N, E>;
    data: N;

    connectTo(to: ExecutionNode<N, E>, label: string, data: E) {
      new ExecutionEdge<N, E>(label, data, this, to);
      return to;
    }

    connectNew(data: N, label: string, edgeData: E);
  }

  export class ExecutionGraph<N, E> {
    entryPoint: ExecutionNode<N>;
  }
}
