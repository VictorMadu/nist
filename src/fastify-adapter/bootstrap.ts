import { FastifyInstance } from "fastify";
import { IncomingMessage } from "http";
import { Duplex } from "stream";
import WebSocket, { WebSocketServer } from "ws";
import {
  IModuleDeco,
  IModuleDecoConstructor,
} from "../core/interface/module.interface";
import ControllerAdapter from "./controller.adapter";
import {
  IServiceEventHandler,
  IWsHandler,
} from "./interfaces/bootstrap.interfaces";
import { IPayload } from "./interfaces/controller.adapter.interfaces";
import ServiceAdapter from "./service.adapter";
import * as _ from "lodash";

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

  getServiceEventHandler(): IServiceEventHandler {
    return this.serviceAdapter;
  }
}
