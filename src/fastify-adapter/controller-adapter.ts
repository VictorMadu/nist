import { FastifyInstance } from "fastify";
import * as _ from "lodash";
import { getFromMetaData, getMethodParamsMetaData } from "../core/utils";
import { CONTROLLER_KEY } from "../core";
import {
  HTTP_CONTROLLER_KEY,
  METADATA_KEY,
  WS_CONTROLLER_KEY,
} from "../core/constant";
import { IController } from "../core/interface/controller.interface";
import { getAllClassMethodsName } from "../utils";
import { HttpHandlerUtils } from "./http-handler-args";
import {
  IControllerAdapter,
  IHandlerArgFn,
  IHandlerMetaData,
  IHttpController,
  IWsContext,
  IWSControllerMethod,
} from "./interface/controller-adapter.interface";
import WebSocket, { WebSocketServer } from "ws";

class WsContext implements IWsContext {
  constructor(
    private wss: WebSocketServer,
    private ws: WebSocket,
    private data: { type: string; payload: any }
  ) {}

  getData() {
    return this.data;
  }
}

class WsAttacher {
  private typesAndHandlersObj: Record<
    string,
    (wsContext: IWsContext) => void
  > = {};
  constructor() {}
  attach(
    controller: Record<string | symbol, IWSControllerMethod>,
    methodName: string | symbol
  ) {
    const method: IWSControllerMethod = controller[methodName].bind(controller);
    // STOPPED HERE:
    this.typesAndHandlersObj[controller] = method;
  }
}

export default class ControllerAdapter implements IControllerAdapter {
  private httpAdapter: HttpAttacher;
  private wsAdapter = new WsAttacher();
  constructor(fastifyInstance: FastifyInstance) {
    this.httpAdapter = new HttpAttacher(fastifyInstance);
  }

  attach(controller: IController<IHandlerMetaData>) {
    const constructorClass = controller.constructor;
    const methodNames = getAllClassMethodsName(constructorClass);
    const adapter = this.getAdapter(constructorClass[CONTROLLER_KEY]);
    _.forEach(methodNames, (methodName) => {
      adapter.attach(controller, methodName);
    });
  }

  getAdapter(key: string) {
    switch (key) {
      case HTTP_CONTROLLER_KEY:
        return this.httpAdapter;
      case WS_CONTROLLER_KEY:
        return this.wsAdapter;
      default:
        throw new Error("Unsupported key");
    }
  }

  handleWsMessage(
    wss: WebSocketServer,
    ws: WebSocket,
    data: { type: string; payload: any }
  ) {}
}

class HttpAttacher {
  private httpHandlerUtils = new HttpHandlerUtils();
  constructor(private fastifyInstance: FastifyInstance) {}

  attach(controller: IHttpController, methodName: string | symbol) {
    const method = controller[methodName];
    const methodMetadata = getFromMetaData(
      method
    ) as IHttpController[string][typeof METADATA_KEY];

    const baseMetadata = getFromMetaData(controller as any) as { path: string };

    this.fastifyInstance.route({
      ...methodMetadata,
      handler: this.httpHandlerUtils.getHandler(controller, methodName),
      url: (baseMetadata.path ?? "" + methodMetadata.path ?? "") || "/",
    });
  }
}
