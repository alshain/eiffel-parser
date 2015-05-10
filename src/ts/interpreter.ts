module eiffel.interpreter {
  import LookupTable = eiffel.util.LookupTable;
  export class Interpreter {
      constructor(rootClass: string, rootFeature: string) {

      }
  }

  export class EObject {
    sym: eiffel.symbols.ClassSymbol;
    data: LookupTable<EObject> = new Map<string, EObject>();
  }
/*
  export interface EObject {
    sym: eiffel.symbols.ClassSymbol;
    data: (String) => EObject;
    accept: (Message) => EObject;
    messageProcessor: MessageProcessor;
    repr(): String;
  }*/

  export interface Message {
    name: String;
    parameters: EObject[];
  }

  export interface Stack {

  }

  export class StackEntry {
    object: EObject;
    routine: eiffel.symbols.RoutineSymbol;
    context: eiffel.interpreter.Context;
  }

  export class Context {
      constructor(obj: EObject, routine: eiffel.symbols.RoutineSymbol) {

      }
  }

  export interface MessageProcessor {
    process(target: EObject, message: Message);
  }

  export class IntObject implements EObject {
    sym:eiffel.symbols.ClassSymbol;

    data: LookupTable<eiffel.interpreter.EObject>;

    repr():String {
      return undefined;
    }
    value: number;
  }

  export class BuiltinProcessor {

  }
}
