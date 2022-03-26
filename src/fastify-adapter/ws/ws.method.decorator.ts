import { IncomingMessage } from "http";
import { setMethodMetadata } from "../../core/deco-utils";

export function Type(type: string) {
  return setMethodMetadata("type", type);
}

export function Path(path: string) {
  return setMethodMetadata("path", path);
}

export function Auth(fn: (req: IncomingMessage, url: URL) => boolean) {
  return setMethodMetadata("auth", fn);
}
