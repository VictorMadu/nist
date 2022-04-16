import { MethodMetadata } from "../interface/ws-adapter.interface";
import { setMethodMetadata } from "./_utils";

export function Type(type: string) {
  return setMethodMetadata<Required<MethodMetadata>, "type">("type", type);
}
