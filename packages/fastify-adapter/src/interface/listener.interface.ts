import { FastifyInstance } from "fastify";
import { onReady, onStart, onClose } from "victormadu-nist-core";

type ListenerFn = (fastify: FastifyInstance) => Promise<void> | void;

export interface ReadyListener {
    [onReady]: ListenerFn;
}

export interface StartListener {
    [onReady]: ListenerFn;
}

export interface CloseListener {
    [onReady]: ListenerFn;
}
