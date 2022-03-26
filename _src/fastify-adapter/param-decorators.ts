import * as _ from "lodash";
import { FastifyReply, FastifyRequest } from "fastify";
import { setParamMetadata } from "../core/deco-utils";
import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage } from "http";

export const dataKey = Symbol();

export function Body() {
  return setParamMetadata((req: FastifyRequest, rep: FastifyReply) => req.body);
}

export function Params() {
  return setParamMetadata(
    (req: FastifyRequest, rep: FastifyReply) => req.params
  );
}

export function Query() {
  return setParamMetadata(
    (req: FastifyRequest, rep: FastifyReply) => req.query
  );
}

export function Req() {
  return setParamMetadata((req: FastifyRequest, rep: FastifyReply) => req);
}

export function Rep() {
  return setParamMetadata((req: FastifyRequest, rep: FastifyReply) => rep);
}

export function ReqData() {
  return setParamMetadata(
    (req: FastifyRequest, rep: FastifyReply) => (req as any)[dataKey]
  );
}

export function RepData() {
  return setParamMetadata(
    (req: FastifyRequest, rep: FastifyReply) => (rep as any)[dataKey]
  );
}

// FOR WS
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

export function WsData() {
  return setParamMetadata(
    (
      wss: WebSocketServer,
      ws: WebSocket,
      req: IncomingMessage,
      payload: { type: string; data: any }
    ) => payload.data
  );
}

export function WsType() {
  return setParamMetadata(
    (
      wss: WebSocketServer,
      ws: WebSocket,
      req: IncomingMessage,
      payload: { type: string; data: any }
    ) => payload.type
  );
}

export function WsReq() {
  return setParamMetadata(
    (
      wss: WebSocketServer,
      ws: WebSocket,
      req: IncomingMessage,
      payload: { type: string; data: any }
    ) => req
  );
}

export function WsIp() {
  return setParamMetadata(
    (
      wss: WebSocketServer,
      ws: WebSocket,
      req: IncomingMessage,
      payload: { type: string; data: any }
    ) => req.socket.remoteAddress
  );
}

export function WsIpXForwardedFor() {
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
