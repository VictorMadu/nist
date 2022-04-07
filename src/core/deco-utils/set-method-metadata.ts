import * as _ from "lodash";
import { IsInKeys } from "ts-types";
import { InjectableStore } from "../injectable-store";
import { IInjectableHandler } from "../interface/injectable-handler.interface";

export function setMethodMetadata<
  R extends Record<string | symbol, any>,
  K extends keyof R
>(key: K, value: R[K]) {
  return function (
    target: Record<string | symbol, any>,
    methodName: string,
    descriptor: PropertyDescriptor
  ) {
    const targetConstructor = target.constructor as {
      new (...args: any[]): any;
    };
    const injectableHandler = InjectableStore.store(
      targetConstructor
    ).getInjectableHandler(targetConstructor) as IInjectableHandler;

    _.merge(injectableHandler.methodsMetaData, {
      [methodName]: { [key]: value },
    });
  };
}

export default setMethodMetadata;
