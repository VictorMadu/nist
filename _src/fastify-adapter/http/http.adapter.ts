import * as _ from "lodash";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ReqRepLifeCycle } from "./interface/http.param.decorator.interface";
import { IHttpMethod } from "./interface/http.method.decorator.interface";

export class HttpAdapter {
  constructor(private fastifyInstance: FastifyInstance) {}

  attach(
    method: Function,
    controllerMetadata: { basePath: string },
    methodMetadata: {
      [lifecycle in ReqRepLifeCycle]?: ((
        req: FastifyRequest,
        rep: FastifyReply
      ) => void)[];
    } & {
      method: IHttpMethod;
      url: string;
    },
    methodsParamsDecoFn: ((req: FastifyRequest, rep: FastifyReply) => any)[]
  ) {
    this.fastifyInstance.route({
      ...methodMetadata,
      handler: (req: FastifyRequest, rep: FastifyReply) =>
        method(
          ..._.map(methodsParamsDecoFn, (fn) => {
            console.log("http fn", fn);
            return fn(req, rep);
          })
        ),
      url:
        (methodMetadata.url ?? "" + controllerMetadata.basePath ?? "") || "/",
    });
  }
}

export default HttpAdapter;
