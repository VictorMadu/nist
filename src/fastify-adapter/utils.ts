import { InjectableStore, InjectableHandler } from "../core";
import { Constructor } from "./interfaces/controller.adapter.interfaces";
import {
  IBaseMetadata,
  IClassInstance,
  IMethodMetadata,
  IMethodName,
  IParamMetadata,
} from "./interfaces/util.interfaces";

export function getClassInstanceMethod<T extends Function>(
  classIntance: IClassInstance<T>,
  methodName: IMethodName
): T {
  return classIntance[methodName].bind(classIntance);
}

export function getClassInstanceMetadatas<
  B extends IBaseMetadata = IBaseMetadata,
  M extends IMethodMetadata = IMethodMetadata,
  P extends IParamMetadata = IParamMetadata
>(classIntance: IClassInstance, methodName: IMethodName): [B, M, P] {
  const controllerClass = classIntance.constructor as Constructor;
  const metadata = InjectableStore.getInjectableHandler(
    controllerClass
  ) as InjectableHandler;
  const baseMetadata = metadata.classMetaData as B;
  const methodMetadata = metadata.methodsMetaData[methodName] as M;
  const paramMetadata = metadata.methodsParamDeco[methodName] as P;

  return [baseMetadata, methodMetadata, paramMetadata];
}
