import { IncomingMessage } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { INonBufferPayload } from "./ws.controller.interface";

export type IPayload = { type: string; data: any };

export type IHandler = (
  wss: WebSocketServer,
  ws: WebSocket,
  req: IncomingMessage,
  payload: INonBufferPayload | Buffer,
  isBinary: boolean
) => INonBufferPayload | void;

type Metadata = {
  path: string | undefined;
  type: string | undefined;
  auth: ((req: IncomingMessage) => boolean) | undefined;
};

export type IClassMetadata = Metadata;
export type IMethodMetadata = Metadata;

export type IMethodPayload<B extends boolean> = B extends true ? Buffer : IPayload;

// TODO: Do dynamic isBinary and payload type to other functions that uses them
export type IMethodParamDecoFn<
  B extends boolean
> = (
  wss: WebSocketServer,
  ws: WebSocket,
  req: IncomingMessage,
  url: URL,
  payload: IMethodPayload<B>,
  isBinary: B
) => any;


export type IHandlerArgs< B extends boolean> = [
  wss: WebSocketServer,
  ws: WebSocket,
  req: IncomingMessage,
  url: URL,
  payload: IMethodPayload<B>,
  isBinary: B
]

export type IHandlerCb = (
  ...args: any[]
) => (...args: IHandlerArgs<boolean>) => IPayload | void