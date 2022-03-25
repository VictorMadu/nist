import { Container } from "inversify";

export interface IModuleDeco {
  load(
    serviceAdapter: {
      attach: (serviceInstance: Record<string | symbol, Function>) => void;
    },
    controllerAdapter: {
      attach: (controllerInstance: Record<string | symbol, Function>) => void;
    }
  ): Container;

  getExportContainer(): Container;
}

export type IModuleDecoConstructor = { new (): IModuleDeco };

export interface IConfig {
  imports: { new (...args: any[]): any }[];
  controllers: { new (...args: any[]): any }[];
  services: { new (...args: any[]): any }[];
  exports: { new (...args: any[]): any }[];
}
