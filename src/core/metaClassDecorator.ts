import { Constructor } from "src/types";
import { DECO_CLASS_KEY, INJECTABLE_KEY, METADATA_KEY } from "./constant";
import { Injectable } from "./injectable";
import { IControllerMetadata, Injectable as IInjectable } from "./interface";
import { IclassMetaDecorator } from "./interface/metaClassDecorator.interface";

export type IReturnTypeFn<
  T extends Record<string, any> = Record<string, any>
> = {
  new (...args: any[]): {
    [METADATA_KEY]: Record<string, any>;
  } & any;
  [INJECTABLE_KEY]: symbol;
};

// classKey for noting which type of decorator wrapped the class
export function createInjectable<
  T extends any[] = any[],
  U extends Record<string, any> = Record<string, any>
>(classKey: string | symbol, classMetaDecorator: IclassMetaDecorator<T>) {
  return function (...decoArgs: T) {
    return function (TargetClass: Constructor): IReturnTypeFn<U> {
      return class extends Injectable()(TargetClass) {
        static [DECO_CLASS_KEY] = classKey;
        [METADATA_KEY]: IControllerMetadata[typeof METADATA_KEY];
        constructor(...args: any[]) {
          super(...args);
          classMetaDecorator(this, decoArgs);
        }
      };
    };
  };
}
