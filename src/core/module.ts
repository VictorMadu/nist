import { FastifyInstance } from "fastify";
import { Container } from "inversify";
import _ from "lodash";
import { ContainerHelper } from "../containerHelper";
import { ConstructorReturnType, Constructor } from "../types";
import { getAllClassMethodsName, throwError } from "../utils";
import { INJECTABLE_KEY } from "./constant";
import { ControllerLoader } from "./controller.loader";
import {
  IControllerDecoConstructor,
  IServiceDecoConstructor,
  IClassWithKey,
  IController,
  IHandlerMetaData,
  IService,
  IControllerAdapter,
  IServiceAdapter,
  IModuleClassManager,
  ILoader,
  IModule,
} from "./interface";
import { ModuleClassManagerMixin } from "./module-manager-mixin";
import { ServiceLoader } from "./service.loader";

interface IListeners {
  onReady: ((fastify: FastifyInstance) => void)[];
  onStart: (() => void)[];
  onClose: (() => void)[];
}

export type IConfig = {
  imports: Constructor[];
  controllers: Constructor[];
  services: Constructor[];
  exports: Constructor[];
};

type _IConfig = {
  imports: IModuleClassManager[];
  controllers: IControllerDecoConstructor[];
  services: IServiceDecoConstructor[];
  exports: IServiceDecoConstructor[];
};

export function Module(config: IConfig) {
  return function (Target: Constructor): { new (): IModuleClassManager } {
    class Decorated extends Target implements IModule {
      private localContainer: Container;
      private exportContainer: Container;
      private controllerContainer: Container;
      private containerHelper: ContainerHelper;

      constructor() {
        super();
        this.containerHelper = new ContainerHelper();
        this.localContainer = this.containerHelper.createContainer();
        this.exportContainer = this.containerHelper.createContainer();
        this.controllerContainer = this.containerHelper.createContainer();
      }

      load(
        serviceLoader: ILoader<IServiceDecoConstructor, IServiceAdapter>,
        controllerLoader: ILoader<
          IControllerDecoConstructor,
          IControllerAdapter
        >
      ) {
        const importContainers = this.getImportContainers(
          serviceLoader,
          controllerLoader
        );

        this.bindInjectables(
          [this.getAllLocalServices(), this.localContainer],
          [((config as any) as _IConfig).exports, this.exportContainer],
          [((config as any) as _IConfig).controllers, this.controllerContainer]
        );

        const mergedContainers = this.containerHelper.merge(
          this.localContainer,
          this.exportContainer,
          this.controllerContainer,
          ...importContainers
        );

        _.forEach(((config as any) as _IConfig).services, (Service) =>
          serviceLoader.load(mergedContainers, Service)
        );

        _.forEach(((config as any) as _IConfig).controllers, (Controller) =>
          controllerLoader.load(mergedContainers, Controller)
        );

        return this.exportContainer;
      }

      private getImportContainers(
        serviceLoader: ILoader<IServiceDecoConstructor, IServiceAdapter>,
        controllerLoader: ILoader<
          IControllerDecoConstructor,
          IControllerAdapter
        >
      ): Container[] {
        return _.map(((config as any) as _IConfig).imports, (importModule) =>
          this.getExportContainer(importModule, serviceLoader, controllerLoader)
        );
      }

      private getExportContainer(
        moduleManager: IModuleClassManager,
        serviceLoader: ILoader<IServiceDecoConstructor, IServiceAdapter>,
        controllerLoader: ILoader<
          IControllerDecoConstructor,
          IControllerAdapter
        >
      ) {
        if (moduleManager.getExportContainer()) {
          const moduleInstance = moduleManager.createModuleInstance();
          moduleManager.setExportContainer(
            moduleInstance.load(serviceLoader, controllerLoader)
          );
        }
        return moduleManager.getExportContainer() as Container;
      }

      private bindInjectables(
        ...injectablesAndContainers: [
          IControllerDecoConstructor[] | IServiceDecoConstructor[],
          Container
        ][]
      ) {
        for (let i = 0; i < injectablesAndContainers.length; ++i) {
          const [injectables, container] = injectablesAndContainers[i];
          for (let j = 0; j < injectables.length; ++j) {
            this.containerHelper.bind(container, injectables[j]);
          }
        }
      }

      private getAllLocalServices() {
        return _.difference(
          ((config as any) as _IConfig).services,
          ((config as any) as _IConfig).exports
        );
      }
    }

    return ModuleClassManagerMixin(Decorated);
  };
}
