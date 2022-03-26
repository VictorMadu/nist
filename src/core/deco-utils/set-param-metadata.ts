import * as _ from "lodash";
import { InjectableStore } from "../injectable-store";
import { IInjectableHandler } from "../interface/injectable-handler.interface";

export function setParamMetadata(fn: Function) {
  return function (
    target: Record<string | symbol, any>,
    methodName: string | symbol,
    index: number
  ) {
    const targetConstructor = target.constructor as {
      new (...args: any[]): any;
    };
    const injectableHandler = InjectableStore.store(
      targetConstructor
    ).getInjectableHandler(targetConstructor) as IInjectableHandler;

    const arr = injectableHandler.methodsParamDeco[methodName] ?? [];
    console.log("fn", typeof fn);
    arr[index] = fn;
    injectableHandler.methodsParamDeco[methodName] = arr;
  };
}

export default setParamMetadata;
