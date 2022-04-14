import { IInjectableHandler } from "./interface/injectable-handler.interface";
import InjectableHandler from "./injectable-handler";
import { Constructor } from "ts-util-types";

// Storing all injectable together and creates a handler for each one of them;
export class InjectableStore {
  private static injectableStore = new Map<Constructor, IInjectableHandler>();

  static store(Injectable: Constructor) {
    if (!this.injectableStore.has(Injectable))
      this.injectableStore.set(Injectable, new InjectableHandler());
    return this;
  }

  static getInjectableHandler<T extends new (...args: any[]) => any>(
    Injectable: T
  ) {
    return this.injectableStore.get(Injectable);
  }
}

export default InjectableStore;
