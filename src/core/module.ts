import { FastifyInstance } from "fastify";
import { Container } from "inversify";
import _ from "lodash";
import { ConstructorReturnType, Constructor } from "src/types";
import { getAllClassMethodsName, throwError } from "src/utils";
import {
  IControllerDecoConstructor,
  IServiceDecoConstructor,
  IClassWithKey,
  IController,
  IHandlerMetaData,
  IService,
} from "./interface";

interface IListeners {
  onReady: ((fastify: FastifyInstance) => void)[];
  onStart: (() => void)[];
  onClose: (() => void)[];
}

export type IConfig = {
  imports: ReturnType<ReturnType<typeof Module>>[];
  controllers: IControllerDecoConstructor[];
  services: IServiceDecoConstructor[];
  exports: IServiceDecoConstructor[];
};

interface IServiceAdapter {
  attachLifeCycleListener: (service: IService) => void;
}

interface IControllerAdapter {
  attachToRoute: (routeConfig: {}, baseConfig: { basePath: string }) => void;
}

export function Module(config: IConfig) {
  return function (
    Target: IControllerDecoConstructor | IServiceDecoConstructor
  ): any {
    return class Decorated extends Target {
      private localContainer: Container;
      private static exportContainer: Container;
      private controllerContainer: Container;

      constructor(
        private serviceAdapter: IServiceAdapter,
        private controllerAdapter: IControllerAdapter
      ) {
        super();
        this.localContainer = this.createContainer();
        Decorated.exportContainer = this.createContainer();
        this.controllerContainer = this.createContainer();
        this.loadAction();
      }

      // PUBLIC: The only public method
      static load(
        serviceAdapter: IServiceAdapter,
        controllerAdapter: IControllerAdapter
      ) {
        // if not localContainer or exportContainer or controllerContainer
        if (!Decorated.exportContainer)
          new Decorated(serviceAdapter, controllerAdapter);
        return Decorated.exportContainer;
      }

      private loadAction() {
        const importContainers = this.getImportContainers();
        this.bindInjectables(
          [this.getAllLocalServices(), this.localContainer],
          [config.exports, Decorated.exportContainer],
          [config.controllers, this.controllerContainer]
        );
        const mergedContainers = this.getMergedContainers(importContainers);
        this.loadServices(mergedContainers);
        this.loadControllers(mergedContainers);
      }

      private getMergedContainers(importContainers: Container[]) {
        return Container.merge(
          this.localContainer,
          Decorated.exportContainer,
          this.controllerContainer,
          ...importContainers
        ) as Container;
      }

      private getImportContainers(): Container[] {
        return _.map(config.imports, (importModules) =>
          importModules.load(this.serviceAdapter, this.controllerAdapter)
        );
      }

      private loadControllers(container: Container) {
        const resolvedControllers = _.map(config.controllers, (controller) =>
          this.getInstanceFromContainer(container, controller)
        );

        return _.map(resolvedControllers, (controller) => {
          const controllerMethodsName = getAllClassMethodsName(
            controller.constructor
          );
          return _.forEach(controllerMethodsName, (methodName) => {
            if (methodName === "$METADATA")
              return throwError(
                `methodName of controller ${controller} should not be used since it is a resevered key`
              );

            const handlerWithMetaData = controller[methodName];
            this.controllerAdapter.attachToRoute(
              {
                ...handlerWithMetaData.$METADATA,
                handler: this.getControllerHandlerFn(handlerWithMetaData),
              },
              { basePath: controller.$METADATA.basePath }
            );
            return;
          });
        });
      }

      private loadServices(container: Container) {
        return _.map(config.services, (service) => {
          const serviceInstance = this.getInstanceFromContainer(
            container,
            service
          );
          this.serviceAdapter.attachLifeCycleListener(serviceInstance);
        });
      }

      private getInstanceFromContainer<T extends IClassWithKey<Constructor>>(
        container: Container,
        Class: T
      ) {
        return container.get<ConstructorReturnType<T>>(Class.$KEY);
      }

      private getControllerHandlerFn(handlerWithMetaData: IController[string]) {
        const handlerFn = handlerWithMetaData;
        (handlerFn.$METADATA as IHandlerMetaData | undefined) = undefined;
        return handlerFn;
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
    };
  };
}
