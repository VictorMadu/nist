import { setParamMetadata } from "../../core/deco-utils";
import { IHandlerParamDecoFn } from "./interface/ws.adapter.interface";
import { INonBufferPayload } from "./interface/ws.controller.interface";

// TODO: All lower component classes or functions should implement the interfaces of higher component classes or functions like so

export function Wss() {
  return setParamMetadata<IHandlerParamDecoFn<boolean>>(
    (wss, ws, req, url, payload, isBinary) => wss
  );
}

export function Ws() {
  return setParamMetadata<IHandlerParamDecoFn<boolean>>(
    (wss, ws, req, url, payload, isBinary) => ws
  );
}

export function Data() {
  return setParamMetadata<IHandlerParamDecoFn<boolean>>(
    (wss, ws, req, url, payload, isBinary) =>
      isBinary ? (payload as Buffer) : (payload as INonBufferPayload).data
  );
}

export function Type() {
  return setParamMetadata<IHandlerParamDecoFn<boolean>>(
    (wss, ws, req, url, payload, isBinary) =>
      isBinary ? undefined : (payload as INonBufferPayload).type
  );
}

export function Req() {
  return setParamMetadata<IHandlerParamDecoFn<boolean>>(
    (wss, ws, req, url, payload, isBinary) => req
  );
}

export function Url() {
  return setParamMetadata<IHandlerParamDecoFn<boolean>>(
    (wss, ws, req, url, payload, isBinary) => url
  );
}

export function Ip() {
  return setParamMetadata<IHandlerParamDecoFn<boolean>>(
    (wss, ws, req, url, payload, isBinary) => req.socket.remoteAddress
  );
}

export function IpXForwardedFor() {
  return setParamMetadata<IHandlerParamDecoFn<boolean>>(
    (wss, ws, req, url, payload, isBinary) =>
      // TODO: WARNING: req.headers["x-forwarded-for"] may be of type string[]. Look into this
      (req.headers["x-forwarded-for"] as string | undefined)
        ?.split(",")[0]
        .trim()
  );
}
