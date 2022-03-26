import { createController } from "../../core/deco-utils";
import { WsType } from "../constants/controller.adapter.constants";
import { IArgs, IWsClassMetadata } from "./interface/ws.controller.interface";

export const WsController = createController<IArgs, IWsClassMetadata>(
  (args, classMetaData) => ({
    path: args[0],
    type: args[1],
    authentication: args[2],
    __type: WsType,
  })
);
