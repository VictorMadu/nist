import { FastifyRequest, FastifyReply } from "fastify";
import { metaDecorator } from "../core/metaDecorator";

export function OnRequest(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return metaDecorator("onRequest", fns);
}

export function PreParsing(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return metaDecorator("preParsing", fns);
}

export function PreValidation(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return metaDecorator("preValidation", fns);
}

export function PreHandler(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return metaDecorator("preHandler", fns);
}

export function PreSerialization(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return metaDecorator("preSerialization", fns);
}

export function OnError(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return metaDecorator("onError", fns);
}

export function OnResponse(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return metaDecorator("onResponse", fns);
}

export function OnTimeout(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return metaDecorator("onTimeout", fns);
}
