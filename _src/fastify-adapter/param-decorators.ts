import * as _ from "lodash";
import { FastifyReply, FastifyRequest } from "fastify";
import { setParamMetadata } from "../core/deco-utils";

export const dataKey = Symbol();

export function Body() {
  return setParamMetadata((req: FastifyRequest, rep: FastifyReply) => req.body);
}

export function Params() {
  return setParamMetadata(
    (req: FastifyRequest, rep: FastifyReply) => req.params
  );
}

export function Query() {
  return setParamMetadata(
    (req: FastifyRequest, rep: FastifyReply) => req.query
  );
}

export function Rep() {
  return setParamMetadata((req: FastifyRequest, rep: FastifyReply) => req);
}

export function ReqData<T extends {} = {}>() {
  return setParamMetadata(
    (req: FastifyRequest, rep: FastifyReply) => (req as any)[dataKey] as T
  );
}

export function RepData<T extends {} = {}>(props?: string) {
  return setParamMetadata(
    (req: FastifyRequest, rep: FastifyReply) => (rep as any)[dataKey] as T
  );
}
