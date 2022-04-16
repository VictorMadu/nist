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
  private wsAttacher: WsAttacher;

  constructor(fastify: FastifyInstance) {
    super();
    this.wsAttacher = new WsAttacher(fastify.server);
  }

  protected getMetadata(store: Store, controllerClass: Constructor) {
    return store.getHttpMetadata(controllerClass);
  }
  protected getControllers(store: Store) {
    return store.getHttps();
  }

  protected attach(wsInstance: ControllerInstance, metadata: ClassMetadata): void {
    this.wsAttacher.setWsInstance(wsInstance).setMetadata(metadata);
    _.forEach(metadata.getMethodNames(), (methodName) => this.wsAttacher.attach(methodName));
  }
}

class WsAttacher {
  private wsInstance!: ControllerInstance;
  private wsManager!: WsManager;
  private metadata!: ClassMetadata;

  constructor(private server: Server) {}

  setWsInstance(wsInstance: ControllerInstance) {
    if (!this.wsManager) this.wsManager = new WsManagerImpl(this.server);
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

    const subType = methodMeta.type || "";
    const type = baseMeta.type + subType;

    this.wsManager.createWssServerManager(baseMeta.path, (builder) => {
      builder
        .setHeartbeat(baseMeta.heartbeat)
        .setAuthAndGetUserDetails(baseMeta.authAndGetUserDetails)
        .setHandler(type, (...args) => {
          this.wsInstance[methodName](_.map(methodParamFns, (fn) => fn(...args)));
        });

      return builder;
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
