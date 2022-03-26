import { IncomingMessage } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { setParamMetadata } from "../../core/deco-utils";

export function Wss() {
  return setParamMetadata(
    (
      wss: WebSocketServer,
      ws: WebSocket,
      req: IncomingMessage,
      payload: { type: string; data: any }
    ) => wss
  );
}

export function Ws() {
  return setParamMetadata(
    (
      wss: WebSocketServer,
      ws: WebSocket,
      req: IncomingMessage,
      payload: { type: string; data: any }
    ) => ws
  );
}

export function Data() {
  return setParamMetadata(
    (
      wss: WebSocketServer,
      ws: WebSocket,
      req: IncomingMessage,
      payload: { type: string; data: any }
    ) => payload.data
  );
}

export function Type() {
  return setParamMetadata(
    (
      wss: WebSocketServer,
      ws: WebSocket,
      req: IncomingMessage,
      payload: { type: string; data: any }
    ) => payload.type
  );
}

export function Req() {
  return setParamMetadata(
    (
      wss: WebSocketServer,
      ws: WebSocket,
      req: IncomingMessage,
      payload: { type: string; data: any }
    ) => req
  );
}

export function Ip() {
  return setParamMetadata(
    (
      wss: WebSocketServer,
      ws: WebSocket,
      req: IncomingMessage,
      payload: { type: string; data: any }
    ) => req.socket.remoteAddress
  );
}

export function IpXForwardedFor() {
  return setParamMetadata(
    (
      wss: WebSocketServer,
      ws: WebSocket,
      req: IncomingMessage,
      payload: { type: string; data: any }
    ) =>
      // TODO: WARNING: req.headers["x-forwarded-for"] may be of type string[]. Look into this
      (req.headers["x-forwarded-for"] as string | undefined)
        ?.split(",")[0]
        .trim()
  );
}
