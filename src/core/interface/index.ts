import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { Container } from "inversify";
import { Constructor, ConstructorReturnType } from "../../types";
import { INJECTABLE_KEY, METADATA_KEY } from "../constant";

// export interface IController {
//   [key: string]: {
//     (req: FastifyRequest, rep: FastifyReply): void | Promise<
//       Record<string, any>
//     >;
//     [METADATA_KEY]: IHandlerMetaData;
//   };
// }

// export type ReqRepLifeCycle =
//   | "onRequest"
//   | "preParsing"
//   | "preValidation"
//   | "preHandler"
//   | "preSerialization"
//   | "onError"
//   | "onResponse"
//   | "onTimeout";

// export type IHandlerMetaData = {
//   [lifecycle in ReqRepLifeCycle]?: ((
//     req: FastifyRequest,
//     rep: FastifyReply
//   ) => void)[];
// } & {
//   method: IMethod;
//   url: string;
// };

// export type IControllerDecoConstructor = {
//   new (...args: any[]): IController & IControllerMetadata;

//   [INJECTABLE_KEY]: symbol;
// };
