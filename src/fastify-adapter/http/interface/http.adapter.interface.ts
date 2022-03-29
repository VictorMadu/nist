import { FastifyRequest, FastifyReply } from "fastify";
import { IHttpMethod } from "./http.method.decorator.interface";
import { ReqRepLifeCycle } from "./http.param.decorator.interface";
import { HttpType } from "../../constants/controller.adapter.constants";

export type IHttpClassMetadata = {
  path?: string;
  __type: typeof HttpType;
};

export type IMethodMetadata = {
  [lifecycle in ReqRepLifeCycle]?: ((
    req: FastifyRequest,
    rep: FastifyReply
  ) => void)[];
} & {
  method: IHttpMethod;
  path?: string;
};

export type IHttpHandler = (...args: any[]) => void;

export type IMethodParamDecoFn = (
  req: FastifyRequest,
  rep: FastifyReply
) => any;
