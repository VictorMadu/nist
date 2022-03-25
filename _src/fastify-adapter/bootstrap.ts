import WebSocket, { WebSocketServer } from "ws";
import { IModuleDecoConstructor } from "../core/interface/module.interface";

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
        payload: { type: string; data: any }
      ) => void;
    }
  ) {}

  start(AppModule: IModuleDecoConstructor) {
    new AppModule().load(this.serviceAdapter, this.controllerAdapter);
  }

  handleWsMessage(
    wss: WebSocketServer,
    ws: WebSocket,
    payload: { type: string; data: any }
  ) {
    this.controllerAdapter.handleWs(wss, ws, payload);
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
