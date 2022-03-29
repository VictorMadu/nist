import * as _ from "lodash";
import { IInjectableHandler } from "../interface/injectable-handler.interface";
import { Injectable } from "../injectable";
import {
  IClassMetadataFactoryFn,
  IConstructor,
} from "./interfaces/create-controller.interface";
import { InjectableStore } from "../injectable-store";

export function createController<
  A extends any[] = any[],
  R extends Record<string | symbol, any> = Record<string | symbol, any>
>(classMetadataFactoryFn: IClassMetadataFactoryFn<A, R>) {
  return function controller(...args: A) {
    return function classDecorator<T extends IConstructor>(Target: T) {
      const InjectableTarget = Injectable()(Target);
      const injectableHandler = InjectableStore.getInjectableHandler(
        InjectableTarget
      ) as IInjectableHandler;

      _.merge(
        injectableHandler.classMetaData,
        classMetadataFactoryFn(args, injectableHandler!.classMetaData)
      );
      return InjectableTarget;
    };
  };
}

export default createController;
