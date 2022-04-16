import { InjectableStore } from "./injectable-store";
import { Constructor, Func } from "ts-util-types";
import { ClassMetadata } from "./class-metadata";
import { Store } from "./store";

export type ControllerInstance = Record<string | symbol, Func>;

export abstract class ControllerAdapter {
  private store = InjectableStore.getStore();
  private container = InjectableStore.getContainer();

  protected abstract attach(httpInstance: ControllerInstance, metadata: ClassMetadata): void;
  protected abstract getMetadata(store: Store, controllerClass: Constructor): ClassMetadata;
  protected abstract getControllers(store: Store): IterableIterator<Constructor>;

  resolve() {
    const controllerClasses = this.getControllers(this.store);
    let controllerClass: Constructor | undefined;
    while ((controllerClass = controllerClasses.next().value)) {
      this.resolveController(controllerClass);
    }
  }

  private resolveController(controller: Constructor) {
    const httpInstance = this.container.resolve(controller) as ControllerInstance;
    const instanceMetadata = this.getMetadata(this.store, controller);
    this.attach(httpInstance, instanceMetadata);
  }
}
