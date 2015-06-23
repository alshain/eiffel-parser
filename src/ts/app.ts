/// <reference path="visitor.ts" />
/// <reference path="util.ts" />
/// <reference path="ast.ts" />
/// <reference path="fromJS.d.ts" />


module eiffel.app {


  interface ModelSubscriber {
    (model: Model): void;
  }

  export class Model {
    constructor() {
      this.update();
      this.start();
    }

    isInitialized: boolean = false;
    loadingProgress: number = 0;


    subscribers: ModelSubscriber[] = [];

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

  }

  export class EditorTab {

  }


}
