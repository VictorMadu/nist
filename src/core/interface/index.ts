import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { Container } from "inversify";
import {
  Constructor,
  ConstructorReturnType,
  ExactlyOrWithPromise,
} from "../../types";
import { INJECTABLE_KEY, METADATA_KEY } from "../constant";

export type IMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

export type Injectable = {
  new (...args: any[]): any;
  [INJECTABLE_KEY]: symbol;
};

export interface IController {
  [key: string]: {
    (req: FastifyRequest, rep: FastifyReply): void | Promise<
      Record<string, any>
    >;
    [METADATA_KEY]: IHandlerMetaData;
  };
}

export interface IControllerMetadata {
  [METADATA_KEY]: { basePath: string };
}

export interface IAnyMethod {
  [key: string]: (...args: any[]) => any;
}

export type ReqRepLifeCycle =
  | "onRequest"
  | "preParsing"
  | "preValidation"
  | "preHandler"
  | "preSerialization"
  | "onError"
  | "onResponse"
  | "onTimeout";

export type IHandlerMetaData = {
  [lifecycle in ReqRepLifeCycle]: ((
    req: FastifyRequest,
    rep: FastifyReply
  ) => void)[];
} & {
  method: IMethod;
  url: string;
};

export type IServiceListeners = {
  onRegister?: (fastify: FastifyInstance) => ExactlyOrWithPromise<void>;
  onReady?: () => ExactlyOrWithPromise<void>;
  onClose?: (fastify: FastifyInstance) => ExactlyOrWithPromise<void>;
};

export type IService = IServiceListeners & IAnyMethod;

export type IServiceDecoConstructor = {
  new (...args: any[]): IService;
  [INJECTABLE_KEY]: symbol;
};

export type IControllerDecoConstructor = {
  new (...args: any[]): IController & IControllerMetadata;

  [INJECTABLE_KEY]: symbol;
};

export type IClassWithKey<T extends Constructor> = T & {
  [INJECTABLE_KEY]: symbol;
};

export interface IServiceAdapter {
  attachLifeCycleListener: (service: IService) => void;
}

export interface IControllerAdapter {
  attachToRoute: (routeConfig: {}, baseConfig: { basePath: string }) => void;
}

export interface IModuleClassManager {
  createModuleInstance: () => IModule;

  setExportContainer: (container: Container) => void;
  getExportContainer: () => Container | undefined;
}

export type IModule = {
  load: (
    serviceLoader: ILoader<IServiceDecoConstructor, IServiceAdapter>,
    controlerLoader: ILoader<IControllerDecoConstructor, IControllerAdapter>
  ) => Container;
};

export type IModuleClass = Constructor<never, IModule>;

// U for adapter type
export interface ILoader<
  T extends { new (...args: any[]): any; [INJECTABLE_KEY]: symbol },
  U extends object = object
> {
  getInstance: (container: Container, Service: T) => ConstructorReturnType<T>;

  load: (service: ConstructorReturnType<T>) => void;
}
