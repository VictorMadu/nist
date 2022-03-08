import { FastifyInstance } from "fastify";
import { IAdapter } from "../../core/interface/adapter.interface";
import {
  IService,
  IServiceClass,
} from "../../core/interface/service.interface";
import { ConstructorReturnType, ExactlyOrWithPromise } from "../../types";
import { ONREADY, ONSTART, ONCLOSE } from "../constants/service.constant";

type ListenerFn = (fastify: FastifyInstance) => ExactlyOrWithPromise<void>;

export interface IReadyListener {
  onReady: ListenerFn;
}

export interface IStartListener {
  onStart: ListenerFn;
}

export interface ICloseListener {
  onClose: ListenerFn;
}

export type IListeners = Partial<
  IReadyListener & IStartListener & ICloseListener
>;

export type IListenTypes = typeof ONREADY | typeof ONSTART | typeof ONCLOSE;

export type IReadyListeners = IReadyListener[typeof ONREADY][];
export type IStartListeners = IStartListener[typeof ONSTART][];
export type ICloseListeners = ICloseListener[typeof ONCLOSE][];

export type IListenersFn = IReadyListeners | IStartListeners | ICloseListeners;

export interface IServiceAdapter extends IAdapter<IService> {
  emitReady: () => void;
  emitStart: () => void;
  emitClose: () => void;
}
