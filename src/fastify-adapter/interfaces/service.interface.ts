import { FastifyInstance } from "fastify";

export interface IReadyListener {
  onReady: (fastify: FastifyInstance) => void;
}

export interface IStartListener {
  onStart: (fastify: FastifyInstance) => void;
}

export interface ICloseListener {
  onClose: (fastify: FastifyInstance) => void;
}
