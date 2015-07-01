/// <reference path="visitor.ts" />
/// <reference path="util.ts" />
/// <reference path="ast.ts" />
/// <reference path="explain.ts" />
/// <reference path="fromJS.d.ts" />
declare var sTree;

module eiffel.app {
  export var debug = true;

  interface ModelSubscriber {
    (model: Model): void;
  }

  export class Model {
    constructor() {
      this.addWorkspace();
      if (!debug) {
        this.start();
      }
      else {
        this.finishInitialization();
      }
    }

    nextWorkspaceId: number = 0;

    isInitialized: boolean = false;
    loadingProgress: number = 0;

    onInitialized = new OneOffEvent("onInitialized");


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
        that.finishInitialization();
      }

      function error(e) {
        console.error("Error", e);
        that.finishInitialization();
      }

      eiffel.semantics.start(parseUpdate, done, error);
    }

    addWorkspace() {
      var workspace = new Workspace(this, this.nextWorkspaceId);
      this.workspaces.push(workspace);
      workspace.setActive();
      this.update();
      this.nextWorkspaceId++;
    }

    deleteWorkspace() {
      var currentIndex = this.workspaces.indexOf(this.activeWorkspace);
      if (currentIndex === -1) {
        console.error("Active workspace not found in array");
        debugger;
      }
      this.workspaces.splice(currentIndex, 1);
      if (currentIndex > 0) {
        this.workspaces[currentIndex - 1].setActive();
      }
      else if (currentIndex === 0 && this.workspaces.length >= 1) {
        this.workspaces[currentIndex].setActive();
      }
      else if (this.workspaces.length === 0) {
        this.addWorkspace();
      }
    }

    private finishInitialization() {
      this.isInitialized = true;
      this.onInitialized.trigger();
      this.update();
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
    constructor(model:eiffel.app.Model, reactKey: number) {
      this.model = model;
      this.reactKey = reactKey;
    }

    reactKey: number;
    model: Model;
    active: boolean;
    analysis: eiffel.semantics.AnalysisResult;
    files: EiffelFile[] = [];
    hasError: boolean;
    hasParseError: boolean;
    errorMessage: string = "";
    nextFileId: number = 0;
    activeFile: EiffelFile;

    analyze() {
      var astsArray = this.files.map((f) => {return {filename: f.getFilename(), asts: f.asts}});
      this.analysis = eiffel.semantics.analyze(astsArray);
    }

    setActive() {
      if (this.model.activeWorkspace) {
        this.model.activeWorkspace.active = false;
      }

      this.model.activeWorkspace = this;
      this.active = true;
      this.model.update();
    }

    importFile(filename: string, content: string) {
      var file = new EiffelFile(filename, content, this.nextFileId, this);
      this.nextFileId++;
      this.addFile(file);
    }

    addFile(file) {
      this.files.push(file);

      if (this.files.length === 1) {
        this.activeFile = file;
        file.isActive = true;
      }

      file.onError.subscribe(() => {
        this.hasError = true;
        this.model.update();
      });

      file.onParseSuccessful.subscribe(() => {
        this.hasError = this.files.some(f => f.hasError);
        if (!this.hasError) {
          this.hasError = false;
          //this.analyze();
        }
        this.model.update();
      });
      this.model.update();
    }

    addEmptyFile() {
      var file = new EiffelFile(null, "", this.nextFileId, this);
      this.nextFileId++;
      this.addFile(file);
    }

    removeFile(file: EiffelFile) {
      var index = this.files.indexOf(file);
      if (index === -1) {
        console.error("Requested deletion of unmanaged file", file);
        if (eiffel.app.debug) {
          debugger;
        }

        return false;
      }
      else {
        this.files.splice(index, 1);

        return true;
      }
    }
  }

  export class EiffelFile {
    constructor(filename: string, content: string, reactKey: number, workspace: Workspace) {
      this.filename = filename;
      this.dynamicFilename = undefined;
      this.code = content;
      this.reactKey = reactKey;
      this.workspace = workspace;
      this.onActivate.subscribe(() => {
        if (this.workspace.activeFile) {
          console.log("set active file to", this.getFilename());
          this.workspace.activeFile.isActive = false;
        }
        this.isActive = true;
        this.workspace.activeFile = this;

        setTimeout(() => this.codeMirror.refresh(), 100);
      });

      var displayAstHint = () => {
        if (this.hasError) {
          this.astHierarchy = undefined;
          this.onAstHierarchyChange.trigger(undefined);
        }
        else if (this.astMapping === null) {
          // This means we have an empty file
        }
        else {
          function sortIntervalsByLengthDescending(i_a, i_b) {
            var lengthA = i_a.end - i_a.start;
            var lengthB = i_b.end - i_b.start;
            return lengthB - lengthA;
          }
          var astMapping = this.astMapping;
          var offset = this.codeMirror.indexFromPos(this.codeMirror.getCursor());
          astMapping.query({point: offset}, (interval) => {

            // sort by length and get data, i.e. corresponding AST node
            var sorted = interval.sort(sortIntervalsByLengthDescending).map(x => x.data);
            if (this.differentAstHierarchies(this.astHierarchy, sorted)) {
              this.astHierarchy = sorted;
              this.onAstHierarchyChange.trigger(sorted);
              console.log(sorted);
            }
          });
          //sTree.matches(astMapping, )
        }
      };

      this.onParseSuccessful.subscribe((_, asts) => {
        var ranges = new eiffel.explain.RangeGatherer();
        asts.map(ast => ast.accept(ranges, null));
        if(ranges.ranges.length > 0) {
          var segmentTree = null;
          sTree(function(tree) {
            segmentTree = tree;
            ranges.ranges.forEach((range) => {
              tree.push(range.start, range.end, range.id);
            });
            tree.build();
          });
          this.astMapping = segmentTree;
          console.log(this.astMapping);
        }
        else {
          this.astMapping = null;
        }

        displayAstHint();
      });

      this.onError.subscribe(() => {
        this.astMapping = undefined;
        displayAstHint();
      });

      this.onSetCodeMirror.subscribe(() => {
        this.codeMirror.on("cursorActivity", displayAstHint);
      });
    }

    differentAstHierarchies(one, other) {
      if (one === other) {
        return false;
      }
      if (!!one !== !!other) {
        // Exactly one is null or undefined
        return true;
      }
      // both are not null or undefined
      if (one.length === other.length) {
        for (var i = 0; i < other.length; i++) {
          var obj = other[i];
          if (obj === one[i]) {
            continue;
          }
          else {
            return true;
          }
        }
        return false;
      }
      else {
        return true;
      }
    }

    getFilename() {
      var unnamedFilename = "Unnamed File " + (this.reactKey + 1);
      if (this.filename) {
        return this.filename;
      }
      else {
        if (this.hasError) {
          if (this.dynamicFilename) {
            return this.dynamicFilename;
          }
          else {
            return unnamedFilename;
          }
        }
        else if (this.asts && this.asts.length >= 1) {
          this.dynamicFilename = this.asts[0].name.name + ".e";
          return this.dynamicFilename;
        }
        else {
          return unnamedFilename;
        }
      }
    }

    private filename: string;
    private dynamicFilename: string;
    reactKey: number;
    asts: eiffel.ast.Class[];
    hasError: boolean;
    code: string;
    onError: Event = new Event("Editor.onParseError");
    onParseSuccessful: Event = new Event("Editor.onParseSuccessful");
    onSetCodeMirror: OneOffEvent = new OneOffEvent("Editor.onSetCodeMirror");
    onAstHierarchyChange: Event = new Event("Editor.onAstHierarchyChange");
    isActive: boolean;
    codeMirror: any;
    astMapping: any;
    workspace: Workspace;

    astHierarchy: eiffel.ast.AST[];

    timeout: any;
    parse() {
      try {
        this.asts = eiffel.parser.parse(this.code);
        console.info("Parsing successful: " + this.filename);
        this.hasError = false;
        this.onParseSuccessful.trigger(this, this.asts);
      }
      catch(e) {
        if (!this.hasError) {
          setTimeout(() => this.codeMirror.refresh(), 100);
        }
        this.hasError = true;
        this.onError.trigger(e.line, e.column, e);
        console.error("Parse error: ", e);
      }
    }

    updateCode(code: string) {
      var parseDelayInMs = 300;
      this.code = code;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.parse();

      }, parseDelayInMs);
    }

    onActivate: Event = new Event("onActivate");


  }

  export class EditorTab {

  }

  export class Event {
    constructor(name:string) {
      this.name = name;
    }

    debugFlag: boolean;
    name: string;
    subscribed: Set<any> = new Set<any>();
    subscribe(f) {
      this.subscribed.add(f);
    }

    trigger(...data) {
      if (this.debugFlag) {
        console.debug("Triggering: " + this.name + " with data ", data);
        debugger;
      }
      this.subscribed.forEach(f => {
        if (this.debugFlag) {
          console.debug("Executing callback: ", f);
          debugger;
        }
        f.apply(window, data);
      });
    }

    unsubscribe(f) {
      this.subscribed.delete(f);
    }

    debug(falseForDisable) {
      if (falseForDisable === false) {
        this.debugFlag = false;
      }
      else {
        this.debugFlag = true;
      }
    }
  }

  export class OneOffEvent extends Event {
    executed: boolean = false;
    executedData: any = undefined;

    trigger(data?) {
      if (this.executed) {
        console.error("Invalid state: Event already triggered");
        debugger;
      }
      else {
        // do this before triggering, maybe prevent race conditions?
        this.executedData = data;
        this.executed = true;
        super.trigger(data);
      }
    }

    subscribe(f) {
      if (this.executed) {
        f(this.executedData);
      }
      else {
        super.subscribe(f);
      }
    }

    reset() {
      this.executed = false;
      this.executedData = undefined;
    }
  }


}
