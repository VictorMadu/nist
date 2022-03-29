import * as _ from "lodash";
import { FastifyReply, FastifyRequest } from "fastify";
import { setMethodMetadata } from "../../core/deco-utils";
import { IHttpMethod } from "./interface/http.method.decorator.interface";
import { IMethodMetadata } from "./interface/http.adapter.interface";

export function Options(path?: string) {
  return Method("OPTIONS", path);
}

export function Get(path?: string) {
  return Method("GET", path);
}

export function Post(path?: string) {
  return Method("POST", path);
}

export function Put(path?: string) {
  return Method("PUT", path);
}

export function Patch(path?: string) {
  return Method("PATCH", path);
}

export function Delete(path?: string) {
  return Method("DELETE", path);
}

// TODO: To this type enforcing on setParamMetadata ans setClassMetadata
export function OnRequest(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata<IMethodMetadata, "onRequest">("onRequest", fns);
}

export function PreParsing(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata<IMethodMetadata, "preParsing">("preParsing", fns);
}

export function PreValidation(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata<IMethodMetadata, "preValidation">(
    "preValidation",
    fns
  );
}

export function PreHandler(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata<IMethodMetadata, "preHandler">("preHandler", fns);
}

export function PreSerialization(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata<IMethodMetadata, "preSerialization">(
    "preSerialization",
    fns
  );
}

export function OnError(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata<IMethodMetadata, "onError">("onError", fns);
}

export function OnResponse(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata<IMethodMetadata, "onResponse">("onResponse", fns);
}

export function OnTimeout(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata<IMethodMetadata, "onTimeout">("onTimeout", fns);
}

function Method(method: IHttpMethod, path?: string) {
  return function (
    target: Record<string | symbol, any>,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    setMethodMetadata<IMethodMetadata, "method">("method", method)(
      target,
      key,
      descriptor
    );
    setMethodMetadata<IMethodMetadata, "path">("path", path)(
      target,
      key,
      descriptor
    );
  };
}
