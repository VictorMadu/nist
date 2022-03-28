import { FastifyInstance } from "fastify";
import { IncomingMessage } from "http";
import { Duplex } from "stream";
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
  path?: string;
  type?: string;
  auth?: ((req: IncomingMessage) => boolean);
};

export type IClassMetadata =  {
  path?: string;
  type?: string;
  heartbeat?: number;
  auth?: ((req: IncomingMessage) => boolean);
};
export type IMethodMetadata = {
  type?: string;
};

export type IMethodPayload<B extends boolean> = B extends true ? ArrayBuffer | Buffer | Buffer[]  : IPayload;

// TODO: Do dynamic isBinary and payload type to other functions that uses them
export type IHandlerParamDecoFn<
  B extends boolean
> = (
  wss: WebSocketServer,
  ws: WebSocket,
  req: IncomingMessage,
  payload: {type: string | undefined, data: any},
) => any;


export type IHandlerArgs< B extends boolean> = [
  wss: WebSocketServer,
  ws: WebSocket,
  req: IncomingMessage,
  payload: {type: string | undefined, data: any},
]

export type IHandlerMethod<B extends boolean> = (
  ...args: IHandlerArgs<B>
) => void

export type IHandlerCbMethod<B extends boolean> = (
  ...args: any[]
) => (...args: IHandlerArgs<B>) => void


export type IAuthFn = (req: IncomingMessage) => boolean;

export interface IWssHandler {
  setType: (type: string | undefined, handler: IHandlerMethod<boolean>) => void;
  handleServerUpgrade: (
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer,
  ) => void
}

export type IWsPathObj = {
  [path: string]: [
    IAuthFn,
  ]
}