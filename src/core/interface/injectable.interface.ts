import {
  Constructor,
  ConstructorParamsType,
  ConstructorReturnType,
  Func,
} from "src/types";
import { INJECTABLE_KEY } from "../constant";

export interface IBaseClass<T extends IBase = IBase, A extends any[] = any[]> {
  new (...args: A): T;
}

export type IBase = Record<string | symbol, any>;
// export type IBase = Record<string | symbol, Func>;

export interface InjectableClass<C extends IBaseClass = IBaseClass> {
  new (...args: ConstructorParamsType<C>): ConstructorReturnType<C>;
  [INJECTABLE_KEY]: symbol;
}

export type InferBaseClass<T extends Constructor> = {
  new (...args: ConstructorParamsType<T>): ConstructorReturnType<T>;
};
