import * as _ from "lodash";
import { Constructor, Func } from "ts-util-types";
import { onClose, onReady, onStart } from "./constants/listeners";
import { InjectableStore } from "./injectable-store";

type ListenerFn = (fastify: Object) => void;
type ReadyListener = { [onReady]: ListenerFn };
type StartListener = { [onStart]: ListenerFn };
type CloseListener = { [onClose]: ListenerFn };

type ServiceInstance = Record<string | symbol, Func> &
  Partial<ReadyListener & StartListener & CloseListener>;

export class ServiceAdapter {
  private store = InjectableStore.getStore();
  private container = InjectableStore.getContainer();
  private readyListeners: ReadyListener[] = [];
  private startListeners: StartListener[] = [];
  private closeListeners: CloseListener[] = [];

  constructor(private serverInstance: Object) {}

  resolve() {
    const serviceClasses = this.store.getServices();
    _.forEach(serviceClasses, (serviceClass) => this.resolveService(serviceClass));
  }

  async ready() {
    await this.emitEvent(this.readyListeners, onReady);
  }

  async start() {
    await this.emitEvent(this.startListeners, onStart);
  }

  async close() {
    await this.emitEvent(this.closeListeners, onClose);
  }

  private resolveService(service: Constructor) {
    const serviceInstance = this.getServiceInstance(service);
    this.registerListeners(serviceInstance);
  }

  private getServiceInstance(service: Constructor): ServiceInstance {
    try {
      return this.container.resolve(service);
    } catch (error) {
      const msg = `Error resolving ${service.name}. Check the class and its dependencies`;
      throw new Error((error as Error).message + msg);
    }
  }

  private registerListeners(serviceInstance: ServiceInstance) {
    this.registerEventListener(serviceInstance, this.readyListeners, onReady);
    this.registerEventListener(serviceInstance, this.startListeners, onStart);
    this.registerEventListener(serviceInstance, this.closeListeners, onClose);
  }

  private async emitEvent(eventListenersStore: Record<string | symbol, Func>[], type: string) {
    for (let i = 0; i < eventListenersStore.length; i++) {
      const listenerInstance = eventListenersStore[i];
      await listenerInstance[type](this.serverInstance);
    }
  }

  private registerEventListener(
    obj: Record<string | symbol, Func>,
    eventListenersStore: Record<string | symbol, Func>[],
    type: string
  ) {
    const hasMethod = obj[type] as Func | undefined;
    if (hasMethod) eventListenersStore.push(obj);
  }
}
