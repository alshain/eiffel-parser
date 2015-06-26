/// <reference path="visitor.ts" />
/// <reference path="util.ts" />
/// <reference path="ast.ts" />
/// <reference path="fromJS.d.ts" />

module eiffel.explain {
  interface IntervalEntry {
    start: number;
    end: number;
    id: any;
  }
  export class RangeGatherer extends eiffel.ast.Visitor<eiffel.ast.AST, any> {
    constructor() {
      super();
      this.ranges = [];
    }

    ranges: IntervalEntry[];

    vDefault(ast:eiffel.ast.AST, parent: eiffel.ast.AST):any {
      if ("start" in ast && "end" in ast) {
        this.ranges.push({start: ast.start.offset, end: ast.end.offset, id: ast});
      }
      return super.vDefault(ast, ast);
    }
  }
}
