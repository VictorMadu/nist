import { FastifyRequest, FastifyReply } from "fastify";
import { metaDecorator } from "../core/metaDecorator";
import { IController } from "../core/interface";
import { ReqRepLifeCycle } from "./interface";

export function OnRequest(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return req_rep_lifecycle_listener_register("onRequest", fns);
}

export function PreParsing(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return req_rep_lifecycle_listener_register("preParsing", fns);
}

export function PreValidation(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return req_rep_lifecycle_listener_register("preValidation", fns);
}

export function PreHandler(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return req_rep_lifecycle_listener_register("preHandler", fns);
}

export function PreSerialization(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return req_rep_lifecycle_listener_register("preSerialization", fns);
}

export function OnError(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return req_rep_lifecycle_listener_register("onError", fns);
}

export function OnResponse(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return req_rep_lifecycle_listener_register("onResponse", fns);
}

export function OnTimeout(
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return req_rep_lifecycle_listener_register("onTimeout", fns);
}

function req_rep_lifecycle_listener_register(
  lifecycle: ReqRepLifeCycle,
  fns: ((req: FastifyRequest, rep: FastifyReply) => void)[]
) {
  return metaDecorator(lifecycle, (metaData) => {
    metaData[lifecycle] = fns;
  });
}
