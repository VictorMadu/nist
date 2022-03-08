import { FastifyRequest, FastifyReply } from "fastify";
import { METADATA_KEY } from "../constant";
import { IHttpMethod } from "./method.interface";

export type IMetaData = { path: string };
export type IDecoArgs = [string | undefined] | never[];
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
  url: string;
};

export type IMethods = {
  [key: string]: {
    (req: FastifyRequest, rep: FastifyReply): void | Promise<
      Record<string, any>
    >;
    [METADATA_KEY]: IHandlerMetaData;
  };
};
