import { FastifyRequest, FastifyReply } from "fastify";
import { ARG_TYPES } from "./constants/http-handler-args.constant";
import {
  IHttpController,
  IHandlerArgFn,
} from "./interface/controller-adapter.interface";
import * as _ from "lodash";
import {
  IArgFn,
  IDataParams,
  IPropsParams,
  IReqOrRep,
  IReqOrRepProp,
} from "./interface/http-handler-args.interface";
import { getMethodParamsMetaData } from "../core/utils";
import { getReqOrRepData } from "./data-manager";

export class HttpHandlerUtils {
  constructor() {}

  getHandler(
    controller: IHttpController,
    methodName: string
  ): (req: FastifyRequest, rep: FastifyReply) => void {
    const method = controller[methodName];
    const methodParamsMetadata = getMethodParamsMetaData(method as any);

    const argsFn: IHandlerArgFn[] = [];
    _.forEach(methodParamsMetadata, ({ type, args }) => {
      // TODO:
      const argFn: IArgFn = this.getArgFn(type);
      argsFn.push(_.partial(argFn, args));
    });

    return (req: FastifyRequest, rep: FastifyReply) => {
      return controller[methodName](
        ..._.map(argsFn, (argFn) => argFn(req, rep))
      );
    };
  }

  private getArgFn(argType: string | symbol): IArgFn {
    switch (argType) {
      case ARG_TYPES.data:
        return (
          [reqOrRep, key]: IDataParams,
          req: FastifyRequest,
          rep: FastifyReply
        ) =>
          getReqOrRepData(this.getRepOrReq(req, rep, reqOrRep), key) as IArgFn<
            IDataParams
          >;

      case ARG_TYPES.props:
        return (
          [reqOrRep, key]: IPropsParams,
          req: FastifyRequest,
          rep: FastifyReply
        ) => {
          const repOrRep = this.getRepOrReq(req, rep, reqOrRep) as any;
          return key ? repOrRep[key] : repOrRep;
        };

      default:
        throw new Error("Unsupported paramType");
    }
  }

  private getRepOrReq(
    req: FastifyRequest,
    rep: FastifyReply,
    type?: IReqOrRep
  ) {
    return type === "req" ? req : rep;
  }
}
