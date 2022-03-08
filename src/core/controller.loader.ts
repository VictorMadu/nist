import _ from "lodash";
import { ConstructorReturnType } from "../types";
import { getAllClassMethodsName, throwError } from "../utils";
import {
  IControllerDecoConstructor,
  ILoader,
  IControllerMetadata,
} from "./interface";
import { getFromMetaData, removeMetaData, setMetaData } from "./utils";
import { Loader } from "./_loader";
import { METADATA_KEY } from "./constant";
import { IAdapter } from "./interface/adapter.interface";

export type IAdapterT<
  T extends IControllerDecoConstructor = IControllerDecoConstructor
> = IAdapter<{
  method: Pick<ConstructorReturnType<T>[string], typeof METADATA_KEY> & {
    handler: Exclude<ConstructorReturnType<T>[string], "$METADATA">;
  };
  base: ConstructorReturnType<T>[typeof METADATA_KEY];
}>;

export class ControllerLoader<
  T extends IControllerDecoConstructor = IControllerDecoConstructor
> extends Loader<T> implements ILoader<T, IAdapterT<T>> {
  constructor(private controllerAdapter: IAdapterT<T>) {
    super();
  }

  load(controller: ConstructorReturnType<T>) {
    const controllerMethodsName = getAllClassMethodsName(
      controller.constructor
    );
    _.forEach(controllerMethodsName, (methodName) => {
      this.attachToRoute(controller, methodName);
    });
  }

  private attachToRoute(
    controllerInstance: ConstructorReturnType<T>,
    methodName: string
  ) {
    if (methodName === "$METADATA")
      return throwError(
        `methodName of controller ${controllerInstance} should not be used since it is a resevered key`
      );

    const handlerWithMetaData = controllerInstance[
      methodName
    ] as ConstructorReturnType<T>[string];
    this.controllerAdapter.attach({
      method: {
        ...getFromMetaData(handlerWithMetaData),
        handler: this.cleanHandler(handlerWithMetaData),
      },
      base: { ...getFromMetaData(controllerInstance) },
    });
    return;
  }

  private cleanHandler(handler: ConstructorReturnType<T>[string]) {
    removeMetaData(handler);
    return handler;
  }
}
