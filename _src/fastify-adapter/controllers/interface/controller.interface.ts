import { HttpType, WsType } from "../constants/controller.constant";

export type IArgs = [path: string];

export type IHttp = typeof HttpType;

export type IWs = typeof WsType;

export type IHttpClassMetadataReturn = Record<string | symbol, any> & {__type: IHttp};

export type IWsClassMetadataReturn = Record<string | symbol, any> & {__type: IWs};