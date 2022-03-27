import { FastifyInstance } from "fastify";
import _ from "lodash";
import { getAllClassMethodsName } from "../utils";
import { InjectableStore, InjectableHandler } from "../core";
import { Constructor } from "../types";
import HttpAttacher from "./http/http.adapter";
import { HttpType, WsType } from "./constants/controller.adapter.constants";
import {
  ControllerTypes,
  IControllerMetadata,
} from "./interfaces/controller.adapter.interfaces";
import WsAdapter from "./ws";
import { WsHandler } from "./ws/ws.handler";

export class ControllerAdapter {
  private httpAdapter: HttpAttacher;
  private wsAdapter = new WsAdapter();
  constructor(fastifyInstance: FastifyInstance) {
    this.httpAdapter = new HttpAttacher(fastifyInstance);
  }

  public attach(controller: Record<string | symbol, any>) {
    const constructorClass = controller.constructor as Constructor;
    const methodNames = getAllClassMethodsName(constructorClass);
    const adapter = this.getAdapter(constructorClass);
    _.forEach(methodNames, (methodName) =>
      adapter.attach(controller, methodName)
    );
  }

  // heartBeatRate per ms. eg: 3000 = 3 seconds
  public createWsHandler() {
    return new WsHandler(this.wsAdapter);
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

  private getControllerType(controllerClass: Constructor) {
    const injectableHandler = InjectableStore.getInjectableHandler(
      controllerClass
    ) as InjectableHandler;

    const metadata = injectableHandler.classMetaData as IControllerMetadata;
    return metadata.__type;
  }
}

export default ControllerAdapter;
