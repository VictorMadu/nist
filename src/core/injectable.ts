import { injectable } from "inversify";
import "reflect-metadata";
import { INJECTABLE_KEY } from "./constant";

/**
 *
 * Decorator function that takes nothing as argument, It is used to to adding a static key prop to a class to be injectable so that Module can use it to bind to injection container
 */
export function Injectable() {
  return function (TargetClass: {
    new (...args: any[]): any;
  }): { new (...args: any[]): any; [INJECTABLE_KEY]: symbol } {
    return injectable()(
      class extends injectable()(TargetClass) {
        static [INJECTABLE_KEY] = Symbol();
        constructor(...args: any[]) {
          super(...args);
        }
      }
    );
  };
}
