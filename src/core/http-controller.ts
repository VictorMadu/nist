import { HTTP_CONTROLLER_KEY } from "./constant";
import { createController } from "./create-controller";
import { IMetaData } from "./interface/controller.interface";
import { IDecoArgs } from "./interface/http-controller.interface";

export type IReturnTypeControllerFn = ReturnType<
  ReturnType<typeof HttpController>
>;

export const HttpController = createController<IMetaData, IDecoArgs>(
  HTTP_CONTROLLER_KEY,
  (...constructorArgs) => ({
    path: constructorArgs[0] ?? "",
  })
);
