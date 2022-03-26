import { createController } from "../../core/deco-utils";
import { WsType } from "../constants/controller.adapter.constants";
import { IWsClassMetadata } from "./interface/ws.controller.interface";

export const WsController = createController<any[], IWsClassMetadata>(
  (args, classMetaData) => ({
    baseType: args[0],
    __type: WsType,
  })
);
