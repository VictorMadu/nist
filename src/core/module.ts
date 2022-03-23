import { FastifyInstance } from "fastify";
import { Container } from "inversify";
import _ from "lodash";
import { ContainerHelper } from "./containerHelper";
import { Constructor } from "../types";
import { IAdapter } from "./interface/adapter.interface";
import {
  IController,
  IControllerClass,
} from "./interface/controller.interface";
import { IModuleManagerClass } from "./interface/module-class-manager.interface";
import { IModule } from "./interface/module.interface";
import { IService, IServiceClass } from "./interface/service.interface";
import { ModuleClassManagerMixin } from "./module-manager-mixin";
import { IBaseClass, InjectableClass } from "./interface/injectable.interface";
import { getAllClassMethodsName } from "../utils";

export type IConfig = {
  imports: Constructor[];
  controllers: Constructor[];
  services: Constructor[];
  exports: Constructor[];
};

type _IConfig = {
  imports: IModuleManagerClass[];
  controllers: IControllerClass[];
  services: IServiceClass[];
  exports: IServiceClass[];
};

export function Module(config: IConfig) {
  return function (Target: Constructor): IModuleManagerClass {
    class Decorated extends Target implements IModule {
      private localContainer: Container;
      private exportContainer: Container;
      private controllerContainer: Container;
      private containerHelper: ContainerHelper;

      constructor() {
        super();
        this.setDefaultConfig(config);
        this.containerHelper = new ContainerHelper();
        this.localContainer = this.containerHelper.createContainer();
        this.exportContainer = this.containerHelper.createContainer();
        this.controllerContainer = this.containerHelper.createContainer();
      }

      load(
        serviceAdapter: IAdapter<IService>,
        controllerAdapter: IAdapter<IController>
      ) {
        const importContainers = this.getImportContainers(
          serviceAdapter,
          controllerAdapter
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

        const attachToAdapterPartialFn = <T extends IAdapter>(
          Classes: any,
          adapter: T
        ) => this.attachToAdapter(mergedContainers, Classes, adapter);

        attachToAdapterPartialFn(config.services, serviceAdapter);
        attachToAdapterPartialFn(config.controllers, controllerAdapter);

        return this.exportContainer;
      }

      private setDefaultConfig(config: IConfig) {
        config.imports = config.imports ?? [];
        config.services = config.services ?? [];
        config.controllers = config.controllers ?? [];
        config.exports = config.exports ?? [];
      }

      private getImportContainers(
        serviceAdapter: IAdapter<IService>,
        controllerAdapter: IAdapter<IController>
      ): Container[] {
        return _.map(((config as any) as _IConfig).imports, (importModule) =>
          this.getExportContainer(
            importModule,
            serviceAdapter,
            controllerAdapter
          )
        );
      }

      private getExportContainer(
        ModuleManager: IModuleManagerClass,
        serviceAdapter: IAdapter<IService>,
        controllerAdapter: IAdapter<IController>
      ) {
        if (!ModuleManager.getExportContainer()) {
          const moduleInstance = new ModuleManager().getInstance();
          ModuleManager.setExportContainer(
            moduleInstance.load(serviceAdapter, controllerAdapter)
          );
        }
        return ModuleManager.getExportContainer() as Container;
      }

      private attachToAdapter(
        container: Container,
        Classes: InjectableClass[],
        adapter: IAdapter
      ) {
        _.forEach(Classes, (Class) => {
          const instance = this.containerHelper.get(container, Class);
          adapter.attach(instance);
        });
      }

      private bindInjectables(
        ...injectablesAndContainers: [
          IControllerClass[] | IServiceClass[],
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
