import { FastifyRequest, FastifyReply } from "fastify";
import { getControllerMethodMetadata } from "../core/controller-adapter-utils";
import { ARG_TYPES } from "./constants/http-handler-args.constant";
import {
  IHttpController,
  IHandlerArgFn,
} from "./interface/controller-adapter.interface";
import { getMetadata } from "./util";
import * as _ from "lodash";
import {
  IArgFn,
  IDataParams,
  IPropsParams,
  IReqOrRep,
  IReqOrRepProp,
} from "./interface/http-controller.interface";

export class HttpHandlerUtils {
  constructor() {}

  getHandler(
    controller: IHttpController,
    methodName: string
  ): (req: FastifyRequest, rep: FastifyReply) => void {
    // TODO:
    const methodParamsMetadata = getControllerMethodMetadata(
      controller,
      methodName
    ) as any[];

    const argsFn: IHandlerArgFn[] = [];
    _.forEach(methodParamsMetadata, (methodParamMetadata) => {
      // TODO:
      const argType = methodParamMetadata.getParamType();
      const argFn: IHandlerArgFn = this.getArgFn(argType);
      argsFn.push(argFn);
    });

    return (req: FastifyRequest, rep: FastifyReply) =>
      controller[methodName](..._.forEach(argsFn, (argFn) => argFn(req, rep)));
  }

  private getArgFn(argType: string | symbol): IArgFn {
    switch (argType) {
      case ARG_TYPES.data:
        return (repOrrep?: IReqOrRep, key?: string) => (req, rep) =>
          getMetadata(this.getRepOrReq(req, rep, repOrrep), key) as IArgFn<
            IDataParams
          >;

      case ARG_TYPES.props:
        return this.getPropArgFn();

      case ARG_TYPES.body:
        return () => this.getPropArgFn()("req", "body");

      case ARG_TYPES.params:
        return () => this.getPropArgFn()("req", "params");

      case ARG_TYPES.query:
        return () => this.getPropArgFn()("req", "query");

      default:
        throw new Error("Unsupported paramType");
    }
  }

  private getPropArgFn(): IArgFn<IPropsParams> {
    return <T extends IReqOrRep = "req">(
      repOrrep: T,
      prop: IReqOrRepProp<T>
    ) => {
      return (req, rep) => (this.getRepOrReq(req, rep, repOrrep) as any)[prop];
    };
  }

  private getRepOrReq(
    req: FastifyRequest,
    rep: FastifyReply,
    type?: IReqOrRep
  ) {
    return type === "req" ? req : rep;
  }
}
