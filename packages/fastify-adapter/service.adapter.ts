import { FastifyInstance } from "fastify";
import * as _ from "lodash";
import { ONREADY, ONSTART, ONCLOSE } from "./constants/service.adapter.constants";
import { IListener, IService } from "./interfaces/service.adapter.interfaces";

export class ServiceAdapter {
  private onReadyListeners: IListener[] = [];
  private onStartListeners: IListener[] = [];
  private onCloseListeners: IListener[] = [];

  constructor(private fastifyInstance: FastifyInstance) {}

  public attach(service: IService) {
    this.attachToListener(service, ONREADY, this.onReadyListeners);
    this.attachToListener(service, ONSTART, this.onStartListeners);
    this.attachToListener(service, ONCLOSE, this.onCloseListeners);
  }

  public emitReady() {
    this.emitEvent(this.onReadyListeners);
  }
  public emitStart() {
    this.emitEvent(this.onStartListeners);
  }
  public emitClose() {
    this.emitEvent(this.onReadyListeners);
  }

  private attachToListener(service: IService, type: keyof IService, listeners: IListener[]) {
    const fn = service[type]?.bind(service) as (fastify: FastifyInstance) => void;
    if (fn) listeners.push(fn);
  }

  private emitEvent(listeners: IListener[]) {
    _.map(listeners, (listener) => listener(this.fastifyInstance));
  }
}

export default ServiceAdapter;
