import { FastifyInstance } from "fastify";
import {
  ONREADY,
  ONSTART,
  ONCLOSE,
} from "../constants/service.adapter.constants";

export type IListener = (fastify: FastifyInstance) => void;

export type IService = {
  [ONREADY]?: IListener;
  [ONSTART]?: IListener;
  [ONCLOSE]?: IListener;
};