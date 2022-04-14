import { createController } from "nist-core/deco-utils";
import { HttpType } from "../constants/controller.adapter.constants";
import { IHttpClassMetadata } from "./interface/http.adapter.interface";
import { IArgs } from "./interface/http.controller.interface";

export const HttpController = createController<IArgs, IHttpClassMetadata>(
  (args, classMetadata) => ({
    path: args[0] ?? "",
    __type: HttpType,
  })
);

export default HttpController;
