import _ from "lodash";
import { ConstructorReturnType } from "../types";
import { getAllClassMethodsName, throwError } from "../utils";
import { METADATA_KEY } from "./constant";
import {
  IControllerDecoConstructor,
  IControllerAdapter,
  IHandlerMetaData,
  ILoader,
} from "./interface";
import { Loader } from "./_loader";

export class ControllerLoader<
  T extends IControllerDecoConstructor = IControllerDecoConstructor
> extends Loader<T> implements ILoader<T, IControllerAdapter> {
  constructor(private controllerAdapter: IControllerAdapter) {
    super();
  }

  load(controller: ConstructorReturnType<T>) {
    const controllerMethodsName = getAllClassMethodsName(
      controller.constructor
    );

    _.forEach(controllerMethodsName, (methodName) =>
      this.attachToRoute(controller, methodName)
    );
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
