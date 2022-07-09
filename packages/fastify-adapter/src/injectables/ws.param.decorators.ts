import { RawData, WebSocket } from "ws";
import { InjectableStore } from "victormadu-nist-core";
import { ParamMetadata } from "../interface/ws-adapter.interface";
import { SendRawFn, SendFn } from "./interface/ws.param.decorator.interface";
import { ParamMetadataSetter } from "./_utils";
import { Constructor } from "ts-util-types";

const store = InjectableStore.getStore();
const getMetadataFn = (Target: Constructor) => store.getWsMetadata(Target);

const setter = new ParamMetadataSetter(getMetadataFn);

export function Wss() {
    return setter.set<ParamMetadata>((wss, ws, req, socket, head, data) => wss);
}

export function Ws() {
    return setter.set<ParamMetadata>((wss, ws, req, socket, head, data) => ws);
}

export function SendData() {
    return setter.set<ParamMetadata>((wss, ws, req, socket, head, data): SendFn => {
        return (type: string, data: any) => ws.send(JSON.stringify({ type, data }));
    });
}

export function SendRawData() {
    return setter.set<ParamMetadata>((wss, ws, req, socket, head, data): SendRawFn => {
        return (data: RawData | string) => ws.send(data);
    });
}

export function UserData() {
    return setter.set<ParamMetadata>((wss, ws, req, socket, head, data) => data.userData);
}

export function Payload() {
    return setter.set<ParamMetadata>((wss, ws, req, socket, head, data) => data.payload);
}

export function WsReq() {
    return setter.set<ParamMetadata>((wss, ws, req, socket, head, data) => req);
}

export function Url() {
    return setter.set<ParamMetadata>((wss, ws, req, socket, head, data) => req.url);
}

export function Ip() {
    return setter.set<ParamMetadata>(
        (wss, ws, req, socket, head, data) => req.socket.remoteAddress
    );
}

export function IpXForwardedFor() {
    return setter.set<ParamMetadata>((wss, ws, req, socket, head, data) =>
        // TODO: WARNING: req.headers["x-forwarded-for"] may be of type string[]. Look into this
        (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0].trim()
    );
}
