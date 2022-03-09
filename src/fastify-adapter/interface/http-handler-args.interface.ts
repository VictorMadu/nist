import { FastifyReply, FastifyRequest } from "fastify";

export type IReqOrRepProp<T extends "req" | "rep"> = T extends "req"
  ? keyof FastifyRequest
  : T extends "rep"
  ? keyof FastifyReply
  : never;

export interface IArgFn<A extends any[] = any[], R extends any = any> {
  (args: A, req: FastifyRequest, rep: FastifyReply): R;
}

export type IReqOrRep = "req" | "rep";

export type IDataParams = [IReqOrRep, string | undefined] | any;

export type IPropsParams<T extends IReqOrRep = "req"> =
  | [T, IReqOrRepProp<T>]
  | any;

export type IParams = FastifyRequest["params"];
export type IRep = FastifyReply;
