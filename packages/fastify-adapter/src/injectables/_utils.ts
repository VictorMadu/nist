import { InnerKeys, InnerValue, Constructor, Func } from "ts-util-types";
import { ClassMetadata } from "nist-core/class-metadata";

export type GetMetadataFn = (Target: Constructor<any, any[]>) => ClassMetadata;

export class MethodMetadataSetter {
  constructor(private getMetadatFn: GetMetadataFn) {}

  set<R extends Record<string | symbol, any>, K extends InnerKeys<R>>(
    key: K,
    value: InnerValue<R, K>
  ) {
    return (
      target: Record<string | symbol, any>,
      methodName: string | symbol,
      descriptor: PropertyDescriptor
    ) => {
      const Target = target.constructor as Constructor;
      this.getMetadatFn(Target).setMethodMeta(methodName, key, value);
    };
  }
}

export class ParamMetadataSetter {
  constructor(private getMetadatFn: GetMetadataFn) {}

  set<F extends Func>(fn: F) {
    return (target: Record<string | symbol, any>, methodName: string | symbol, index: number) => {
      const Target = target.constructor as Constructor;
      this.getMetadatFn(Target).setParamMeta(methodName, index, fn);
    };
  }
}
