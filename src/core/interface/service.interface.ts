import { FastifyInstance } from "fastify";
import { IStartListeners } from "src/fastify-adapter/interface/service-adapter.interface";
import { ExactlyOrWithPromise } from "src/types";
import { INJECTABLE_KEY } from "../constant";
import { IBaseClass, IBase, InjectableClass } from "./injectable.interface";
import { IAnyMethod } from "./interface";

export type IServiceListeners = {
  onRegister?: (fastify: FastifyInstance) => ExactlyOrWithPromise<void>;
  onReady?: () => ExactlyOrWithPromise<void>;
  onClose?: (fastify: FastifyInstance) => ExactlyOrWithPromise<void>;
};

export type IService = IBase & IStartListeners & any;

export type IServiceClass<
  T extends IBaseClass<IService> = IBaseClass<IService>
> = InjectableClass<T>;
