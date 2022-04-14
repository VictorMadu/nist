import { FastifyInstance } from "fastify";
import { WebSocketServer } from "ws";
import { IModuleDeco } from "nist-core/interface/module.interface";
import ControllerAdapter from "./controller.adapter";
import { IServiceEventHandler } from "./interfaces/bootstrap.interfaces";
import ServiceAdapter from "./service.adapter";
import * as _ from "lodash";

// TODO: Add core as peer dependency becaude of `IModuleDeco`
export class AppBootstrap {
  private serviceAdapter: ServiceAdapter;
  private controllerAdapter: ControllerAdapter;
  private wssInstanceObj: Record<string, WebSocketServer> = {};

  constructor(private fastify: FastifyInstance, appModule: IModuleDeco) {
    this.serviceAdapter = new ServiceAdapter(fastify);
    this.controllerAdapter = new ControllerAdapter(fastify);
    appModule.load(this.serviceAdapter, this.controllerAdapter);
  }

  public startWs() {
    const wsAdapter = this.controllerAdapter.getWsAdapter();
    wsAdapter.handleServerUpgrade();
  }

  public getServiceEventHandler(): IServiceEventHandler {
    return this.serviceAdapter;
  }
}

export default AppBootstrap;
