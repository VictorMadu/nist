import { METADATA_KEY } from "./constant";
import { IController, IHandlerMetaData } from "./interface";

export function metaDecorator(metaKey: string | symbol, metaValue: any) {
  return function (
    target: {
      [key: string]: {
        [METADATA_KEY]: Record<string | symbol, any>;
      };
    },
    key: string,
    descriptor: PropertyDescriptor
  ) {
    target[key]["$METADATA"][metaKey] = metaValue;
  };
}
