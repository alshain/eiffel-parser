declare module eiffel.parser {
  function parse(input:string, options?:any): [eiffel.ast.Class];

  interface SyntaxError {
    line:number;
    column:number;
    offset:number;

    expected:any[];
    found:any;
    name:string;
    message:string;
  }
}

declare var __eiffel_builtin : BuiltinSource[];

interface BuiltinSource {
  filename: string;
  content: string;
}

interface Console {
  table: (any) => any;
}

declare var vees;
declare var okTests;
