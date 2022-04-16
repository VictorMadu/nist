import { IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Duplex } from "stream";

export type AuthAndGetUserDetails = (req: IncomingMessage) => Promise<Object | null | undefined>;

export type WsHandler = (
  wss: WebSocketServer,
  ws: WebSocket,
  req: IncomingMessage,
  socket: Duplex,
  head: Buffer,
  payload: any
) => any;
