import { getClassInstanceMethod, getClassInstanceMetadatas } from "../utils";
import { IncomingMessage } from "http";
import _ from "lodash";
import {
  IClassMetadata,
  IHandlerArgs,
  IMethodMetadata,
  IMethodParamDecoFn,
} from "./interface/ws.adapter.interface";

export class WsAdapter {
  // store the types and handler
  // when called
  defaultType = Symbol();
  private wsHandlerObj: {
    [path: string]:
      | [
          (req: IncomingMessage, url: URL) => boolean,
          {
            [type: string | symbol]: IMethodParamDecoFn<boolean> | undefined;
          }
        ]
      | undefined;
  } = {};

  attach(
    controller: Record<string | symbol, (...args: any[]) => any>,
    methodName: string | symbol
  ) {
    const method = getClassInstanceMethod(controller, methodName);
    const [
      baseMetadata,
      methodMetadata,
      paramsGeneratorFn,
    ] = getClassInstanceMetadatas<
      IClassMetadata,
      IMethodMetadata,
      IMethodParamDecoFn<boolean>[]
    >(controller, methodName);

    const defaultAuth = (req: IncomingMessage) => true;
    const path = baseMetadata.path ?? "" + methodMetadata.path ?? "";
    const type = methodMetadata.type
      ? methodMetadata.type + baseMetadata.type ?? ""
      : baseMetadata.type ?? this.defaultType;

    const [authenticate, typeObj] = this.wsHandlerObj[path] ?? [
      methodMetadata.auth ?? baseMetadata.auth ?? defaultAuth,
      {},
    ];

    // TODO: In the params, cache the constant values returned by paramDecos
    typeObj[type] = <B extends boolean>(...args: IHandlerArgs<B>) =>
      method(..._.map(paramsGeneratorFn, (fn) => fn(...args)));

    this.wsHandlerObj[path] = [authenticate, typeObj];
  }

  authenticate(req: IncomingMessage, url: URL) {
    const authenticationAndHandler = this.wsHandlerObj[url.pathname];
    if (!authenticationAndHandler) return false;
    return authenticationAndHandler[0](req, url);
  }

  getHandler(path: string, type?: string) {
    const authenticationAndHandlerObj = this.wsHandlerObj[path];
    if (!authenticationAndHandlerObj) return undefined;
    const [, handlerObj] = authenticationAndHandlerObj;
    return handlerObj[type ?? this.defaultType];
  }
}

export default WsAdapter;
