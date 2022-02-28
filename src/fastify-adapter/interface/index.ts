import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { IMethod } from "../../core/interface";

type IReqRep = (req: FastifyRequest, rep: FastifyReply) => void;

export type ReqRepLifeCycle =
  | "onRequest"
  | "preParsing"
  | "preValidation"
  | "preHandler"
  | "preSerialization"
  | "onError"
  | "onResponse"
  | "onTimeout";

export type IRouteConfig = {
  [lifecycle in ReqRepLifeCycle]?: IReqRep[];
} & {
  method: IMethod;
  url: string;
  handler: IReqRep;
};

export interface IListeners {
  onReady: ((fastify: FastifyInstance) => void)[];
  onStart: (() => void)[];
  onClose: (() => void)[];
}
