import { IController, IHandlerMetaData } from "./interface";

export function metaDecorator(
  metaKey: string | symbol,
  fn: (metaData: IHandlerMetaData) => void
) {
  return function (
    target: IController,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    fn(target[key]["$METADATA"]);
  };
}
