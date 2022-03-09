import { FastifyRequest, FastifyReply } from "fastify";
import { metaMethodDecorator } from "../core/metaDecorator";

export function OnRequest(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return metaMethodDecorator("onRequest", fns);
}

export function PreParsing(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return metaMethodDecorator("preParsing", fns);
}

export function PreValidation(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return metaMethodDecorator("preValidation", fns);
}

export function PreHandler(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return metaMethodDecorator("preHandler", fns);
}

export function PreSerialization(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return metaMethodDecorator("preSerialization", fns);
}

export function OnError(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return metaMethodDecorator("onError", fns);
}

export function OnResponse(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return metaMethodDecorator("onResponse", fns);
}

export function OnTimeout(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return metaMethodDecorator("onTimeout", fns);
}
