import { FastifyInstance } from "fastify";
import { IncomingMessage } from "http";
import _ from "lodash";
import { getAllClassMethodsName } from "../../utils";
import WebSocket, { WebSocketServer } from "ws";
import { InjectableStore, InjectableHandler } from "../../core";
import { Constructor } from "../../types";
import { HttpType, WsType } from "../constants/controller.constant";
import HttpAttacher from "./http-adapter";
import {
  ControllerTypes,
  IControllerInstance,
  IControllerMetadata,
  IControllerMethodMetadata,
  IControllerMethodParamMetadata,
  IMethodName,
  IParamArgs,
  IPayload,
} from "./interface/controller-adapter.interface";
import WsAttacher from "./ws-adapter";

export class ControllerAdapter {
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

  public handleWs(
    wss: WebSocketServer,
    ws: WebSocket,
    req: IncomingMessage,
    payload: IPayload
  ) {
    this.wsAdapter.handle(wss, ws, req, payload);
  }

  private getAdapter(constructorClass: Constructor) {
    const type = this.getControllerType(constructorClass) as ControllerTypes;

    switch (type) {
      case HttpType:
        return this.httpAdapter;
      case WsType:
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

export default ControllerAdapter;
