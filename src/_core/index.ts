import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { injectable, inject, Container } from "inversify";
import * as _ from "lodash";
import "reflect-metadata";
import {
  Constructor,
  ConstructorReturnType,
  ExactlyOrWithPromise,
} from "../types";
import { getAllClassMethodsName, throwError } from "./utils";

type IMetaDataKey = "$METADATA";
type InjectableKey = "$KEY";

const metaDataKey: IMetaDataKey = "$METADATA";
const injectableKey: InjectableKey = "$KEY";

type IMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

interface IController {
  [key: string]: {
    (req: FastifyRequest, rep: FastifyReply): void | Promise<
      Record<string, any>
    >;
    $METADATA: IHandlerMetaData;
  };
}

interface IControllerMetadata {
  $METADATA: { basePath: string };
}

interface IAnyMethod {
  [key: string]: (...args: any[]) => any;
}

type ReqRepLifeCycle =
  | "onRequest"
  | "preParsing"
  | "preValidation"
  | "preHandler"
  | "preSerialization"
  | "onError"
  | "onResponse"
  | "onTimeout";

type IHandlerMetaData = {
  [lifecycle in ReqRepLifeCycle]: ((
    req: FastifyRequest,
    rep: FastifyReply
  ) => void)[];
} & {
  method: IMethod;
  url: string;
};

type IServiceListeners = {
  onRegister?: (fastify: FastifyInstance) => ExactlyOrWithPromise<void>;
  onReady?: () => ExactlyOrWithPromise<void>;
  onClose?: (fastify: FastifyInstance) => ExactlyOrWithPromise<void>;
};

type IService = IServiceListeners & IAnyMethod;

export type IServiceDecoConstructor = {
  new (...args: any[]): IService;
  $KEY: symbol;
};

type IControllerDecoConstructor = {
  new (...args: any[]): IController & IControllerMetadata;

  $KEY: symbol;
};

type IClassWithKey<T extends Constructor> = T & {
  $KEY: symbol;
};

type IConfig = {
  imports: ReturnType<ReturnType<typeof Module>>[];
  controllers: IControllerDecoConstructor[];
  services: IServiceDecoConstructor[];
  exports: IServiceDecoConstructor[];
};

/**
 *
 * Decorator function that takes nothing as argument, It is used to to adding a static key prop to a class to be injectable so that Module can use it to bind to injection container
 */
export function Injectable() {
  return function (TargetClass: {
    new (...args: any[]): any;
  }): { new (...args: any[]): any; $KEY: symbol } {
    return injectable()(
      class extends injectable()(TargetClass) {
        static $KEY = Symbol();
        constructor(...args: any[]) {
          super(...args);
        }
      }
    );
  };
}

/**
 *
 * For obtaining the key of the class which is depended upon by the class being decorated. The obtained key is used to tell the\
 * TODO: Needs to be reworked
 */
export function Inject<
  T extends IControllerDecoConstructor | IServiceDecoConstructor
>(InjectableClass: T) {
  return function (
    target: T,
    targetKey: string,
    indexOrPropertyDescriptor: number | PropertyDescriptor
  ) {
    return inject(InjectableClass.$KEY)(
      target,
      targetKey,
      indexOrPropertyDescriptor
    );
  };
}

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

export function Controller(path: string) {
  return function (
    TargetClass: Constructor<any[], IController>
  ): IControllerDecoConstructor {
    return injectable()(
      class extends injectable()(TargetClass as any) {
        static $KEY = Symbol();
        $METADATA: IControllerMetadata["$METADATA"];
        constructor(...args: any[]) {
          super(...args);
          this.$METADATA = {
            basePath: "",
          };
        }
      }
    );
  };
}

export function Get(path: string) {
  return Method("GET", path);
}

export function Post(path: string) {
  return Method("POST", path);
}

export function Put(path: string) {
  return Method("PUT", path);
}

export function Patch(path: string) {
  return Method("PATCH", path);
}

export function Delete(path: string) {
  return Method("DELETE", path);
}

function Method(method: IMethod, path: string) {
  return function (
    target: IController,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    const metaData = target[key]["$METADATA"] ?? {};
    metaData.method = method;
    metaData.url = path;
    target[key]["$METADATA"] = metaData;
  };
}

export function OnRequest(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return req_rep_lifecycle_listener_register("onRequest", fns);
}

export function PreParsing(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return req_rep_lifecycle_listener_register("preParsing", fns);
}

export function PreValidation(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return req_rep_lifecycle_listener_register("preValidation", fns);
}

export function PreHandler(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return req_rep_lifecycle_listener_register("preHandler", fns);
}

export function PreSerialization(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return req_rep_lifecycle_listener_register("preSerialization", fns);
}

export function OnError(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return req_rep_lifecycle_listener_register("onError", fns);
}

export function OnResponse(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return req_rep_lifecycle_listener_register("onResponse", fns);
}

export function OnTimeout(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return req_rep_lifecycle_listener_register("onTimeout", fns);
}

function req_rep_lifecycle_listener_register(
  lifecycle: ReqRepLifeCycle,
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return function (
    target: IController,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    const metaData = target[key]["$METADATA"];
    metaData[lifecycle] = [...metaData.preValidation, ...fns];
  };
}

// @classM
// class Me {

//   @propM
//   meee: string;

//   @methodM
//   mee() {}
// }

// function classM(target: any) {
//   console.log("\n")
//   class Me extends target{}
//   console.log("Class Decorator", Me.$METADATA);
//   console.log("typeof Target", typeof Me)

//   return target;
// }

// function propM(target: any, key: string) {
//   console.log("\n")
//   target.constructor.$METADATA = {...target.constructor.$METADATA, [key]: "name"}
//   console.log("Property Decorator", target.constructor);
//   console.log("typeof Target", typeof target.constructor)

//   return target[key]
// }

// function methodM(target: any, key: string, descriptor: PropertyDescriptor) {
//   console.log("\n")
//   target.constructor.$METADATA = {...target.constructor.$METADATA, [key]: "name"}
//   console.log("Property Decorator", target.constructor);
//   console.log("typeof Target", typeof target.constructor)

//   return target[key]
// }

// console.log("Before initalizing Class")
// const me = new Me()
// console.log("After initalizing Class")

// console.log(Object.getOwnPropertyNames(me))

// @ClassDeco
// class Me {
//   constructor(private dd: string) {
//   }
//   // @methodDeco2
//   @methodDeco
//   @methodDeco1
//   @methodDeco2
//   @methodDeco3
//   gee(d) {
//     return d + " " + this.dd;
//   }
// }

// function ClassDeco(Target: {new (...args: any[]): any}) {
//   return class extends Target {
//     static $KEY = "key";

//     classMethod() {
//       return {
//         me: 'ok',
//         meMethod(d) {
//           return d
//         }
//       }
//     }
//   }
// }

// function methodDeco(target: any, methodKey: string, descriptor: PropertyDescriptor) {
//   const method = target[methodKey];
//   method.$METADATA = {
//     ...method.$METADATA,
//     name: "Method name is : " + methodKey,
//     callMe: (d: any) =>  d
//   }
// }

// function methodDeco1(target: any, methodKey: string, descriptor: PropertyDescriptor) {
//   const method = target[methodKey];
//   method.$METADATA = {
//     ...method.$METADATA,
//     name2: "Method name is : " + methodKey,
//     callMe2: (d: any) =>  d
//   }
// }

// function methodDeco3(target: any, methodKey: string, descriptor: PropertyDescriptor) {
//   const method = target[methodKey];
//   const wrapMethod = function (...args: any[]) {
//     return this.dd + " methodDeco3 " + method.call(this, args)
//   }
//   wrapMethod.$METADATA = method.$METADATA;
//   delete method.$METADATA;

//   target[methodKey] = wrapMethod;
// }

// function methodDeco2(target: any, methodKey: string, descriptor: PropertyDescriptor) {
//   const method = target[methodKey];
//   const wrapMethod = function (...args: any[]) {
//     return this.dd + " methodDeco2 " + method.call(this, args)
//   }
//   wrapMethod.$METADATA = method.$METADATA;
//   delete method.$METADATA;

//   target[methodKey] = wrapMethod;
// }

// const me = new Me('Mee')
// // console.log(me.gee.$METADATA.name)
// // console.log(me.gee.$METADATA.name2)
// console.log(me.gee('dd'))
// console.log(me.gee.$METADATA)

// class Meeo {
//   constructor(private name: string) {}
//   ge(d: string) { return this.name + " " + d}
// }

// const d = {
//   meeo: new Meeo('name')
// }

// const e = {
//   d: (e: string) => d.meeo.ge.call(d.meeo, e)
// }

// console.log(e.d('dd'))
