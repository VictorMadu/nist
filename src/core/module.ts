import { FastifyInstance } from "fastify";
import { Container } from "inversify";
import _ from "lodash";
import { ConstructorReturnType, Constructor } from "../types";
import { getAllClassMethodsName, throwError } from "../utils";
import {
  IControllerDecoConstructor,
  IServiceDecoConstructor,
  IClassWithKey,
  IController,
  IHandlerMetaData,
  IService,
  IControllerAdapter,
  IServiceAdapter,
} from "./interface";

interface IListeners {
  onReady: ((fastify: FastifyInstance) => void)[];
  onStart: (() => void)[];
  onClose: (() => void)[];
}

export type IConfig = {
  imports: ModuleClassManager[];
  controllers: IControllerDecoConstructor[];
  services: IServiceDecoConstructor[];
  exports: IServiceDecoConstructor[];
};

export type IModuleClass = {
  new (
    serviceAdapter: IServiceAdapter,
    controllerAdapter: IControllerAdapter
  ): { load: () => Container };
};

export function Module(config: IConfig) {
  return function (Target: { new (...args: any[]): any }): ModuleClassManager {
    class Decorated extends Target {
      private localContainer: Container;
      private exportContainer: Container;
      private controllerContainer: Container;

      constructor(
        private serviceAdapter: IServiceAdapter,
        private controllerAdapter: IControllerAdapter
      ) {
        super();
        this.localContainer = this.createContainer();
        this.exportContainer = this.createContainer();
        this.controllerContainer = this.createContainer();
      }

      load() {
        const importContainers = this.getImportContainers();
        this.bindInjectables(
          [this.getAllLocalServices(), this.localContainer],
          [config.exports, this.exportContainer],
          [config.controllers, this.controllerContainer]
        );
        const mergedContainers = this.getMergedContainers(importContainers);
        this.loadServices(mergedContainers);
        this.loadControllers(mergedContainers);

        return this.exportContainer;
      }

      private getMergedContainers(importContainers: Container[]) {
        return Container.merge(
          this.localContainer,
          this.exportContainer,
          this.controllerContainer,
          ...importContainers
        ) as Container;
      }

      private getImportContainers(): Container[] {
        return _.map(config.imports, (importModule) =>
          getExportContainer(importModule)(
            this.serviceAdapter,
            this.controllerAdapter
          )
        );
      }

      private loadControllers(container: Container) {
        const controllerLoader = new ControllerLoader(
          container,
          this.controllerAdapter
        );

        _.forEach(config.controllers, (controller) =>
          controllerLoader.load(controller)
        );
      }

      private loadServices(container: Container) {
        const serviceLoader = new ServiceLoader(container, this.serviceAdapter);

        return _.forEach(config.services, (service) =>
          serviceLoader.load(service)
        );
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
            const injectable = injectables[j];
            container.bind(injectable.$KEY).to(injectable);
          }
        }
      }

      private getAllLocalServices() {
        return _.difference(config.services, config.exports);
      }

      private createContainer() {
        return new Container({ defaultScope: "Singleton" });
      }
    }

    return new ModuleClassManager(Decorated);
  };
}

export const getExportContainer = (moduleManager: ModuleClassManager) => (
  serviceAdapter: IServiceAdapter,
  controllerAdapter: IControllerAdapter
) => {
  if (moduleManager.getExportContainer()) {
    const moduleInstance = moduleManager.createModuleInstance(
      serviceAdapter,
      controllerAdapter
    );
    moduleManager.setExportContainer(moduleInstance.load());
  }
  return moduleManager.getExportContainer() as Container;
};

export class ServiceLoader<
  T extends IServiceDecoConstructor = IServiceDecoConstructor
> {
  constructor(
    private container: Container,
    private serviceAdapter: IServiceAdapter
  ) {}
  load(service: T) {
    const serviceInstance = this.container.get<ConstructorReturnType<T>>(
      service
    );
    this.serviceAdapter.attachLifeCycleListener(serviceInstance);
  }
}

export class ControllerLoader<
  T extends IControllerDecoConstructor = IControllerDecoConstructor
> {
  constructor(
    private container: Container,
    private controllerAdapter: IControllerAdapter
  ) {}

  load(controller: T) {
    const controllerInstance = this.container.get<ConstructorReturnType<T>>(
      controller
    );
    const controllerMethodsName = getAllClassMethodsName(
      controllerInstance.constructor
    );

    _.forEach(controllerMethodsName, (methodName) =>
      this.attachToRoute(controllerInstance, methodName)
    );
  }

  private attachToRoute(
    controllerInstance: ConstructorReturnType<T>,
    methodName: string
  ) {
    if (methodName === "$METADATA")
      return throwError(
        `methodName of controller ${controllerInstance} should not be used since it is a resevered key`
      );

    const handlerWithMetaData = controllerInstance[
      methodName
    ] as ConstructorReturnType<T>[string];
    this.controllerAdapter.attachToRoute(
      {
        ...handlerWithMetaData.$METADATA,
        handler: this.cleanHandler(handlerWithMetaData),
      },
      { basePath: controllerInstance.$METADATA.basePath }
    );
    return;
  }

  private cleanHandler(handler: ConstructorReturnType<T>[string]) {
    const cleanedHandler = handler;
    (cleanedHandler.$METADATA as IHandlerMetaData | undefined) = undefined;
    return cleanedHandler;
  }
}

export class ModuleClassManager<T extends IModuleClass = any> {
  private exportContainer: Container | undefined;
  constructor(private ModuleClass: T) {}

  createModuleInstance(
    serviceAdapter: IServiceAdapter,
    controllerAdapter: IControllerAdapter
  ) {
    return new this.ModuleClass(serviceAdapter, controllerAdapter);
  }

  setExportContainer(container: Container) {
    this.exportContainer = container;
  }

  getExportContainer() {
    return this.exportContainer;
  }
}
