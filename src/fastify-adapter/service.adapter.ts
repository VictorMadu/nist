import { FastifyInstance } from "fastify";
import { ExactlyOrWithPromise } from "src/types";
import { IListeners } from "./interface";

interface IService {
  onReady?: (fastify: FastifyInstance) => ExactlyOrWithPromise<void>;
  onStart?: () => ExactlyOrWithPromise<void>;
  onClose?: () => ExactlyOrWithPromise<void>;
}

export default class ServiceAdapter {
  onReady: "onReady" = "onReady";
  onStart: "onStart" = "onStart";
  onClose: "onClose" = "onClose";

  constructor(private listeners: IListeners) {}

  attachLifeCycleListener(service: IService) {
    this.attachListener(service, "onReady");
    this.attachListener(service, "onStart");
    this.attachListener(service, "onClose");
  }

  private attachListener(
    service: IService,
    event: "onReady" | "onStart" | "onClose"
  ) {
    const method: ((...args: any[]) => void) | undefined = service[event];
    if (!method) return;
    this.listeners[event].push((...args: any[]) => method(...args));
  }
}
