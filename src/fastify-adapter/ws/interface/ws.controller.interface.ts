import { IncomingMessage } from "http";
import { WsType } from "../../constants/controller.adapter.constants";

export type IWsClassMetadata =  {
  path: string | undefined;
  type: string | undefined;
  auth: ((req: IncomingMessage) => boolean) | undefined;
  __type: typeof WsType;
};

export type IArgs = [path?: string, type?: string, auth?: (req: IncomingMessage) => boolean];

export type INonBufferPayload = {type: string, data: any}