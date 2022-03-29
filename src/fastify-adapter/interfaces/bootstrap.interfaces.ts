import { IncomingMessage } from "http";
import { Duplex } from "stream";
import { WebSocket, WebSocketServer } from "ws";

export interface IServiceEventHandler {
  emitReady: () => void;
  emitStart: () => void;
  emitClose: () => void;
}

export interface IWsHandler {
  handleServerUpgrade: (
    wss: WebSocketServer,
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer
  ) => void;
  handleWsMessage: (
    wss: WebSocketServer,
    ws: WebSocket,
    req: IncomingMessage,
    payload: string | Buffer,
    isBinary: boolean
  ) => void;
  detectAndCloseBrokenConnection: (wss: WebSocketServer) => void;
}
