import { FastifyInstance } from "fastify";
import * as _ from "lodash";
import { InjectableStore, InjectableHandler } from "nist-core";
import { Constructor } from "ts-util-types";
import { HttpAdapter } from "./http";
import { HttpType, WsType } from "./constants/controller.adapter.constants";
import {
  ControllerTypes,
  IControllerMetadata,
} from "./interfaces/controller.adapter.interfaces";
import { WsAdapter } from "./websocket";
import { getAllClassMethodsName } from "./utils";

export class ControllerAdapter {
  private httpAdapter: HttpAdapter;
  private wsAdapter: WsAdapter;

  constructor(fastify: FastifyInstance) {
    this.httpAdapter = new HttpAdapter(fastify);
    this.wsAdapter = new WsAdapter(fastify);
  }

  public attach(controller: Record<string | symbol, any>) {
    const constructorClass = controller.constructor as Constructor;
    const methodNames = getAllClassMethodsName(constructorClass);
    const adapter = this.getAdapter(constructorClass);
    _.forEach(methodNames, (methodName) => {
      adapter.attach(controller, methodName);
    });
  }

  public getWsAdapter() {
    return this.wsAdapter;
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
