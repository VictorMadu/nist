import * as _ from "lodash";
import { InjectableStore } from "../injectable-store";
import { IInjectableHandler } from "../interface/injectable-handler.interface";

export function setMethodMetadata(key: string | symbol, value: any) {
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
