import { Container } from "inversify";
import * as _ from "lodash";
import { Constructor, ConstructorReturnType } from "ts-util-types";
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
      private localContainer = new Container({ defaultScope: "Singleton" });
      private exportContainer = new Container({ defaultScope: "Singleton" });
      private controllerContainer = new Container({ defaultScope: "Singleton" });

      constructor() {
        ModuleStore.store(this);
      }

      public load(serviceAdapter: IServiceAdapter, controllerAdapter: IControllerAdapter) {
        console.log("\n\nOn Module", Target.name);
        const allImportContainers = _.map(
          allImportModuleClasses as IModuleDecoConstructor[],
          (Module) =>
            this.getImportedModuleExportContainers(Module, serviceAdapter, controllerAdapter)
        );
        console.log(
          "\nFinished loading imports for",
          Target.name,
          "with",
          allImportContainers.length,
          "imports"
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
          const serviceInstance = this.getFromContainer(mergedContainer, service);
          serviceAdapter.attach(serviceInstance);
        });

        _.forEach(controllers, (controller) => {
          const controllerInstance = this.getFromContainer(mergedContainer, controller);
          controllerAdapter.attach(controllerInstance);
        });

        return this.exportContainer;
      }

      public getExportContainer(): Container {
        return this.exportContainer.createChild();
      }

      private bindToContainer(
        container: Container,
        Target: { new (...args: any[]): Record<string | symbol, Function> }
      ) {
        console.log("binding", Target.name);
        container.bind(InjectableStore.getInjectableHandler(Target)!.getKey()).to(Target);
      }

      private getFromContainer(
        container: Container,
        Target: { new (...args: any[]): Record<string | symbol, Function> }
      ) {
        console.log("getting from binding", Target.name);
        try {
          return container.get<ConstructorReturnType<typeof Target>>(
            InjectableStore.getInjectableHandler(Target)!.getKey()
          );
        } catch (error) {
          const errMsg = `\nThis was thrown when binding \`${Target.name}\`. Check if you registered the class and all its dependencies`;
          throw new Error((error as Error).message + errMsg);
        }
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
