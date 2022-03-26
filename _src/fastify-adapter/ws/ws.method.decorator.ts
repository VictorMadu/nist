import { setMethodMetadata } from "../../core/deco-utils";

export function SubType(type?: string) {
  return function (
    target: Record<string | symbol, any>,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    setMethodMetadata("subType", type)(target, key, descriptor);
  };
}
