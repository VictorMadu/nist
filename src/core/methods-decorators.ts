import { IHttpMethod } from "./interface/method.interface";
import { metaMethodDecorator } from "./metaDecorator";

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

function Method(method: IHttpMethod, path = "") {
  return function (
    target: Record<string | symbol, any>,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    metaMethodDecorator("method", method)(target, key, descriptor);
    metaMethodDecorator("path", path)(target, key, descriptor);
  };
}

// FOR WS
export function SubType(type?: string) {
  return function (
    target: Record<string | symbol, any>,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    metaMethodDecorator("subType", type)(target, key, descriptor);
  };
}
