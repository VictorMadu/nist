import { RawData, WebSocket } from "ws";
import { ParamMetadata } from "../interface/ws-adapter.interface";
import { setParamMetadata } from "./_utils";

export function Wss() {
  return setParamMetadata<ParamMetadata>((wss, ws, req, socket, head, payload) => wss);
}

export function Ws() {
  return setParamMetadata<ParamMetadata>((wss, ws, req, socket, head, payload) => ws);
}

export function Send() {
  return setParamMetadata<ParamMetadata>((wss, ws, req, socket, head, payload) => {
    return (type: string, data: any) => ws.send(JSON.stringify({ type, data }));
  });
}

export function SendBuf() {
  return setParamMetadata<ParamMetadata>((wss, ws, req, socket, head, payload) => {
    return (data: Exclude<RawData, string>) => ws.send(data);
  });
}

export function Data() {
  return setParamMetadata<ParamMetadata>((wss, ws, req, socket, head, payload) => payload.data);
}

export function Type() {
  return setParamMetadata<ParamMetadata>((wss, ws, req, socket, head, payload) => payload.type);
}

export function Req() {
  return setParamMetadata<ParamMetadata>((wss, ws, req, socket, head, payload) => req);
}

export function Url() {
  return setParamMetadata<ParamMetadata>((wss, ws, req, socket, head, payload) => req.url);
}

export function Ip() {
  return setParamMetadata<ParamMetadata>(
    (wss, ws, req, socket, head, payload) => req.socket.remoteAddress
  );
}

export function IpXForwardedFor() {
  return setParamMetadata<ParamMetadata>((wss, ws, req, socket, head, payload) =>
    // TODO: WARNING: req.headers["x-forwarded-for"] may be of type string[]. Look into this
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0].trim()
  );
}
