import { setMethodMetadata } from "nist-core/deco-utils";
import { IMethodMetadata } from "./interface/ws.adapter.interface";

export function Type(type: string) {
  return setMethodMetadata<Required<IMethodMetadata>, "type">("type", type);
}
