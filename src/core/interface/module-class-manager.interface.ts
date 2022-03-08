import { Container } from "inversify";
import { IModule } from "./module.interface";

export interface IModuleManagerClass {
  new (): IModuleManager;
  setExportContainer: (container: Container) => void;
  getExportContainer: () => Container | undefined;
}

export interface IModuleManager {
  getInstance: () => IModule;
}
