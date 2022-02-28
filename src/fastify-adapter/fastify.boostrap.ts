import { FastifyInstance } from "fastify";
import { IListeners, IRouteConfig } from "./interface";
import * as _ from "lodash";
import ControllerAdapter from "./controller.adapter";
import ServiceAdapter from "./service.adapter";

export default class FastifyBoostrap {
  private serviceListeners: IListeners = {
    onReady: [],
    onStart: [],
    onClose: [],
  };
  private routeConfigs: IRouteConfig[] = [];
  private fastify!: FastifyInstance;
  private serviceAdapter = new ServiceAdapter(this.serviceListeners);
  private controllerAdapter = new ControllerAdapter(this.routeConfigs);

  // Users are meant to set the fastify config, they want and listen.
  // Ours is to do the bootstrapping
  start(fastifyInstance: FastifyInstance, appModule: any) {
    this.fastify = fastifyInstance;
    appModule.load(this.serviceAdapter, this.controllerAdapter);
    this.registerRoute();
  }

  emitReady() {
    this.emitEvent("onReady");
  }

  emitStart() {
    this.emitEvent("onStart");
  }

  emitClose() {
    this.emitEvent("onClose");
  }

  getServiceAdapter() {
    return this.getServiceAdapter;
  }

  getControllerAdapter() {
    return this.controllerAdapter;
  }

  private emitEvent(event: "onReady" | "onStart" | "onClose") {
    _.forEach(this.serviceListeners[event], (serviceListener) =>
      serviceListener(this.fastify)
    );
  }

  private registerRoute() {
    _.forEach(this.routeConfigs, (routeConfig) =>
      this.fastify.route({ ...routeConfig })
    );
  }
}
