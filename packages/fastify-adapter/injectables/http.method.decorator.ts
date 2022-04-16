import * as _ from "lodash";
import { FastifyReply, FastifyRequest } from "fastify";
import { MethodMetadata, HttpMethod } from "../interface/http-adapter.interface";
import { setMethodMetadata } from "./_utils";

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
  return setMethodMetadata<MethodMetadata, "onRequest">("onRequest", fns);
}

export function PreParsing(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata<MethodMetadata, "preParsing">("preParsing", fns);
}

export function PreValidation(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata<MethodMetadata, "preValidation">("preValidation", fns);
}

export function PreHandler(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata<MethodMetadata, "preHandler">("preHandler", fns);
}

export function PreSerialization(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata<MethodMetadata, "preSerialization">("preSerialization", fns);
}

export function OnError(fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]) {
  return setMethodMetadata<MethodMetadata, "onError">("onError", fns);
}

export function OnResponse(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata<MethodMetadata, "onResponse">("onResponse", fns);
}

export function OnTimeout(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
  return setMethodMetadata<MethodMetadata, "onTimeout">("onTimeout", fns);
}

export function Schema(schema: MethodMetadata["schema"]) {
  return setMethodMetadata<MethodMetadata, "schema">("schema", schema);
}

export function BodySchema(bodySchema: Record<string, any>) {
  return setMethodMetadata<MethodMetadata, "schema.body">("schema.body", bodySchema);
}

export function QueryStringSchema(queryStringSchema: Record<string, any>) {
  return setMethodMetadata<MethodMetadata, "schema.querystring">(
    "schema.querystring",
    queryStringSchema
  );
}

export function ParamsSchema(paramsSchema: Record<string, any>) {
  return setMethodMetadata<MethodMetadata, "schema.params">("schema.params", paramsSchema);
}

export function HeadersSchema(headersSchema: Record<string, any>) {
  return setMethodMetadata<MethodMetadata, "schema.headers">("schema.headers", headersSchema);
}

export function ResponseSchema(responseSchema: Record<string, any>) {
  return setMethodMetadata<MethodMetadata, "schema.response">("schema.response", responseSchema);
}

function Method(method: HttpMethod, path?: string) {
  return function (
    target: Record<string | symbol, any>,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    setMethodMetadata<MethodMetadata, "method">("method", method)(target, key, descriptor);
    setMethodMetadata<MethodMetadata, "path">("path", path)(target, key, descriptor);
  };
}
