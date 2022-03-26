import { createController } from "../../core/deco-utils";
import { HttpType } from "../constants/controller.adapter.constants";
import { IHttpClassMetadata } from "./interface/http.controller.interface";

export const HttpController = createController<any[], IHttpClassMetadata>(
  (args, classMetadata) => ({
    basePath: args[0],
    __type: HttpType,
  })
);

export default HttpController;
