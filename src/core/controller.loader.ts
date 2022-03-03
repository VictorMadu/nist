import { Container } from "inversify";
import _ from "lodash";
import { ContainerHelper } from "../containerHelper";
import { ConstructorReturnType } from "../types";
import { getAllClassMethodsName, throwError } from "../utils";
import { INJECTABLE_KEY, METADATA_KEY } from "./constant";
import {
  IControllerDecoConstructor,
  IControllerAdapter,
  IHandlerMetaData,
  ILoader,
  Injectable,
  IController,
} from "./interface";

export class ControllerLoader<
  T extends IControllerDecoConstructor = IControllerDecoConstructor
> implements ILoader<T, IControllerAdapter> {
  constructor(private controllerAdapter: IControllerAdapter) {}

  load(container: Container, Controller: T) {
    const controllerInstance = new ContainerHelper().get(container, Controller);
    const controllerMethodsName = getAllClassMethodsName(
      controllerInstance.constructor
    );

    _.forEach(controllerMethodsName, (methodName) =>
      this.attachToRoute(controllerInstance, methodName)
    );
  }

  getAdapter() {
    return this.controllerAdapter;
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
    this.controllerAdapter.attachToRoute(
      {
        ...handlerWithMetaData[METADATA_KEY],
        handler: this.cleanHandler(handlerWithMetaData),
      },
      { basePath: controllerInstance[METADATA_KEY].basePath }
    );
    return;
  }

  private cleanHandler(handler: ConstructorReturnType<T>[string]) {
    const cleanedHandler = handler;
    (cleanedHandler.$METADATA as IHandlerMetaData | undefined) = undefined;
    return cleanedHandler;
  }
}
