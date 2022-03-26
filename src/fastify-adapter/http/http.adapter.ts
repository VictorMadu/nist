import * as _ from "lodash";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  IClassMetadata,
  IHttpHandler,
  IMethodMetadata,
  IMethodParamDecoFn,
} from "./interface/http.adapter.interface";
import { getClassInstanceMetadatas, getClassInstanceMethod } from "../utils";

export class HttpAdapter {
  constructor(private fastifyInstance: FastifyInstance) {}

  attach(
    controller: Record<string | symbol, (...args: any[]) => any>,
    methodName: string | symbol
  ) {
    const method = getClassInstanceMethod<IHttpHandler>(controller, methodName);
    const [
      baseMetadata,
      methodMetadata,
      paramsGeneratorFn,
    ] = getClassInstanceMetadatas<
      IClassMetadata,
      IMethodMetadata,
      IMethodParamDecoFn[]
    >(controller, methodName);

    this.fastifyInstance.route({
      ...methodMetadata,
      handler: (req: FastifyRequest, rep: FastifyReply) =>
        method(..._.map(paramsGeneratorFn, (fn) => fn(req, rep))),
      url: (methodMetadata.url ?? "" + baseMetadata.basePath ?? "") || "/",
    });
  }
}

export default HttpAdapter;
