import { IncomingMessage } from "http";
import _ from "lodash";
import WebSocket, { createWebSocketStream, WebSocketServer } from "ws";
import { IPayload } from "./interface/ws.adapter.interface";

export class WsAdapter {
  // store the types and handler
  // when called
  static typesAndHandlers: Record<
    string,
    | ((
        wss: WebSocketServer,
        ws: WebSocket,
        req: IncomingMessage,
        payload: { type: string; data: any }
      ) => { type: string; data: any } | void)
    | undefined
  > = {};

  attach(
    method: Function,
    controllerMetadata: { baseType: string },
    methodMetadata: { subType: string },
    methodsParamsDecoFn: ((
      wss: WebSocketServer,
      ws: WebSocket,
      req: IncomingMessage,
      payload: { type: string; data: any }
    ) => any)[]
  ) {
    WsAdapter.typesAndHandlers[
      controllerMetadata.baseType + methodMetadata.subType
    ] = (
      wss: WebSocketServer,
      ws: WebSocket,
      req: IncomingMessage,
      payload: { type: string; data: any }
    ) =>
      method(..._.map(methodsParamsDecoFn, (fn) => fn(wss, ws, req, payload)));
  }

  // ws.on('message', call this method)
  handle(
    wss: WebSocketServer,
    ws: WebSocket,
    req: IncomingMessage,
    payload: IPayload
  ) {
    const handler = WsAdapter.typesAndHandlers[payload.type];
    if (!handler) {
      ws.send(JSON.stringify({ type: "ERROR", data: "Unsupported type" }), {
        binary: true,
      });
      return;
    }
  }
}

export default WsAdapter;
