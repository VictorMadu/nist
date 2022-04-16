import { IncomingMessage, Server } from "http";
import { AuthAndGetUserDetails, WsHandler } from "./interface";
import { WebSocketServer, RawData } from "ws";
import { Duplex } from "stream";
import * as _ from "lodash";
import { endSocket } from "./_utils";

export interface WsManager {
  createWssServerManager(
    path: string,
    wsServerManager: (builder: WsServerManager) => WsServerManager
  ): WsManager;
}

export interface WsServerManager {
  setHeartbeat(heartbeat: number): WsServerManager;
  setAuthAndGetUserDetails(heartbeat: AuthAndGetUserDetails): WsServerManager;
  setHandler(type: string, fn: WsHandler): WsServerManager;
}

export interface WssCtxSetter {
  setReq(req: IncomingMessage): WssCtxSetter;
  setSocket(socket: Duplex): WssCtxSetter;
  setHead(head: Buffer): WssCtxSetter;
}

export interface WssAction {
  start(): void;
  stop(): void;
}

export interface WsServer extends WsServerManager, WssCtxSetter, WssAction {}

export class WsManagerImpl implements WsManager {
  private wsServerManagers: Record<string, WsServer> = {};
  private req!: IncomingMessage;
  private socket!: Duplex;
  private head!: Buffer;

  constructor(private server: Server) {
    this.registerServerEvents();
  }

  createWssServerManager(
    path: string,
    wsServerManagerBuilder: (builder: WsServerManager) => WsServer
  ) {
    const wsServerManagerInstance = wsServerManagerBuilder(new WsServerManagerImpl(path));
    wsServerManagerInstance.start();
    this.wsServerManagers[path] = wsServerManagerInstance;

    return this;
  }

  private registerServerEvents() {
    this.server.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
      this.setWsCtx(req, socket, head);
      this.handleUpgrade();
    });

    this.server.on("close", () => {
      const wsServerMangers = _.values(this.wsServerManagers);
      _.forEach(wsServerMangers, (wsServerManager) => wsServerManager.stop());
    });
  }

  private setWsCtx(req: IncomingMessage, socket: Duplex, head: Buffer) {
    this.req = req;
    this.socket = socket;
    this.head = head;
  }

  private handleUpgrade() {
    const serverManager = this.getServerManager();
    if (!serverManager) return endSocket(this.socket, "HTTP/1.1 400 Invalid path\r\n\r\n");
    serverManager.start();
  }

  private getServerManager() {
    const path = this.getPathName();
    if (!path) return;
    const serverManager = this.wsServerManagers[path] as WsServer | undefined;
    return serverManager;
  }

  private getPathName() {
    try {
      if (!this.req.url) return undefined;
      return new URL(this.req.url).pathname;
    } catch (error) {
      return undefined;
    }
  }
}

const DEFAULT_TYPE = "";
export class WsServerManagerImpl implements WsServer {
  private heartbeat!: number;
  private authAndGetUserDetails!: AuthAndGetUserDetails;
  private handlers: Record<string, WsHandler> = {};
  private wss = new WebSocketServer({ noServer: true });

  private req!: IncomingMessage;
  private socket!: Duplex;
  private head!: Buffer;
  private userDetails: Object | null | undefined = undefined;
  private heartBeatInterval!: NodeJS.Timer;

  constructor(private path: string) {}

  setHeartbeat(heartbeat: number): WsServerManager {
    this.heartbeat = heartbeat;
    return this;
  }
  setAuthAndGetUserDetails(authAndGetUserDetails: AuthAndGetUserDetails): WsServerManager {
    this.authAndGetUserDetails = authAndGetUserDetails;
    return this;
  }

  setHandler(type: string, fn: WsHandler): WsServerManager {
    this.handlers[type] = fn;
    return this;
  }

  setReq(req: IncomingMessage): WssCtxSetter {
    this.req = req;
    return this;
  }
  setSocket(socket: Duplex): WssCtxSetter {
    this.socket = socket;
    return this;
  }
  setHead(head: Buffer): WssCtxSetter {
    this.head = head;
    return this;
  }

  async start() {
    this.userDetails = await this.authAndGetUserDetails(this.req); // TODO: turn to a clas. This does more than one thing
    if (!this.userDetails) return endSocket(this.socket, "HTTP/1.1 401 Unauthorized\r\n\r\n");

    this.wss.on("connection", async (ws) => {
      ws.on("message", (data, isBinary) => {
        const parsedData = this.getParsedData(data);
        const handler = this.getHandler(parsedData.type);
        if (!handler) return;
        handler(this.wss, ws, this.req, this.socket, this.head, this.userDetails);
      });
    });
  }

  stop() {
    clearInterval(this.heartBeatInterval);
  }

  private startBrokenConnectionDetection() {
    this.heartBeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if ((ws as any).isAlive === false) return ws.terminate();
        (ws as any).isAlive = false;
        ws.ping();
      });
    }, this.heartbeat);
  }

  private getHandler(type: string) {
    return this.handlers[type];
  }

  private getParsedData(data: RawData): { type: string; data: any } {
    try {
      if (typeof data === "string") return this.parseStrData(data);
      return this.parseBufferData(data);
    } catch (error) {
      return { type: DEFAULT_TYPE, data: undefined };
    }
  }

  private parseStrData(data: string): { type: string; data: any } {
    const parsed = JSON.parse(data) as { type?: string; data: any } | any;
    const parsedType = parsed.type || DEFAULT_TYPE;
    const parsedData = parsed.data || parsed;

    return { type: parsedType, data: parsedData };
  }

  private parseBufferData(data: Buffer | ArrayBuffer | Buffer[]) {
    return { type: DEFAULT_TYPE, data };
  }
}
