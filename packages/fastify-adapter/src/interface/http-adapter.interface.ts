import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export type ReqRepLifeCycle =
  | "onRequest"
  | "preParsing"
  | "preValidation"
  | "preHandler"
  | "preSerialization"
  | "onError"
  | "onResponse"
  | "onTimeout";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

export type BaseMetadata = {
  path: string;
};

export type MethodMetadata = {
  [lifecycle in ReqRepLifeCycle]?: ((req: FastifyRequest, rep: FastifyReply) => void)[];
} & {
  method: HttpMethod;
  schema?: {
    body?: Record<string, any>;
    querystring?: Record<string, any>;
    params?: Record<string, any>;
    headers?: Record<string, any>;
    response?: Record<string, any>;
  };
  path: string;
};

export type ParamMetadata = (req: FastifyRequest, rep: FastifyReply) => any;
