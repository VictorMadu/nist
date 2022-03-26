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

  constructor(private fastify: FastifyInstance, appModule: IModuleDeco) {
    this.serviceAdapter = new ServiceAdapter(fastify);
    this.controllerAdapter = new ControllerAdapter(fastify);
    appModule.load(this.serviceAdapter, this.controllerAdapter);
  }

  public initWSHandler() {
    const server = this.fastify.server;
    const wsHandler = this.controllerAdapter.createWsHandler();
    const wss = new WebSocketServer({ noServer: true });

    // TODO: Try throwing error and see
    wsHandler.detectAndCloseBrokenConnection(wss, 3000);
    server.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) =>
      wsHandler.handleServerUpgrade(wss, req, socket, head)
    );
    wss.on("connection", function connection(
      ws: WebSocket,
      req: IncomingMessage,
      url: URL
    ) {
      wsHandler.handleHeartBeat(ws as WebSocket & { isAlive: boolean });
      ws.on("message", (payload: string | Buffer, isBinary: boolean) => {
        try {
          wsHandler.handleWsMessage(wss, ws, req, url, payload, isBinary);
        } catch (error) {
          ws.send(JSON.stringify({ type: "Error", message: "Uncaught error" }));
        }
      });
    });
  }

  getServiceEventHandler(): IServiceEventHandler {
    return this.serviceAdapter;
  }
}
