import { FastifyRequest, FastifyReply } from "fastify";
import { IHttpMethod } from "./http.method.decorator.interface";
import { ReqRepLifeCycle } from "./http.param.decorator.interface";

export type IClassMetadata = { basePath: string };
export type IMethodMetadata = {
  [lifecycle in ReqRepLifeCycle]?: ((
    req: FastifyRequest,
    rep: FastifyReply
  ) => void)[];
} & {
  method: IHttpMethod;
  url: string;
};

export type IHttpHandler = (...args: any[]) => void;

export type IMethodParamDecoFn = (
  req: FastifyRequest,
  rep: FastifyReply
) => any;
