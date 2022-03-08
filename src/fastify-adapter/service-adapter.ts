import { FastifyInstance } from "fastify";
import {
  ICloseListeners,
  IListenersFn,
  IListenTypes,
  IReadyListeners,
  IServiceAdapter,
  IStartListeners,
} from "./interface/service-adapter.interface";
import * as _ from "lodash";
import { ONREADY, ONSTART, ONCLOSE } from "./constants/service.constant";
import { IService } from "../core/interface/service.interface";

export class ServiceAdapter implements IServiceAdapter {
  private onReadyListeners: IReadyListeners = [];
  private onStartListeners: IStartListeners = [];
  private onCloseListeners: ICloseListeners = [];

  constructor(private fastifyInstance: FastifyInstance) {}

  attach(config: IService) {
    this.attachToListener(config, ONREADY, this.onReadyListeners);
    this.attachToListener(config, ONSTART, this.onStartListeners);
    this.attachToListener(config, ONCLOSE, this.onCloseListeners);
  }

  emitReady() {
    this.emitEvent(this.onReadyListeners);
  }
  emitStart() {
    this.emitEvent(this.onStartListeners);
  }
  emitClose() {
    this.emitEvent(this.onReadyListeners);
  }

  private attachToListener(
    config: IService,
    type: IListenTypes,
    listeners: IListenersFn
  ) {
    const fn: IService[IListenTypes] = config[type]?.bind(config);
    if (!fn) return;
    listeners.push(fn);
  }

  private emitEvent(listeners: IListenersFn) {
    _.map(listeners, (listener) => listener(this.fastifyInstance));
  }
}
