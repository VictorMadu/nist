import { InjectableStore } from "../../core/injectable-store";
import { InnerKeys, InnerValue, Constructor, Func } from "ts-util-types";

const store = InjectableStore.getStore();

export const setMethodMetadata = <R extends Record<string | symbol, any>, K extends InnerKeys<R>>(
  key: K,
  value: InnerValue<R, K>
) => {
  return (
    target: Record<string | symbol, any>,
    methodName: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    const Target = target.constructor as Constructor;
    store.getHttpMetadata(Target).setMethodMeta(methodName, key, value);
  };
};

export const setParamMetadata = <F extends Func>(fn: F) => {
  return (target: Record<string | symbol, any>, methodName: string | symbol, index: number) => {
    const Target = target.constructor as Constructor;
    store.getHttpMetadata(Target).setParamMeta(methodName, index, fn);
  };
};
