import { FastifyReply, FastifyRequest } from "fastify";
import { InjectableStore } from "victormadu-nist-core";
import * as _ from "lodash";
import { MethodMetadata, HttpMethod } from "../interface/http-adapter.interface";
import { MethodMetadataSetter } from "./_utils";
import { Constructor } from "ts-util-types";

// TODO: Remove dupliation from http.param.decorators when resturcturing folder into service, ws and http

const store = InjectableStore.getStore();
const getMetadataFn = (Target: Constructor) => store.getHttpMetadata(Target);

const setter = new MethodMetadataSetter(getMetadataFn);

export function Options(path = "") {
    return Method("OPTIONS", path);
}

export function Get(path = "") {
    return Method("GET", path);
}

export function Post(path = "") {
    return Method("POST", path);
}

export function Put(path = "") {
    return Method("PUT", path);
}

export function Patch(path = "") {
    return Method("PATCH", path);
}

export function Delete(path = "") {
    return Method("DELETE", path);
}

// TODO: To this type enforcing on setParamMetadata ans setClassMetadata
export function OnRequest(
    fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
    return setter.set<MethodMetadata, "onRequest">("onRequest", fns);
}

export function PreParsing(
    fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
    return setter.set<MethodMetadata, "preParsing">("preParsing", fns);
}

export function PreValidation(
    fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
    return setter.set<MethodMetadata, "preValidation">("preValidation", fns);
}

export function PreHandler(
    fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
    return setter.set<MethodMetadata, "preHandler">("preHandler", fns);
}

export function PreSerialization(
    fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
    return setter.set<MethodMetadata, "preSerialization">("preSerialization", fns);
}

export function OnError(fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]) {
    return setter.set<MethodMetadata, "onError">("onError", fns);
}

export function OnResponse(
    fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
    return setter.set<MethodMetadata, "onResponse">("onResponse", fns);
}

export function OnTimeout(
    fns: ((req: FastifyRequest, rep: FastifyReply) => void | Promise<void>)[]
) {
    return setter.set<MethodMetadata, "onTimeout">("onTimeout", fns);
}

export function Schema(schema: MethodMetadata["schema"]) {
    return setter.set<MethodMetadata, "schema">("schema", schema);
}

export function BodySchema(bodySchema: Record<string, any>) {
    return setter.set<MethodMetadata, "schema.body">("schema.body", bodySchema);
}

export function QueryStringSchema(queryStringSchema: Record<string, any>) {
    return setter.set<MethodMetadata, "schema.querystring">(
        "schema.querystring",
        queryStringSchema
    );
}

export function ParamsSchema(paramsSchema: Record<string, any>) {
    return setter.set<MethodMetadata, "schema.params">("schema.params", paramsSchema);
}

export function HeadersSchema(headersSchema: Record<string, any>) {
    return setter.set<MethodMetadata, "schema.headers">("schema.headers", headersSchema);
}

export function ResponseSchema(responseSchema: Record<string, any>) {
    return setter.set<MethodMetadata, "schema.response">("schema.response", responseSchema);
}

function Method(method: HttpMethod, path = "") {
    return function (
        target: Record<string | symbol, any>,
        key: string,
        descriptor: PropertyDescriptor
    ) {
        setter.set<MethodMetadata, "method">("method", method)(target, key, descriptor);
        setter.set<MethodMetadata, "path">("path", path)(target, key, descriptor);
    };
}
