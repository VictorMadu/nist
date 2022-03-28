import { createController } from "../../core/deco-utils";
import { WsType } from "../constants/controller.adapter.constants";
import { IClassMetadata } from "./interface/ws.adapter.interface";
import { IArgs } from "./interface/ws.controller.interface";

export const WsController = createController<
  IArgs,
  IClassMetadata & { __type: typeof WsType }
>((args, classMetaData) => ({
  path: args[0],
  type: args[1],
  auth: args[2],
  heartbeat: args[3],
  __type: WsType,
}));

export default WsController;
