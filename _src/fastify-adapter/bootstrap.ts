import { IncomingMessage } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { IModuleDecoConstructor } from "../core/interface/module.interface";
import { IPayload } from "./controllers/interface/controller-adapter.interface";

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
    payload: IPayload
  ) {
    this.controllerAdapter.handleWs(wss, ws, req, payload);
  }

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
