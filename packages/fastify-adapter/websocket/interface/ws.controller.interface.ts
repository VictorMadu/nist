import { IncomingMessage } from "http";
import { WebSocket } from "ws";

export type IArgs = [
  {
    path?: string;
    type?: string;
    auth?: (req: IncomingMessage) => boolean;
    heartbeat?: number;
    eventEmitter?: (ws: WebSocket) => void;
  }
];

export type INonBufferPayload = { type: string; data: any };
