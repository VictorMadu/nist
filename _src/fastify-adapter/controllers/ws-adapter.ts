import { IncomingMessage } from "http";
import _ from "lodash";
import WebSocket, { createWebSocketStream, WebSocketServer } from "ws";
import { IPayload } from "./interface/controller-adapter.interface";

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
    const filePath = path.join(
      "C:/Users/EBUBE/Videos/Forex/Forex Trading Course  (LEARN TO TRADE STEP BY STEP) ( 480 X 854 ).mp4"
    );
    const result = handler(wss, ws, req, payload);
    // TODO: Error Handle
    const duplex = createWebSocketStream(ws);
    duplex.write("Hello world");
    // duplex.end();
    duplex.write("Hello world1");
    duplex.end();
    // fs.createReadStream(filePath).pipe(duplex);
    // if (result) ws.send(Buffer.from(JSON.stringify(result), "binary"));
  }
}
import * as fs from "fs";
import * as path from "path";

export default WsAdapter;

const d = {
  data: { type: "cat:change", data: { data: "d", fromServiceOne: "md" } },
  video: { type: "Buffer", data: [102, 102, 102] },
};
