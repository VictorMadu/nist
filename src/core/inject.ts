import { inject } from "inversify";
import "reflect-metadata";
import { INJECTABLE_KEY } from "./constant";

export function Inject<T extends { new (...args: any[]): any }>(
  InjectableClass: T
) {
  return function (
    target: T,
    targetKey: string,
    indexOrPropertyDescriptor: number | PropertyDescriptor
  ) {
    return inject(
      ((InjectableClass as any) as {
        new (...args: any[]): any;
        [INJECTABLE_KEY]: symbol;
      })[INJECTABLE_KEY]
    )(target, targetKey, indexOrPropertyDescriptor);
  };
}
