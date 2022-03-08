import { IController } from "./interface/controller.interface";
import { IBase } from "./interface/injectable.interface";
import { IMetadata, IParamsMetadata } from "./interface/utils.interface";
import { getFromMetaData, getMethodParamsMetaData } from "./utils";

export function getControllerMetadata<M extends IMetadata = IMetadata>(
  controller: IController<M>,
  key?: string
) {
  return getFromMetaData(controller, key);
}

export function getControllerMethodMetadata<
  M extends IMetadata = IMetadata,
  C extends IBase = IBase
>(controller: IController, methodName: string | symbol, key?: string) {
  const method = controller[methodName];
  return getFromMetaData(method, key);
}

export function getControllerMethodParamsMetadata<
  M extends IParamsMetadata = IParamsMetadata,
  C extends IBase = IBase
>(controller: IController, methodName: string | symbol, key?: string) {
  const method = controller[methodName];
  return getMethodParamsMetaData(method, key);
}
