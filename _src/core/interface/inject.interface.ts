import { Constructor } from "../../types";

export type ITarget = Constructor<Record<string | symbol, Function>>;
export type IMethodName = string | symbol;
export type IIndexOrPropertyDescriptor = number | PropertyDescriptor;
