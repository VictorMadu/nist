import { IncomingMessage } from "http";
import { Duplex } from "stream";
import WebSocket, { WebSocketServer } from "ws";
import { IModuleDecoConstructor } from "../core/interface/module.interface";
import { IPayload } from "./interfaces/controller.adapter.interfaces";

export class AppBootstrap {
  constructor(
    private serviceAdapter: {
      attach: (service: Record<string | symbol, Function>) => void;
      emitReady: () => void;
      emitStart: () => void;
      emitClose: () => void;
    },
    private controllerAdapter: {
      attach: (controller: Record<string | symbol, Function>) => void;
      handleWs: (
        wss: WebSocketServer,
        ws: WebSocket,
        req: IncomingMessage,
        payload: IPayload
      ) => void;
    }
  ) {}

  start(AppModule: IModuleDecoConstructor) {
    new AppModule().load(this.serviceAdapter, this.controllerAdapter);
  }

  handleWsMessage(
    wss: WebSocketServer,
    ws: WebSocket,
    req: IncomingMessage,
    payload: IPayload,
    isBinary: boolean
  ) {
    this.controllerAdapter
      .getWsHandler()
      .handle(wss, ws, req, payload, isBinary);
  }

  detectAndCloseBrokenConnection(wss: WebSocketServer) {
    // TODO: Handle;
    throw new Error("Not implemented");
  }

  handleServerUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {}

  emitReady() {
    this.serviceAdapter.emitReady();
  }
  emitStart() {
    this.serviceAdapter.emitStart();
  }
  emitClose() {
    this.serviceAdapter.emitClose();
  }
}
