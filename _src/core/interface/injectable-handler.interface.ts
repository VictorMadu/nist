export type IClassMetadata = Record<string | symbol, any>;

export type IMethodsMetadata = Record<
  string | symbol,
  Record<string | symbol, any>
>;

export type IMethodsParamDeco = Record<string | symbol, Function[]>;

export interface IInjectableHandler {
  classMetaData: IClassMetadata; // eg: overall and constructor
  methodsMetaData: IMethodsMetadata;
  methodsParamDeco: IMethodsParamDeco;
  getKey: () => symbol;
}
