// import { FastifyReply, FastifyRequest } from "fastify";
// import * as _ from "lodash";

// export const metadata = Symbol();

// function getReqOrRepMetadata(reqOrRep: FastifyRequest | FastifyReply) {
//   return (reqOrRep as any)[metadata] ?? {};
// }

// function setReqOrRepMetadata(
//   reqOrRep: FastifyRequest | FastifyReply,
//   value: any
// ) {
//   (reqOrRep as any)[metadata] = value;
// }

// export function setMetadata(
//   reqOrRep: FastifyRequest | FastifyReply,
//   key: string,
//   value: any
// ) {
//   const reqOrRepMetadata = getReqOrRepMetadata(reqOrRep);
//   setReqOrRepMetadata(reqOrRep, _.set(reqOrRepMetadata, key, value));
// }

// export function getMetadata(
//   reqOrRep: FastifyRequest | FastifyReply,
//   key?: string
// ) {
//   const reqOrRepMetadata = getReqOrRepMetadata(reqOrRep);
//   return key ? _.get(reqOrRepMetadata, key) : reqOrRepMetadata;
// }
