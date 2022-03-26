import { inject } from "inversify";
import "reflect-metadata";
import { Constructor } from "../types";
import { InjectableStore } from "./injectable-store";
import {
  IIndexOrPropertyDescriptor,
  IMethodName,
  ITarget,
} from "./interface/inject.interface";

export function Inject(Injectable: Constructor) {
  return function (
    Target: ITarget,
    methodName: IMethodName,
    indexOrPropertyDescriptor: IIndexOrPropertyDescriptor
  ) {
    return inject(InjectableStore.getInjectableHandler(Injectable)!.getKey())(
      Target,
      methodName,
      indexOrPropertyDescriptor
    );
  };
}

export default Inject;
