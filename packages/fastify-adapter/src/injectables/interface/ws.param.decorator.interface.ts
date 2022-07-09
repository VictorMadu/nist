import { RawData } from "ws";

export type SendFn = (type: string, data: any) => void;
export type SendRawFn = (data: RawData | string) => void;
