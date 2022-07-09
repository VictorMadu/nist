import { AuthAndGetUserDetails, WsHandler } from "victormadu-nist-ws-manager";

export interface BaseMetadata {
    path: string;
    type: string;
    heartbeat: number;
    authAndGetUserDetails: AuthAndGetUserDetails;
}

export interface MethodMetadata {
    type: string;
}

export type ParamMetadata = WsHandler;
