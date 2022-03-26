import { createController } from "../../core/deco-utils";
import { HttpType, WsType } from "../constants/controller.constant";
import {
  IArgs,
  IHttpClassMetadataReturn,
  IWsClassMetadataReturn,
} from "./interface/controller.interface";

export const HttpController = createController<IArgs, IHttpClassMetadataReturn>(
  (args, classMetadata) => ({
    basePath: args[0],
    __type: HttpType,
  })
);

export const WsController = createController<IArgs, IWsClassMetadataReturn>(
  (args, classMetaData) => ({
    baseType: args[0],
    __type: WsType,
  })
);
