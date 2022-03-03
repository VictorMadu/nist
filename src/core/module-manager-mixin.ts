import { Container } from "inversify";
import {
  IControllerAdapter,
  IModuleClass,
  IModuleClassManager,
  IServiceAdapter,
} from "./interface";

export function ModuleClassManagerMixin<T extends IModuleClass = any>(
  ModuleClass: T
): { new (): IModuleClassManager } {
  return class {
    private exportContainer: Container | undefined;
    constructor() {}

    createModuleInstance() {
      return new ModuleClass();
    }

    setExportContainer(container: Container) {
      this.exportContainer = container;
    }

    getExportContainer() {
      return this.exportContainer;
    }
  };
}
