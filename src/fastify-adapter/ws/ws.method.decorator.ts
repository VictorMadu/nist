import { IncomingMessage } from "http";
import { setMethodMetadata } from "../../core/deco-utils";
import { IMethodMetadata } from "./interface/ws.adapter.interface";

export function Type(type: string) {
  return setMethodMetadata<Required<IMethodMetadata>, "type">("type", type);
}

// export function Path(path: string) {
//   return setMethodMetadata<Required<IMethodMetadata>, "path">("path", path);
// }

// export function Auth(fn: (req: IncomingMessage, url: URL) => boolean) {
//   return setMethodMetadata<Required<IMethodMetadata>, "auth">("auth", fn);
// }
