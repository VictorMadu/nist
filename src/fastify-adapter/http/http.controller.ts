import { createController } from "../../core/deco-utils";
import { HttpType } from "../constants/controller.adapter.constants";
import {
  IArgs,
  IHttpClassMetadata,
} from "./interface/http.controller.interface";

export const HttpController = createController<IArgs, IHttpClassMetadata>(
  (args, classMetadata) => ({
    basePath: args[0],
    __type: HttpType,
  })
);

export default HttpController;
