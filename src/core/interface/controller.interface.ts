import {
  Constructor,
  ConstructorParamsType,
  ConstructorReturnType,
  Func,
  FuncParams,
  FuncReturn,
} from "../../types";
import { CONTROLLER_KEY, METADATA_KEY } from "../constant";
import { IBaseClass, InjectableClass } from "./injectable.interface";

export type IMetaData = {
  [key: string]: any;
};

export type IFnMetaData = {
  [key: string]: any;
};

export type IFn<F extends Func = Func, M extends IFnMetaData = IFnMetaData> = {
  (...args: FuncParams<F>): FuncReturn<F>;
  [METADATA_KEY]: M;
};

export type IMeta<M extends IMetaData = IMetaData> = { [METADATA_KEY]: M };

export interface IMethod<
  F extends Func = Func,
  MM extends IFnMetaData = IFnMetaData
> {
  [method: string | symbol]: IFn<F, MM>;
}

export type IController<
  M extends IMetaData = IMetaData,
  F extends Func = Func,
  MM extends IFnMetaData = IFnMetaData
> =
  // IMethod<F, MM> & { [METADATA_KEY]: M };
  any & { [METADATA_KEY]: M };

export type IControllerClass<
  T extends IBaseClass<IController> = IBaseClass<IController>
> = InjectableClass<T> & { [CONTROLLER_KEY]: string | symbol };
