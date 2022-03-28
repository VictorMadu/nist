import { IncomingMessage } from "http";
import * as _ from "lodash";
import { Duplex } from "stream";
import { WebSocket, WebSocketServer } from "ws";
import { IWssHandler, IHandlerMethod } from "./interface/ws.adapter.interface";

export class WssHandler implements IWssHandler {
  private wss = new WebSocketServer({ noServer: true });
  private defaultWsHandler: IHandlerMethod<boolean> = (...args: any[]) => (
    ...args: any[]
  ) => {};
  private otherWsHandlers: Record<string, IHandlerMethod<boolean>> = {};

  constructor(
    private heartbeat: number,
    private authFn: (req: IncomingMessage) => boolean
  ) {
    this.handleOnConnection();
    this.detectAndCloseBrokenConnection();
  }

  // TODO: Inside of always passing IHandlerMethod<boolean> arguments to parameter decorator function. Why not at initial stage initalize a class that we can get all needed stuff. Same with Controllers. Check if there is significant perf different btw this and  the current implementation
  setType(type: string | undefined, handler: IHandlerMethod<boolean>) {
    if (type) this.otherWsHandlers[type] = handler;
    else this.defaultWsHandler = handler;
    console.log("wsHandlers", Object.keys(this.otherWsHandlers));
  }

  handleServerUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
    console.log("Entered handling of upgrade");
    const isAllowed = this.authFn(req);
    console.log("isAllowed", isAllowed);
    if (!isAllowed) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
    }

    // TODO: Get some important use data from database and sent to connection => eg: 'connection', ws, req, client
    this.wss.handleUpgrade(req, socket, head, (ws) => {
      console.log("emitted upgrade to connection");
      this.wss.emit("connection", ws, req);
    });
  }

  handleOnConnection() {
    this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
      this.handleHeartBeat(ws as any);
      ws.on("message", (payload, isBinary) => {
        console.log(
          `Received message ${payload} with isBinary ${isBinary} and of type ${typeof payload}`
        );

        const parsedPayload = this.getParsedPayload(payload, isBinary);
        const type = parsedPayload.type;

        const handler =
          type == null ? this.defaultWsHandler : this.otherWsHandlers[type];
        handler(this.wss, ws, req, parsedPayload);
      });
    });
  }

  private getParsedPayload(
    payload: ArrayBuffer | Buffer | Buffer[] | string,
    isBinary: boolean
  ): { type: string | undefined; data: any } {
    return isBinary
      ? { data: payload as Buffer | ArrayBuffer | Buffer[] }
      : JSON.parse(payload as string);
  }

  // heartBeatRate in ms. eg: 3000 => 3 seconds
  private detectAndCloseBrokenConnection() {
    const interval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if ((ws as WebSocket & { isAlive: boolean }).isAlive === false)
          return ws.terminate();

        (ws as WebSocket & { isAlive: boolean }).isAlive = false;
        ws.ping();
      });
    }, this.heartbeat);

    this.wss.on("close", () => clearInterval(interval));
  }

  private handleHeartBeat(ws: WebSocket & { isAlive: boolean }) {
    ws.on("pong", () => {
      (ws as WebSocket & { isAlive: boolean }).isAlive = true;
    });
  }
}
