import { IController, IMethod } from "./interface";
import { metaDecorator } from "./metaDecorator";

export function Get(path?: string) {
  return Method("GET", path);
}

export function Post(path?: string) {
  return Method("POST", path);
}

export function Put(path?: string) {
  return Method("PUT", path);
}

export function Patch(path?: string) {
  return Method("PATCH", path);
}

export function Delete(path?: string) {
  return Method("DELETE", path);
}

function Method(method: IMethod, path = "") {
  return function (
    target: Record<string | symbol, any>,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    const metaData = target[key]["$METADATA"] ?? {};
    target[key]["$METADATA"] = metaData;
    metaDecorator("method", method)(target, key, descriptor);
    metaDecorator("url", path)(target, key, descriptor);
  };
}
