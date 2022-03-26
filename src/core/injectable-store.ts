import { IInjectableHandler } from "./interface/injectable-handler.interface";
import InjectableHandler from "./injectable-handler";
import { Constructor } from "../types";

// Storing all injectable together and creates a handler for each one of them;
export class InjectableStore {
  private static injectableHandlers = new Map<
    Constructor,
    IInjectableHandler
  >();

  static store(Injectable: Constructor) {
    if (!this.injectableHandlers.has(Injectable))
      this.injectableHandlers.set(Injectable, new InjectableHandler());
    return this;
  }

  static getInjectableHandler<T extends new (...args: any[]) => any>(
    Injectable: T
  ) {
    return this.injectableHandlers.get(Injectable);
  }
}

export default InjectableStore;
