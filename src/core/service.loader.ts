import { ConstructorReturnType } from "../types";
import { IServiceDecoConstructor, IServiceAdapter, ILoader } from "./interface";
import { Loader } from "./_loader";

export class ServiceLoader<
  T extends IServiceDecoConstructor = IServiceDecoConstructor
> extends Loader<T> implements ILoader<T, IServiceAdapter> {
  constructor(private serviceAdapter: IServiceAdapter) {
    super();
  }

  load(service: ConstructorReturnType<T>) {
    this.serviceAdapter.attachLifeCycleListener(service);
  }
}
