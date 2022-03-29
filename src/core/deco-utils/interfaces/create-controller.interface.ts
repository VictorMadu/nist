export type IClassMetadataFactoryFn<
  A extends any[],
  R extends Record<string | symbol, any>
> = (args: A, classMetaData: Record<string | symbol, any>) => R;

export type IConstructor = new (...args: any[]) => any;
