import { getClassInstanceMethod, getClassInstanceMetadatas } from "../utils";
import { IncomingMessage } from "http";
import _ from "lodash";
import {
  IClassMetadata,
  IHandlerArgs,
  IMethodMetadata,
  IHandlerParamDecoFn,
  IHandlerMethod,
  IWssHandler,
} from "./interface/ws.adapter.interface";
import { WssHandler } from "./ws.handler";
import { FastifyInstance } from "fastify";
import { Duplex } from "stream";
import { WebSocket } from "ws";

const defaultAuth = (req: IncomingMessage) => true;
const defaultWsEventEmitter = (ws: WebSocket) => {};

export class WsAdapter {
  private wssHandlers: Record<string, IWssHandler | undefined> = {};

  constructor(private fastify: FastifyInstance) {}

  attach(
    controller: Record<string | symbol, (...args: any[]) => any>,
    methodName: string | symbol
  ) {
    const handlerFn: (...args: any[]) => void = getClassInstanceMethod(
      controller,
      methodName
    );
    const [
      baseMetadata,
      methodMetadata,
      paramGeneratorFns,
    ] = getClassInstanceMetadatas<
      IClassMetadata,
      IMethodMetadata,
      IHandlerParamDecoFn[]
    >(controller, methodName);

    const path = baseMetadata.path ?? "/";
    const type = baseMetadata.type
      ? baseMetadata.type + methodMetadata.type
      : methodMetadata.type;
    const heartbeat = baseMetadata.heartbeat ?? 3000; // 3000ms => 3 seconds
    const auth = baseMetadata.auth ?? defaultAuth;
    const handler = (...args: IHandlerArgs<boolean>) =>
      handlerFn(..._.map(paramGeneratorFns, (fn) => fn(...args)));
    const wsEventEmitter = baseMetadata.eventEmitter ?? defaultWsEventEmitter;
    const wssHandler =
      this.wssHandlers[path] ?? new WssHandler(heartbeat, auth, wsEventEmitter);

    wssHandler.setType(type, handler);
    this.wssHandlers[path] = wssHandler;
  }
  public handleServerUpgrade() {
    const handlerFn = this.onServerUgrade.bind(this);
    this.fastify.server.on("upgrade", handlerFn);
  }

  private onServerUgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
    const wssHandler = this.wssHandlers[req.url ?? ""];
    if (!wssHandler) this.destroySocket(socket, "Path does not exist");
    else wssHandler.handleServerUpgrade(req, socket, head);
  }

  private destroySocket(socket: Duplex, msg: string) {
    socket.write(msg);
    socket.destroy();
  }
}

export default WsAdapter;
