import { setParamMetadata } from "nist-core/deco-utils";
import { IHandlerParamDecoFn } from "./interface/ws.adapter.interface";
import { ISend } from "./interface/ws.param.decorator.interface";

// TODO: All lower component classes or functions should implement the interfaces of higher component classes or functions like so

export function Wss() {
  return setParamMetadata<IHandlerParamDecoFn>((wss, ws, req, payload) => wss);
}

export function Ws() {
  return setParamMetadata<IHandlerParamDecoFn>((wss, ws, req, payload) => ws);
}

export function Send() {
  return setParamMetadata<IHandlerParamDecoFn>((wss, ws, req, payload) => {
    return ((obj, isBinary) => {
      ws.send(JSON.stringify(obj), { binary: isBinary });
    }) as ISend;
  });
}

export function Data() {
  return setParamMetadata<IHandlerParamDecoFn>(
    (wss, ws, req, payload) => payload.data
  );
}

export function Type() {
  return setParamMetadata<IHandlerParamDecoFn>(
    (wss, ws, req, payload) => payload.type
  );
}

export function Req() {
  return setParamMetadata<IHandlerParamDecoFn>((wss, ws, req, payload) => req);
}

export function Url() {
  return setParamMetadata<IHandlerParamDecoFn>(
    (wss, ws, req, payload) => req.url
  );
}

export function Ip() {
  return setParamMetadata<IHandlerParamDecoFn>(
    (wss, ws, req, payload) => req.socket.remoteAddress
  );
}

export function IpXForwardedFor() {
  return setParamMetadata<IHandlerParamDecoFn>((wss, ws, req, payload) =>
    // TODO: WARNING: req.headers["x-forwarded-for"] may be of type string[]. Look into this
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0].trim()
  );
}
