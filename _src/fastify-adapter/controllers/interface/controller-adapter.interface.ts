import { HttpType, WsType } from "../constants/controller.constant";

export type ControllerTypes = typeof HttpType | typeof WsType;

export type Constructor = { new (...args: any[]): any };

export type IParamArgs = [any, any, any, any];

export type IPayload = { type: string; data: any };

export type IMethodName = string | symbol;

export type IControllerInstance = Record<IMethodName, Function>;

export type IControllerMetadata = Record<IMethodName, any> & {
  __type: ControllerTypes;
};

export type IControllerMethodMetadata = Record<
  string | symbol,
  Record<string | symbol, any>
>;

export type IControllerMethodParamMetadata = Function[];
