import { IncomingMessage, Server } from "http";
import * as _ from "lodash";
import { Duplex } from "stream";
import { WebSocketServer, RawData, WebSocket } from "ws";
import { AuthAndGetUserDetails, WsHandler } from "./interface";
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

export interface WssAction {
    setReq(req: IncomingMessage): WssAction;
    setSocket(socket: Duplex): WssAction;
    setHead(head: Buffer): WssAction;
    start(): void;
    stop(): void;
}

export interface WsServer extends WsServerManager, WssAction {}

export class WsManagerImpl implements WsManager {
    private wsServerManagers: Record<string, WsServer> = {};
    private req!: IncomingMessage;
    private socket!: Duplex;
    private head!: Buffer;

    constructor(private server: Server) {}

    createWssServerManager(
        path: string,
        wsServerManagerBuilder: (builder: WsServerManager) => WsServerManager
    ) {
        const wsServerManagerInstance = wsServerManagerBuilder(
            this.getWsServerManager(path)
        ) as WsServer;
        this.wsServerManagers[path] = wsServerManagerInstance;
        this.registerServerEvents();
        return this;
    }

    private getWsServerManager(path: string) {
        return this.wsServerManagers[path] ?? new WsServerManagerImpl(path);
    }

    private registerServerEvents() {
        this.server.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
            const serverManager = this.getServerManagerFromReqUrl(req.url);
            if (!serverManager) return endSocket(this.socket, "HTTP/1.1 400 Invalid path\r\n\r\n");
            serverManager.setReq(req).setSocket(socket).setHead(head).start();
        });

        this.server.on("close", () => {
            const wsServerMangers = _.values(this.wsServerManagers);
            _.forEach(wsServerMangers, (wsServerManager) => wsServerManager.stop());
        });
    }

    private getServerManagerFromReqUrl(url: string | undefined) {
        const path = this.getPathNameFromReq(url);
        if (!path) return;
        const serverManager = this.wsServerManagers[path] as WsServer | undefined;
        return serverManager;
    }

    private getPathNameFromReq(url: string | undefined) {
        return url;
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

    constructor(private path: string) {
        this.registerWssConnectionListener();
    }

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

    setReq(req: IncomingMessage): WssAction {
        this.req = req;
        return this;
    }
    setSocket(socket: Duplex): WssAction {
        this.socket = socket;
        return this;
    }
    setHead(head: Buffer): WssAction {
        this.head = head;
        return this;
    }

    async start() {
        this.userDetails = await this.authAndGetUserDetails(this.req); // TODO: turn to a clas. This does more than one thing
        if (!this.userDetails) return endSocket(this.socket, "HTTP/1.1 401 Unauthorized\r\n\r\n");
        this.wss.handleUpgrade(this.req, this.socket, this.head, (ws) => {
            this.wss.emit("connection", ws, this.req);
        });

        this.startBrokenConnectionDetection();
    }

    stop() {
        clearInterval(this.heartBeatInterval);
    }

    private registerWssConnectionListener() {
        this.wss.on("connection", (ws) => {
            this.setWsLife(ws);
            ws.on("pong", () => this.setWsLife(ws));
            ws.on("message", (data, isBinary) => {
                const parsedData = this.getParsedData(data);
                const handler = this.getHandler(parsedData.type);
                if (!handler) return;
                handler(this.wss, ws, this.req, this.socket, this.head, {
                    userData: this.userDetails as Object,
                    payload: parsedData.data,
                });
            });
        });
    }

    private startBrokenConnectionDetection() {
        this.heartBeatInterval = setInterval(() => {
            this.wss.clients.forEach((ws) => {
                if ((ws as any).isAlive === false) return ws.terminate();
                this.setWsLife(ws, false);
                ws.ping();
            });
        }, this.heartbeat);
    }

    private getHandler(type: string) {
        return this.handlers[type];
    }

    private setWsLife(ws: WebSocket, isAlive = true) {
        (ws as any).isAlive = isAlive;
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
        try {
            return this.parseStrData(data.toString());
        } catch (error) {
            return { type: DEFAULT_TYPE, data };
        }
    }
}
