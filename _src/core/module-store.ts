import {
  IModuleDeco,
  IModuleDecoConstructor,
} from "./interface/module.interface";

export class ModuleStore {
  private static storeObj = new Map<IModuleDecoConstructor, IModuleDeco>();

  public static store(module: IModuleDeco) {
    this.storeObj.set(module.constructor as IModuleDecoConstructor, module);
  }

  public static getModuleInstance(moduleClass: IModuleDecoConstructor) {
    return this.storeObj.get(moduleClass);
  }
}

export default ModuleStore;
