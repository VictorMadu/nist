import { createController } from "nist-core/deco-utils";
import { WsType } from "../constants/controller.adapter.constants";
import { IClassMetadata } from "./interface/ws.adapter.interface";
import { IArgs } from "./interface/ws.controller.interface";

export const WsController = createController<
  IArgs,
  IClassMetadata & { __type: typeof WsType }
>((args, classMetaData) => ({
  ...args[0],
  __type: WsType,
}));

export default WsController;
