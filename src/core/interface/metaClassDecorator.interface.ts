export type IclassMetaDecorator<T extends any[] = any[]> = (
  context: object,
  decoArgs: T
) => void;
