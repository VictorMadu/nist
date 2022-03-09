import { FastifyReply, FastifyRequest } from "fastify";
import * as _ from "lodash";

export const dataKey = Symbol();
export function setReqOrRepData(
  r: FastifyRequest | FastifyReply,
  key: string,
  value: any
) {
  (r as any)[dataKey] = (r as any)[dataKey] ?? {};
  return _.set((r as any)[dataKey], key, value);
}

export function getReqOrRepData(
  r: FastifyRequest | FastifyReply,
  key?: string
) {
  const data = (r as any)[dataKey] ?? {};
  return key ? _.get(data, key) : data;
}
