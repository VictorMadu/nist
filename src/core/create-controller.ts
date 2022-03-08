import {
  Constructor,
  ConstructorParamsType,
  ConstructorReturnType,
} from "../types";
import { CONTROLLER_KEY, INJECTABLE_KEY, METADATA_KEY } from "./constant";
import { Injectable } from "./injectable";
import {
  IController,
  IControllerClass,
  IMetaData,
} from "./interface/controller.interface";
import { IMetadataFn } from "./interface/create-controller.interface";
import { IBaseClass } from "./interface/injectable.interface";

// classKey for noting which type of decorator wrapped the class
export function createController<
  M extends IMetaData = IMetaData,
  C extends any[] = any[]
>(controllerKey: string | symbol, metaDataFactory: IMetadataFn<M, C>) {
  return function (...decoArgs: C) {
    return function <
      T extends IBaseClass<IController> = IBaseClass<IController>
    >(TargetClass: T | any): IControllerClass<T> {
      return class extends Injectable()(
        TargetClass as IBaseClass<IController>
      ) {
        static [CONTROLLER_KEY] = controllerKey;
        [METADATA_KEY]: any;
        constructor(...args: ConstructorParamsType<IBaseClass<IController>>) {
          super(...args);
          this[METADATA_KEY] = ((metaDataFactory as unknown) as IMetadataFn)(
            ...decoArgs
          );
        }
      } as IControllerClass<T>;
    };
  };
}
