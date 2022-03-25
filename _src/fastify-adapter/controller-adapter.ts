import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import * as _ from "lodash";
import { getAllClassMethodsName } from "../../src/utils";
import WebSocket, { WebSocketServer } from "ws";
import { IHttpMethod } from "core/interface/method.interface";
import {
  Constructor,
  ControllerTypes,
  IArgs,
  IControllerInstance,
  IControllerMetadata,
  IControllerMethodMetadata,
  IControllerMethodParamMetadata,
  IHttpClassMetadataReturn,
  IMethodName,
  IParamArgs,
  IPayload,
  IWsClassMetadataReturn,
  ReqRepLifeCycle,
} from "./interface/controller-adapter.interface";
import { InjectableStore } from "../core/injectable-store";
import InjectableHandler from "../core/injectable-handler";
import { createController } from "../core/deco-utils";
import { HttpType, WsType } from "./constants/controller.constant";

export default class ControllerAdapter {
  private httpAdapter: HttpAttacher;
  private wsAdapter = new WsAttacher();
  constructor(fastifyInstance: FastifyInstance) {
    this.httpAdapter = new HttpAttacher(fastifyInstance);
  }

  public attach(controller: Record<string | symbol, any>) {
    const constructorClass = controller.constructor as Constructor;
    const methodNames = getAllClassMethodsName(constructorClass);
    const adapter = this.getAdapter(constructorClass);
    _.forEach(methodNames, (methodName) => {
      const args: IParamArgs = [
        this.getMethod(controller, methodName),
        ...this.getMetadata(controller, methodName),
      ];
      adapter.attach(...args);
    });
  }

  public handleWs(wss: WebSocketServer, ws: WebSocket, payload: IPayload) {
    this.wsAdapter.handle(wss, ws, payload);
  }

  private getAdapter(constructorClass: Constructor) {
    const type = this.getControllerType(constructorClass) as ControllerTypes;

    switch (type) {
      case "http":
        return this.httpAdapter;
      case "ws":
        return this.wsAdapter;
      default:
        throw new Error("Unsupported Class");
    }
  }

  private getMethod(controller: IControllerInstance, methodName: IMethodName) {
    return controller[methodName].bind(controller) as Function;
  }

  private getMetadata(
    controller: IControllerInstance,
    methodName: IMethodName
  ) {
    const controllerClass = controller.constructor as Constructor;
    const metadata = InjectableStore.getInjectableHandler(
      controllerClass
    ) as InjectableHandler;

    const controllerMetadata = metadata.classMetaData;
    const methodMetadata = metadata.methodsMetaData[methodName];
    const methodsParamsDecoFn = metadata.methodsParamDeco[methodName];

    return [controllerMetadata, methodMetadata, methodsParamsDecoFn] as [
      IControllerMetadata,
      IControllerMethodMetadata,
      IControllerMethodParamMetadata
    ];
  }

  private getControllerType(controllerClass: Constructor) {
    const injectableHandler = InjectableStore.getInjectableHandler(
      controllerClass
    ) as InjectableHandler;

    const metadata = injectableHandler.classMetaData as IControllerMetadata;
    return metadata.__type;
  }
}

export const HttpController = createController<IArgs, IHttpClassMetadataReturn>(
  (args, classMetadata) => ({
    basePath: args[0],
    __type: HttpType,
  })
);

export const WsController = createController<IArgs, IWsClassMetadataReturn>(
  (args, classMetaData) => ({
    baseType: args[0],
    __type: WsType,
  })
);

class HttpAttacher {
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
        method(..._.map(methodsParamsDecoFn, (fn) => fn(req, rep))),
      url:
        (methodMetadata.url ?? "" + controllerMetadata.basePath ?? "") || "/",
    });
  }
}

class WsAttacher {
  // store the types and handler
  // when called
  static typesAndHandlers: Record<
    string,
    (
      wss: WebSocketServer,
      ws: WebSocket,
      payload: { type: string; data: any }
    ) => void
  > = {};
  constructor() {}

  attach(
    method: Function,
    controllerMetadata: { baseType: string },
    methodMetadata: { subType: string },
    methodsParamsDecoFn: ((
      wss: WebSocketServer,
      ws: WebSocket,
      payload: { type: string; data: any }
    ) => any)[]
  ) {
    WsAttacher.typesAndHandlers[
      controllerMetadata.baseType + methodMetadata.subType
    ] = (
      wss: WebSocketServer,
      ws: WebSocket,
      payload: { type: string; data: any }
    ) => method(..._.map(methodsParamsDecoFn, (fn) => fn(wss, ws, payload)));
  }

  // ws.on('message', call this method)
  handle(
    wss: WebSocketServer,
    ws: WebSocket,
    payload: { type: string; data: any }
  ) {
    WsAttacher.typesAndHandlers[payload.type](wss, ws, payload);
  }
}
