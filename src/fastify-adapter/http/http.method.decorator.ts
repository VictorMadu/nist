import * as _ from "lodash";
import { FastifyReply, FastifyRequest } from "fastify";
import { setMethodMetadata } from "../../core/deco-utils";
import { IHttpMethod } from "./interface/http.method.decorator.interface";

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

export function OnRequest(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata("subType", fns);
}

export function PreParsing(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata("preParsing", fns);
}

export function PreValidation(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata("preValidation", fns);
}

export function PreHandler(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata("preHandler", fns);
}

export function PreSerialization(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata("preSerialization", fns);
}

export function OnError(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata("onError", fns);
}

export function OnResponse(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata("onResponse", fns);
}

export function OnTimeout(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata("onTimeout", fns);
}

function Method(method: IHttpMethod, path = "") {
  return function (
    target: Record<string | symbol, any>,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    setMethodMetadata("method", method)(target, key, descriptor);
    setMethodMetadata("path", path)(target, key, descriptor);
  };
}
