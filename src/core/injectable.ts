import { injectable } from "inversify";
import "reflect-metadata";
import { INJECTABLE_KEY } from "./constant";
import { IBaseClass, InjectableClass } from "./interface/injectable.interface";

/**
 *
 * Decorator function that takes nothing as argument, It is used to to adding a static key prop to a class to be injectable so that Module can use it to bind to injection container
 */
export function Injectable() {
  return function <T extends IBaseClass = IBaseClass>(
    TargetClass: T
  ): InjectableClass<T> {
    return injectable()(
      class extends injectable()(TargetClass as IBaseClass) {
        static [INJECTABLE_KEY] = Symbol();
        constructor(...args: any[]) {
          super(...args);
        }
      }
    ) as InjectableClass<T>;
  };
}
