import { METADATA_KEY } from "./constant";
import { IController, IHandlerMetaData } from "./interface";
import { setMetaData } from "./utils";

export function metaDecorator(metaKey: string, metaValue: any) {
  return function (
    target: {
      [key: string]: {
        [METADATA_KEY]: Record<string, any>;
      };
    },
    key: string,
    descriptor: PropertyDescriptor
  ) {
    setMetaData(target[key], metaKey, metaValue);
  };
}
