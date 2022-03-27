import { IncomingMessage } from "http";
import * as _ from "lodash";
import { Duplex } from "stream";
import { WebSocket, WebSocketServer } from "ws";
import { IPayload } from "./interface/ws.adapter.interface";
import { IWsHandler } from "./interface/ws.handler.interface";
import WsAdapter from "./ws.adapter";

export class WsHandler implements IWsHandler {
  constructor(private wsAdapter: WsAdapter) {}

  handleServerUpgrade(
    wss: WebSocketServer,
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer
  ) {
    let url: URL;
    try {
      url = new URL(req.url as string);
      const isAllowed = this.wsAdapter.authenticate(req, url);
      if (!isAllowed)
        return this.destroySocket(socket, "HTTP/1.1 401 Unauthorized\r\n\r\n");
    } catch (error) {
      if (
        (error as Error).constructor === TypeError &&
        (error as Error).message === "Invalid Path"
      )
        return this.destroySocket(socket, "Invalid path");
      return this.destroySocket(socket);
    }

    if (!this.wsAdapter.getHandler(url.pathname))
      return this.destroySocket(socket, "Path does not exist");

    // TODO: Get some important use data from database and sent to connection => eg: 'connection', ws, req, client
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req, url);
    });
  }

  handleWsMessage<B extends boolean>(
    wss: WebSocketServer,
    ws: WebSocket,
    req: IncomingMessage,
    url: URL,
    payload: B extends true ? Buffer : string,
    isBinary: B
  ) {
    const parsedPayload = isBinary
      ? (payload as Buffer)
      : (JSON.parse(payload as string) as IPayload);
    const type = isBinary ? undefined : (parsedPayload as IPayload).type;

    const handler = this.wsAdapter.getHandler(url.pathname, type);
    handler!(wss, ws, req, url, parsedPayload, isBinary);
  }

  // heartBeatRate in ms. eg: 3000 => 3 seconds
  detectAndCloseBrokenConnection(wss: WebSocketServer, heartBeatRate = 3000) {
    const interval = setInterval(() => {
      wss.clients.forEach((ws) => {
        if ((ws as WebSocket & { isAlive: boolean }).isAlive === false)
          return ws.terminate();

        (ws as WebSocket & { isAlive: boolean }).isAlive = false;
        ws.ping();
      });
    }, heartBeatRate);

    wss.on("close", () => clearInterval(interval));
  }

  handleHeartBeat(ws: WebSocket & { isAlive: boolean }) {
    ws.on("pong", () => {
      (ws as WebSocket & { isAlive: boolean }).isAlive = true;
    });
  }

  private destroySocket(socket: Duplex, errMsg?: string) {
    socket.write(errMsg ?? "Uncaught Error");
    socket.destroy();
  }
}
