import { Container } from "inversify";
import * as _ from "lodash";
import { ConstructorReturnType } from "types";
import { InjectableStore } from "./injectable-store";
import {
  Constructor,
  IConfig,
  IModuleDeco,
  IModuleDecoConstructor,
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

      load(
        serviceAdapter: {
          attach: (serviceInstance: Record<string | symbol, Function>) => void;
        },
        controllerAdapter: {
          attach: (serviceInstance: Record<string | symbol, Function>) => void;
        }
      ) {
        const allImportContainers = _.map(
          allImportModuleClasses as IModuleDecoConstructor[],
          (ImportModuleClass) => {
            let moduleInstance = ModuleStore.getModuleInstance(
              ImportModuleClass
            );
            if (!moduleInstance) {
              moduleInstance = new ImportModuleClass();
              moduleInstance.load(serviceAdapter, controllerAdapter);
            }
            return moduleInstance.getExportContainer();
          }
        );
        const localServices = _.difference(allServices, exportServices);

        _.map(localServices, (localService) =>
          this.bindToContainer(this.localContainer, localService)
        );
        _.map(exportServices, (exportService) =>
          this.bindToContainer(this.exportContainer, exportService)
        );
        _.map(controllers, (controller) =>
          this.bindToContainer(this.controllerContainer, controller)
        );

        const mergedContainer = Container.merge(
          this.localContainer,
          this.exportContainer,
          this.controllerContainer,
          ...allImportContainers
        ) as Container;

        _.map(allServices, (service) =>
          serviceAdapter.attach(this.getFromContainer(mergedContainer, service))
        );
        _.map(controllers, (controller) =>
          controllerAdapter.attach(
            this.getFromContainer(mergedContainer, controller)
          )
        );

        return this.exportContainer;
      }

      getExportContainer(): Container {
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
    };
  };
}
