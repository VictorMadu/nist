import { inject } from "inversify";
import "reflect-metadata";
import { InjectableStore } from "./injectable-store";

export function Inject(Injectable: { new (...args: any[]): any }) {
  return function (
    Target: { new (...args: any[]): Record<string | symbol, Function> },
    methodName: string | symbol,
    indexOrPropertyDescriptor: number | PropertyDescriptor
  ) {
    return inject(InjectableStore.getInjectableHandler(Injectable)!.getKey())(
      Target,
      methodName,
      indexOrPropertyDescriptor
    );
  };
}

export default Inject;
