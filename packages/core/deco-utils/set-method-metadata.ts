import * as _ from "lodash";
import { IsInKeys, InnerKeys, InnerValue } from "ts-util-types";
import { InjectableStore } from "../injectable-store";
import { IInjectableHandler } from "../interface/injectable-handler.interface";

export function setMethodMetadata<
  R extends Record<string | symbol, any>,
  K extends InnerKeys<R>
>(key: K, value: InnerValue<R, K>) {
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

    const methodMetadata =
      _.get(injectableHandler.methodsMetaData, methodName) ?? {};
    _.set(methodMetadata, key as string, value);
    _.set(injectableHandler.methodsMetaData, methodName, methodMetadata);
  };
}

export default setMethodMetadata;
