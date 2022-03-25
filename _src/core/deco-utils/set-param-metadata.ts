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

    // TODO: In future version, eliminate the unncessary if checks by initalizing values in InjeactableStore
    _.set(injectableHandler.methodsParamDeco, methodName, [
      _.set(injectableHandler.methodsParamDeco[methodName] ?? [], index, fn),
    ]);
  };
}

export default setParamMetadata;
