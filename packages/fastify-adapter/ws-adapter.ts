import { FastifyInstance } from "fastify";
import * as _ from "lodash";
import { Constructor } from "ts-util-types";
import { Server } from "http";
import { ClassMetadata } from "../core/class-metadata";
import { ControllerAdapter, ControllerInstance } from "../core/controller-adapter";
import { Store } from "../core/store";
import { WsManager, WsManagerImpl } from "../ws-manager";
import { BaseMetadata, MethodMetadata, ParamMetadata } from "./interface/ws-adapter.interface";

export class WsAdapter extends ControllerAdapter {
  private wsAttacher!: WsAttacher;

  constructor(private fastify: FastifyInstance) {
    super();
  }

  protected getMetadata(store: Store, controllerClass: Constructor) {
    return store.getWsMetadata(controllerClass);
  }
  protected getControllers(store: Store) {
    if (!this.wsAttacher) this.wsAttacher = new WsAttacher(this.fastify.server);
    return store.getWs();
  }

  protected attach(wsInstance: ControllerInstance, metadata: ClassMetadata): void {
    // getControllers will be called before attach
    this.wsAttacher.setWsInstance(wsInstance).setMetadata(metadata);
    _.forEach(metadata.getMethodNames(), (methodName) => this.wsAttacher.attach(methodName));
  }
}

class WsAttacher {
  private wsManager = new WsManagerImpl(this.server);
  private wsInstance!: ControllerInstance;
  private metadata!: ClassMetadata;

  constructor(private server: Server) {}

  setWsInstance(wsInstance: ControllerInstance) {
    this.wsInstance = wsInstance;
    return this;
  }

  setMetadata(metadata: ClassMetadata) {
    this.metadata = metadata;
    return this;
  }

  attach(methodName: string | symbol) {
    const baseMeta = this.getBaseMeta();
    const methodMeta = this.getMethodMeta(methodName);
    const methodParamFns = this.getMethodParamFns(methodName);
    const type = baseMeta.type + methodMeta.type;
    console.log("wsMeta", methodName, type);

    this.wsManager.createWssServerManager(baseMeta.path, (builder) => {
      return builder
        .setHeartbeat(baseMeta.heartbeat)
        .setAuthAndGetUserDetails(baseMeta.authAndGetUserDetails)
        .setHandler(type, (...args) => {
          this.wsInstance[methodName](_.map(methodParamFns, (fn) => fn(...args)));
        });
    });
  }

  private getBaseMeta() {
    return this.metadata.getBaseMeta<BaseMetadata>();
  }

  private getMethodMeta(methodName: string | symbol) {
    return this.metadata.getMethodMeta<MethodMetadata>(methodName);
  }

  private getMethodParamFns(methodName: string | symbol) {
    return this.metadata.getParamMeta<ParamMetadata[]>(methodName);
  }
}
