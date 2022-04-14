import * as _ from "lodash";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  IHttpClassMetadata,
  IHttpHandler,
  IMethodMetadata,
  IMethodParamDecoFn,
} from "./interface/http.adapter.interface";
import { getClassInstanceMetadatas, getClassInstanceMethod } from "../utils";

export class HttpAdapter {
  private DEFAULT_ROUTE = "/";
  constructor(private fastifyInstance: FastifyInstance) {}

  public attach(
    controller: Record<string | symbol, (...args: any[]) => any>,
    methodName: string | symbol
  ) {
    const method = getClassInstanceMethod<IHttpHandler>(controller, methodName);
    const [
      baseMetadata,
      methodMetadata,
      paramsGeneratorFn,
    ] = getClassInstanceMetadatas<
      IHttpClassMetadata,
      IMethodMetadata,
      IMethodParamDecoFn[]
    >(controller, methodName);

    // TODO: Do this for other types
    const schema = _.get(methodMetadata, "schema") as IMethodMetadata["schema"];

    this.fastifyInstance.route({
      ...methodMetadata,
      schema,
      handler: (req: FastifyRequest, rep: FastifyReply) =>
        method(..._.map(paramsGeneratorFn, (fn) => fn(req, rep))),
      url: this.buildRoutePath(baseMetadata.path, methodMetadata.path),
    });
  }

  private buildRoutePath(basePath = "", methodPath = "") {
    return basePath + methodPath || this.DEFAULT_ROUTE;
  }
}

export default HttpAdapter;
