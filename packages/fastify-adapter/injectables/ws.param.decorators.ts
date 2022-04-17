import { RawData, WebSocket } from "ws";
import { InjectableStore } from "nist-core/injectable-store";
import { ParamMetadata } from "../interface/ws-adapter.interface";
import { SendRawFn, SendFn } from "./interface/ws.param.decorator.interface";
import { ParamMetadataSetter } from "./_utils";
import { Constructor } from "ts-util-types";

const store = InjectableStore.getStore();
const getMetadataFn = (Target: Constructor) => store.getWsMetadata(Target);

const setter = new ParamMetadataSetter(getMetadataFn);

export function Wss() {
  return setter.set<ParamMetadata>((wss, ws, req, socket, head, payload) => wss);
}

export function Ws() {
  return setter.set<ParamMetadata>((wss, ws, req, socket, head, payload) => ws);
}

export function Send() {
  return setter.set<ParamMetadata>(
    (wss, ws, req, socket, head, payload): SendFn => {
      return (type: string, data: any) => ws.send(JSON.stringify({ type, data }));
    }
  );
}

export function SendRaw() {
  return setter.set<ParamMetadata>(
    (wss, ws, req, socket, head, payload): SendRawFn => {
      return (data: RawData | string) => ws.send(data);
    }
  );
}

export function Data() {
  return setter.set<ParamMetadata>((wss, ws, req, socket, head, payload) => payload.data);
}

export function Type() {
  return setter.set<ParamMetadata>((wss, ws, req, socket, head, payload) => payload.type);
}

export function Req() {
  return setter.set<ParamMetadata>((wss, ws, req, socket, head, payload) => req);
}

export function Url() {
  return setter.set<ParamMetadata>((wss, ws, req, socket, head, payload) => req.url);
}

export function Ip() {
  return setter.set<ParamMetadata>(
    (wss, ws, req, socket, head, payload) => req.socket.remoteAddress
  );
}

export function IpXForwardedFor() {
  return setter.set<ParamMetadata>((wss, ws, req, socket, head, payload) =>
    // TODO: WARNING: req.headers["x-forwarded-for"] may be of type string[]. Look into this
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0].trim()
  );
}
