import { Container } from "inversify";
import { Constructor } from "src/types";
import { IAdapter } from "./adapter.interface";
import { IController } from "./controller.interface";
import { IService } from "./service.interface";

export type IModule = {
  load: (
    serviceAdapter: IAdapter<IService>,
    controllerAdapter: IAdapter<IController>
  ) => Container;
};

export type IModuleClass = Constructor<IModule, never>;
