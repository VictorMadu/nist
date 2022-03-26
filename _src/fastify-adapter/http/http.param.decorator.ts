import { FastifyReply, FastifyRequest } from "fastify";
import { setParamMetadata } from "../../core/deco-utils";

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

export function Req() {
  return setParamMetadata((req: FastifyRequest, rep: FastifyReply) => req);
}

export function Rep() {
  return setParamMetadata((req: FastifyRequest, rep: FastifyReply) => rep);
}

export function ReqData() {
  return setParamMetadata(
    (req: FastifyRequest, rep: FastifyReply) => (req as any)[dataKey]
  );
}

export function RepData() {
  return setParamMetadata(
    (req: FastifyRequest, rep: FastifyReply) => (rep as any)[dataKey]
  );
}
