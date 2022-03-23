import { FastifyRequest, FastifyReply } from "fastify";
import { METADATA_KEY } from "../../core/constant";
import { IAdapter } from "../../core/interface/adapter.interface";
import {
  IController,
  IMetaData,
} from "../../core/interface/controller.interface";
import { IHttpMethod } from "../../core/interface/method.interface";

export interface IControllerAdapter extends IAdapter<IController> {}

export interface IHttpController {
  [key: string | symbol]: {
    (...args: any[]): void | Promise<Record<string, any>>;
    [METADATA_KEY]: IHandlerMetaData;
  };
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
  [lifecycle in ReqRepLifeCycle]?: ((
    req: FastifyRequest,
    rep: FastifyReply
  ) => void)[];
} & {
  method: IHttpMethod;
  path: string;
};

export type IHandlerArgFn = (req: FastifyRequest, rep: FastifyReply) => any;
