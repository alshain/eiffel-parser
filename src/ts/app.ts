/// <reference path="visitor.ts" />
/// <reference path="util.ts" />
/// <reference path="ast.ts" />
/// <reference path="fromJS.d.ts" />


module eiffel.app {
  export var debug = false;

  interface ModelSubscriber {
    (model: Model): void;
  }

  export class Model {
    constructor() {
      var workspace = new Workspace(this);
      this.workspaces.push(workspace);
      workspace.setActive();
      this.update();
      if (!debug) {
        this.start();
      }
      console.log(this);
    }

    isInitialized: boolean = false;
    loadingProgress: number = 0;


    subscribers: ModelSubscriber[] = [];
    activeWorkspace: Workspace;
    workspaces: Workspace[] = [];

    subscribe(f: ModelSubscriber): void {
      this.subscribers.push(f);
    }

    start() {
      var that = this;
      function parseUpdate(progress: number) {
        that.loadingProgress = progress;
        that.update();
      }

      function done() {
        that.isInitialized = true;
        that.update();
      }

      function error(e) {
        console.error("Error", e);
        that.isInitialized = true;
        that.update();
      }

      eiffel.semantics.start(parseUpdate, done, error);
    }

    update() {
      this.subscribers.forEach((f) => {
        f(this);
      });
    }

    /*
    save() {
      var state: any = {};
      state.workspaces = this.workspaces.map(x => x.save());
      state.activeWorkspace = state.workspaces.find(x => x.active);
      var request = window.indexedDB.open()
    }*/

  }

  export class Workspace {
    constructor(model:eiffel.app.Model) {
      this.model = model;
    }

    model: Model;
    active: boolean;
    analysis: eiffel.semantics.AnalysisResult;
    files: EiffelFile[] = [];

    analyze() {
      var astsArray = this.files.map((f) => {return {filename: f.filename, asts: f.asts}});
      this.analysis = eiffel.semantics.analyze(astsArray);
    }

    setActive() {
      if (this.model.activeWorkspace) {
        this.model.activeWorkspace.active = false;
      }

      this.model.activeWorkspace = this;
      this.active = false;
    }

    importFile(filename: string, content: string) {
      this.files.push(new EiffelFile(filename, content));
      this.model.update();
    }
  }

  export class EiffelFile {

    constructor(filename: string, content: string) {
      this.filename = filename;
      this.code = content;
    }

    filename: string;
    asts: eiffel.ast.Class[];
    error: boolean;
    code: string;
    onError: any;
    onParseSuccessful: any;

    timeout: any;
    parse() {
      try {
        this.asts = eiffel.parser.parse(this.code);
        console.info("Parsing successful: " + this.filename);
        this.onParseSuccessful && this.onParseSuccessful();
      }
      catch(e) {
        this.onError && this.onError(e.line, e.column, e);
        console.error("Parse error: ", e);
      }
    }

    updateCode(code: string) {
      this.code = code;
      clearTimeout(this.timeout);
      setTimeout(() => {
        this.parse();

      }, 500);
    }
  }

  export class EditorTab {

  }


}
