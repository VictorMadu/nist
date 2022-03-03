import { Container } from "inversify";
import { ContainerHelper } from "../containerHelper";
import { ConstructorReturnType } from "../types";
import { INJECTABLE_KEY } from "./constant";
import { IServiceDecoConstructor, IServiceAdapter, ILoader } from "./interface";

export class ServiceLoader<
  T extends IServiceDecoConstructor = IServiceDecoConstructor
> implements ILoader<T, IServiceAdapter> {
  constructor(private serviceAdapter: IServiceAdapter) {}
  load(container: Container, service: T) {
    const serviceInstance = new ContainerHelper().get(container, service);
    this.serviceAdapter.attachLifeCycleListener(serviceInstance);
  }

  getAdapter() {
    return this.serviceAdapter;
  }
}
