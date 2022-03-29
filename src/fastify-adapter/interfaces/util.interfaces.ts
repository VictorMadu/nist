export type IBaseMetadata = Record<string | symbol, any>;

export type IMethodMetadata = Record<string | symbol, any>;

export type IParamMetadata = Function[];

export type IMethodName = string | symbol;

export type IClassInstance<T extends Function = Function> = Record<
  IMethodName,
  T
>;
