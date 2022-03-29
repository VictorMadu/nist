import { Container } from "inversify";
import * as _ from "lodash";
import { Constructor, ConstructorReturnType } from "../types";
import { InjectableStore } from "./injectable-store";
import {
  IConfig,
  IControllerAdapter,
  IModuleDeco,
  IModuleDecoConstructor,
  IServiceAdapter,
} from "./interface/module.interface";
import ModuleStore from "./module-store";

export function Module({
  imports: allImportModuleClasses = [],
  controllers = [],
  services: allServices = [],
  exports: exportServices = [],
}: Partial<IConfig>) {
  return function (Target: Constructor): IModuleDecoConstructor {
    return class ModuleDeco implements IModuleDeco {
      private localContainer = new Container();
      private exportContainer = new Container();
      private controllerContainer = new Container();

      constructor() {
        ModuleStore.store(this);
      }

      public load(
        serviceAdapter: IServiceAdapter,
        controllerAdapter: IControllerAdapter
      ) {
        const allImportContainers = _.map(
          allImportModuleClasses as IModuleDecoConstructor[],
          (Module) =>
            this.getImportedModuleExportContainers(
              Module,
              serviceAdapter,
              controllerAdapter
            )
        );
        const localServices = _.difference(allServices, exportServices);

        _.forEach(localServices, (localService) =>
          this.bindToContainer(this.localContainer, localService)
        );
        _.forEach(exportServices, (exportService) =>
          this.bindToContainer(this.exportContainer, exportService)
        );
        _.forEach(controllers, (controller) =>
          this.bindToContainer(this.controllerContainer, controller)
        );

        const mergedContainer = Container.merge(
          this.localContainer,
          this.exportContainer,
          this.controllerContainer,
          ...allImportContainers
        ) as Container;

        _.forEach(allServices, (service) => {
          const serviceInstance = this.getFromContainer(
            mergedContainer,
            service
          );
          serviceAdapter.attach(serviceInstance);
        });

        _.forEach(controllers, (controller) => {
          const controllerInstance = this.getFromContainer(
            mergedContainer,
            controller
          );
          controllerAdapter.attach(controllerInstance);
        });

        return this.exportContainer;
      }

      public getExportContainer(): Container {
        return this.exportContainer;
      }

      private bindToContainer(
        container: Container,
        Target: { new (...args: any[]): Record<string | symbol, Function> }
      ) {
        container
          .bind(InjectableStore.getInjectableHandler(Target)!.getKey())
          .to(Target);
      }

      private getFromContainer(
        container: Container,
        Target: { new (...args: any[]): Record<string | symbol, Function> }
      ) {
        return container.get<ConstructorReturnType<typeof Target>>(
          InjectableStore.getInjectableHandler(Target)!.getKey()
        );
      }

      private getImportedModuleExportContainers(
        Module: IModuleDecoConstructor,
        serviceAdapter: IServiceAdapter,
        controllerAdapter: IControllerAdapter
      ) {
        let moduleInstance = ModuleStore.getModuleInstance(Module);
        if (!moduleInstance) {
          moduleInstance = new Module();
          moduleInstance.load(serviceAdapter, controllerAdapter);
        }
        return moduleInstance.getExportContainer();
      }
    };
  };
}

export default Module;
