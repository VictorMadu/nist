import { inject } from "inversify";
import { INJECTABLE_KEY } from "./constant";
import { ConstructorReturnType } from "src/types";
import { Injectable } from "./injectable";
import "reflect-metadata";

type IInjectableClass = {
  new (...args: any[]): any;
  [INJECTABLE_KEY]: symbol;
};

export function Inject<T extends { new (...args: any[]): any }>(
  InjectableClass: T
) {
  return function (
    target: ConstructorReturnType<T>,
    targetKey: string,
    indexOrPropertyDescriptor: number | PropertyDescriptor
  ) {
    return inject(
      ((InjectableClass as any) as IInjectableClass)[INJECTABLE_KEY]
    )(target, targetKey, indexOrPropertyDescriptor);
  };
}

// @Injectable()
// class Me {}

// @Injectable()
// class Mee {
//   constructor(@Inject(Me) private me: Me) {}
// }
