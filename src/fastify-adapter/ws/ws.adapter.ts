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

const defaultAuth = (req: IncomingMessage) => true;

export class WsAdapter {
  private wssHandlers: Record<string, IWssHandler | undefined> = {};

  constructor(private fastify: FastifyInstance) {}

  attach(
    controller: Record<string | symbol, (...args: any[]) => any>,
    methodName: string | symbol
  ) {
    const method: (...args: any[]) => void = getClassInstanceMethod(
      controller,
      methodName
    );
    const [
      baseMetadata,
      methodMetadata,
      paramsGeneratorFn,
    ] = getClassInstanceMetadatas<
      IClassMetadata,
      IMethodMetadata,
      IHandlerParamDecoFn<boolean>[]
    >(controller, methodName);

    const path = baseMetadata.path ?? "/";
    const type = baseMetadata.type
      ? baseMetadata.type + methodMetadata.type
      : methodMetadata.type;
    const heartbeat = baseMetadata.heartbeat ?? 3000; // 3000ms => 3 seconds
    const auth = baseMetadata.auth ?? defaultAuth;
    const handler = (...args: IHandlerArgs<boolean>) =>
      method(..._.map(paramsGeneratorFn, (fn) => fn(...args)));

    console.log("ws path", path);
    console.log("ws type", type);

    const wssHandler =
      this.wssHandlers[path] ?? new WssHandler(heartbeat, auth);

    wssHandler.setType(type, handler);
    this.wssHandlers[path] = wssHandler;
  }

  public handleServerUpgrade() {
    this.fastify.server.on(
      "upgrade",
      (req: IncomingMessage, socket: Duplex, head: Buffer) => {
        console.log("upgrading", req.url);
        const wssHandler = this.wssHandlers[req.url ?? ""];
        console.log("wssHandler", wssHandler);
        if (!wssHandler) this.destroySocket(socket, "Path does not exist");
        else wssHandler.handleServerUpgrade(req, socket, head);
      }
    );
  }

  private destroySocket(socket: Duplex, msg: string) {
    socket.write(msg);
    socket.destroy();
  }
}

export default WsAdapter;
