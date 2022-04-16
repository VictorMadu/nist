import { container as c } from "tsyringe";
import { Store, StoreImpl } from "./store";

export class InjectableStore {
  private static container = c;
  private static store: Store = new StoreImpl();

  static getContainer() {
    return InjectableStore.container;
  }

  static getStore() {
    return InjectableStore.store;
  }
}
