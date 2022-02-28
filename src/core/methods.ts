import { IController, IMethod } from "./interface";

export function Get(path: string) {
  return Method("GET", path);
}

export function Post(path: string) {
  return Method("POST", path);
}

export function Put(path: string) {
  return Method("PUT", path);
}

export function Patch(path: string) {
  return Method("PATCH", path);
}

export function Delete(path: string) {
  return Method("DELETE", path);
}

function Method(method: IMethod, path: string) {
  return function (
    target: IController,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    const metaData = target[key]["$METADATA"] ?? {};
    metaData.method = method;
    metaData.url = path;
    target[key]["$METADATA"] = metaData;
  };
}
