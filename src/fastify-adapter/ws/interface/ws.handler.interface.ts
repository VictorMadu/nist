import { IncomingMessage } from "http";
import { Duplex } from "stream";
import WebSocket, { WebSocketServer } from "ws";

export interface IWsHandler {
  handleServerUpgrade: (
    wss: WebSocketServer,
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer
  ) => void;
  handleWsMessage: <B extends boolean>(
    wss: WebSocketServer,
    ws: WebSocket,
    req: IncomingMessage,
    url: URL,
    payload: B extends true ? Buffer : string,
    isBinary: B
  ) => void;
  detectAndCloseBrokenConnection: (
    wss: WebSocketServer,
    heartBeatRate?: number
  ) => void;
}
