import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { Constructor, ExactlyOrWithPromise } from "../../types";
export type IMetaDataKey = "$METADATA";
export type InjectableKey = "$KEY";

export type IMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

export interface IController {
  [key: string]: {
    (req: FastifyRequest, rep: FastifyReply): void | Promise<
      Record<string, any>
    >;
    $METADATA: IHandlerMetaData;
  };
}

export interface IControllerMetadata {
  $METADATA: { basePath: string };
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
  $KEY: symbol;
};

export type IControllerDecoConstructor = {
  new (...args: any[]): IController & IControllerMetadata;

  $KEY: symbol;
};

export type IClassWithKey<T extends Constructor> = T & {
  $KEY: symbol;
};
