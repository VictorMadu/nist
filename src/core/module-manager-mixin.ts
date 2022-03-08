import { Container } from "inversify";
import { IModuleManagerClass } from "./interface/module-class-manager.interface";
import { IModuleClass } from "./interface/module.interface";

export function ModuleClassManagerMixin<T extends IModuleClass = any>(
  ModuleClass: T
): IModuleManagerClass {
  class ModuleManager {
    private static exportContainer: Container | undefined;
    private module = new ModuleClass();
    constructor() {}

    getInstance() {
      return this.module;
    }

    static setExportContainer(container: Container) {
      ModuleManager.exportContainer = container;
    }

    static getExportContainer() {
      return ModuleManager.exportContainer;
    }
  }

  return ModuleManager;
}
