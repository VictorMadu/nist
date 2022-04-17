import { IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Duplex } from "stream";
import { AndWithPromise } from "ts-util-types";

export type AuthAndGetUserDetails = (
  req: IncomingMessage
) => AndWithPromise<Object | null | undefined>;

export type WsHandler = (
  wss: WebSocketServer,
  ws: WebSocket,
  req: IncomingMessage,
  socket: Duplex,
  head: Buffer,
  payload: any
) => any;
