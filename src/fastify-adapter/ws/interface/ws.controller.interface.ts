import { IncomingMessage } from "http";

export type IArgs = [path?: string, type?: string, auth?: (req: IncomingMessage) => boolean, heartbeat?: number];

export type INonBufferPayload = {type: string, data: any}