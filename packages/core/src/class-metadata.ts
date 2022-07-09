import * as _ from "lodash";
import { Func, InnerKeys, InnerValue } from "ts-util-types";

type BaseMeta = any;
type MethodMeta = Record<string | symbol, any>;
type ParamMeta = Func[];

export interface ClassMetadata {
  getMethodNames(): (string | symbol)[];
  setBaseMeta<T extends BaseMeta>(baseMeta: T): ClassMetadata;
  getBaseMeta<T extends BaseMeta>(): T;
  setMethodMeta<R extends MethodMeta, K extends InnerKeys<R>>(
    methodName: string | symbol,
    key: InnerKeys<R>,
    value: InnerValue<R, InnerKeys<R>>
  ): ClassMetadata;
  getMethodMeta<R extends MethodMeta>(methodName: string | symbol): R;
  setParamMeta<R extends ParamMeta>(
    methodName: string | symbol,
    index: number,
    value: R[number]
  ): ClassMetadata;
  getParamMeta<R extends ParamMeta>(methodName: string | symbol): R;
}

export class ClassMetadataImpl implements ClassMetadata {
  private baseMeta: BaseMeta = {};
  private methodsMeta: Record<string | symbol, MethodMeta> = {};
  private paramsMeta: Record<string | symbol, ParamMeta> = {};

  getMethodNames() {
    const o = this.methodsMeta;
    return _.concat<string | symbol>(
      Object.getOwnPropertyNames(o),
      Object.getOwnPropertySymbols(o)
    );
  }

  setBaseMeta<T extends BaseMeta>(baseMeta: T) {
    this.baseMeta = baseMeta;
    return this;
  }

  getBaseMeta<T extends BaseMeta>(): T {
    return this.baseMeta;
  }

  setMethodMeta<R extends MethodMeta, K extends InnerKeys<R>>(
    methodName: string | symbol,
    key: K,
    value: InnerValue<R, K>
  ): ClassMetadata {
    const methodMeta = (_.get(this.methodsMeta, methodName) ?? {}) as R;
    _.set(methodMeta, key as any, value);
    _.set(this.methodsMeta, methodName, methodMeta);
    return this;
  }

  getMethodMeta<R extends MethodMeta>(methodName: string | symbol): R {
    return this.methodsMeta[methodName] as any;
  }

  setParamMeta<R extends ParamMeta>(methodName: string | symbol, index: number, value: R[number]) {
    const paramMetaArr = (_.get(this.paramsMeta, methodName) ?? []) as R;
    paramMetaArr[index] = value;
    _.set(this.paramsMeta, methodName, paramMetaArr);
    return this;
  }

  getParamMeta<R extends ParamMeta>(methodName: string | symbol): R {
    return this.paramsMeta[methodName] as any;
  }
}
