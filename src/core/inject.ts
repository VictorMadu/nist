import { inject } from "inversify";
import "reflect-metadata";

export default function Inject<T extends { new (...args: any[]): any }>(
  InjectableClass: T
) {
  return function (
    target: T,
    targetKey: string,
    indexOrPropertyDescriptor: number | PropertyDescriptor
  ) {
    return inject(
      ((InjectableClass as any) as { new (...args: any[]): any; $KEY: symbol })
        .$KEY
    )(target, targetKey, indexOrPropertyDescriptor);
  };
}
