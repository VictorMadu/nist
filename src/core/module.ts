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
} from "./interface";

export type IConfig = {
  imports: ReturnType<ReturnType<typeof Module>>[];
  controllers: IControllerDecoConstructor[];
  services: IServiceDecoConstructor[];
  exports: IServiceDecoConstructor[];
};

export function Module(config: IConfig) {
  return function (
    Target: IControllerDecoConstructor | IServiceDecoConstructor
  ): { load: (fastify: FastifyInstance) => Container } {
    return class Decorated extends Target {
      private static localContainer: Container;
      private static exportContainer: Container;
      private static controllerContainer: Container;
      constructor(fastify: FastifyInstance) {
        super();
        Decorated.localContainer = this.createContainer();
        Decorated.exportContainer = this.createContainer();
        Decorated.controllerContainer = this.createContainer();
        this.loadAction(fastify);
      }

      // PUBLIC: The only public method
      static load(fastify: FastifyInstance) {
        // if not localContainer or exportContainer or controllerContainer
        if (!Decorated.exportContainer) new Decorated(fastify);
        return Decorated.exportContainer;
      }

      private loadAction(fastify: FastifyInstance) {
        this.loadImportModules(fastify);
        this.bindInjectables(
          [this.getAllLocalServices(), Decorated.localContainer],
          [config.exports, Decorated.exportContainer],
          [config.controllers, Decorated.controllerContainer]
        );
        this.loadServices(fastify);
        this.loadControllers(fastify);
      }

      private loadImportModules(fastify: FastifyInstance) {
        _.forEach(config.imports, (importModules) => {
          importModules.load(fastify);
        });
      }

      private loadControllers(fastify: FastifyInstance) {
        const resolvedControllers = _.map(config.controllers, (controller) =>
          this.getInstanceFromContainer(
            this.getMergedContainer(fastify, true),
            controller
          )
        );

        return _.map(resolvedControllers, (controller) => {
          const controllerMethodsName = getAllClassMethodsName(
            controller.constructor
          );
          return _.map(controllerMethodsName, (methodName) =>
            this.registerControllerHandler(fastify, controller, methodName)
          );
        });
      }

      private loadServices(fastify: FastifyInstance) {
        const container = this.getMergedContainer(fastify);
        return _.map(config.services, (service) => {
          const serviceInstance = this.getInstanceFromContainer(
            container,
            service
          );

          this.attachLifeCycleListeners(fastify, serviceInstance);
        });
      }

      private attachLifeCycleListeners(
        fastify: FastifyInstance,
        service: ConstructorReturnType<IServiceDecoConstructor>
      ) {
        this.attachRegisterListener(fastify, service);
        this.attachReadyListener(fastify, service);
        this.attachCloseListener(fastify, service);
      }

      private attachRegisterListener(
        fastify: FastifyInstance,
        service: ConstructorReturnType<IServiceDecoConstructor>
      ) {
        const eventName = "onRegister";
        fastify.addHook(eventName, async (fastifyInstance: FastifyInstance) =>
          service[eventName]?.call(service, fastifyInstance)
        );
      }

      private attachReadyListener(
        fastify: FastifyInstance,
        service: ConstructorReturnType<IServiceDecoConstructor>
      ) {
        const eventName = "onReady";
        fastify.addHook(eventName, async () =>
          service[eventName]?.call(service)
        );
      }

      private attachCloseListener(
        fastify: FastifyInstance,
        service: ConstructorReturnType<IServiceDecoConstructor>
      ) {
        const eventName = "onClose";
        fastify.addHook(eventName, async (fastifyInstance: FastifyInstance) =>
          service[eventName]?.call(service, fastifyInstance)
        );
      }

      private getInstanceFromContainer<T extends IClassWithKey<Constructor>>(
        container: Container,
        Class: T
      ) {
        return container.get<ConstructorReturnType<T>>(Class.$KEY);
      }

      private getMergedContainer(
        fastify: FastifyInstance,
        includeController = false
      ) {
        return Container.merge(
          Decorated.localContainer,
          Decorated.exportContainer,
          ...(includeController ? [Decorated.controllerContainer] : []),
          ...this.getImportsContainers(fastify)
        ) as Container;
      }

      private getImportsContainers(fastify: FastifyInstance) {
        // For performance reasons, I think instead of trying to check if container is been created, we should remain the container with high confidence of being created and throw error if not created.

        // Or somehow store the reference of the import containers in the CPU register for faster retrieval if possible or in RAM (physical or virtual) if user has large space
        return _.map(config.imports, (importModule) =>
          importModule.load(fastify)
        );
      }

      private registerControllerHandler(
        fastify: FastifyInstance,
        controller: ConstructorReturnType<IControllerDecoConstructor>,
        methodName: string
      ) {
        if (methodName === "$METADATA")
          return throwError(
            `methodName of controller ${controller} should not be used since it is a resevered key`
          );
        const handlerWithMetaData = controller[methodName];

        return fastify.route({
          ...handlerWithMetaData.$METADATA,
          handler: this.getControllerHandlerFn(handlerWithMetaData),
          url:
            controller.$METADATA.basePath + handlerWithMetaData.$METADATA.url,
        });
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
