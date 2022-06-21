import { IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Duplex } from "stream";
import { OrWithPromise } from "ts-util-types";

export type AuthAndGetUserDetails = (
  req: IncomingMessage
) => OrWithPromise<Object | null | undefined>;

export type WsHandler = (
  wss: WebSocketServer,
  ws: WebSocket,
  req: IncomingMessage,
  socket: Duplex,
  head: Buffer,
  data: {
    userData: Object;
    payload: any;
  }
) => any;
