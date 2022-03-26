import { IncomingMessage } from "http";
import { WsType } from "../../constants/controller.adapter.constants";

export type IWsClassMetadata =  {
  path?: string;
  type?: string;
  authentication?: (req: IncomingMessage) => boolean;
  __type: typeof WsType;
};

export type IArgs = [path?: string, type?: string, authentication?: (req: IncomingMessage) => boolean]