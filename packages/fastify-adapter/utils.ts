import { InjectableStore, InjectableHandler } from "nist-core";
import * as _ from "lodash";
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

/**
 *
 * Returns all the methods of a given Class including those of its ancestors or super class
 */

export const getAllClassMethodsName = (Class: Function) => {
  const getMethods = (e: any) => [
    ..._.filter(Object.getOwnPropertyNames(e), (f) => f != "constructor"),
    ...Object.getOwnPropertySymbols(e),
  ];

  const _recursive = (
    current: any,
    arrayOfMethod: (string | symbol)[]
  ): (string | symbol)[] => {
    if (current.__proto__.constructor.prototype.__proto__ == null)
      return arrayOfMethod;
    return _recursive(
      current.__proto__.constructor.prototype,
      _.concat(arrayOfMethod, getMethods(current.__proto__))
    );
  };

  return _recursive(Class.prototype, getMethods(Class.prototype));
};

export const throwError = (error: string | Error) => {
  throw error;
};
