import { FastifyInstance } from "fastify";
import * as _ from "lodash";
import { CONTROLLER_KEY } from "../core";
import { HTTP_CONTROLLER_KEY, METADATA_KEY } from "../core/constant";
import {
  getControllerMetadata,
  getControllerMethodMetadata,
} from "../core/controller-adapter-utils";
import { IController } from "../core/interface/controller.interface";
import { getAllClassMethodsName } from "../utils";
import { HttpHandlerUtils } from "./http-handler-args";
import {
  IControllerAdapter,
  IHandlerArgFn,
  IHandlerMetaData,
  IHttpController,
} from "./interface/controller-adapter.interface";
import { getMetadata } from "./util";

export default class ControllerAdapter implements IControllerAdapter {
  private httpAdapter: HttpAttacher;
  constructor(fastifyInstance: FastifyInstance) {
    this.httpAdapter = new HttpAttacher(fastifyInstance);
  }

  attach(controller: IController<IHandlerMetaData>) {
    const constructorClass = controller.constructor;
    const methodNames = getAllClassMethodsName(constructorClass);
    if (constructorClass[CONTROLLER_KEY] === HTTP_CONTROLLER_KEY)
      _.forEach(methodNames, (methodName) => {
        this.httpAdapter.attach(controller, methodName);
      });
  }
}

class HttpAttacher {
  private httpHandlerUtils = new HttpHandlerUtils();
  constructor(private fastifyInstance: FastifyInstance) {}

  attach(controller: IHttpController, methodName: string) {
    const method = controller[methodName].bind(controller);
    const methodMetadata = getControllerMethodMetadata(
      controller,
      methodName
    ) as IHttpController[string][typeof METADATA_KEY];

    const baseMetadata = getControllerMetadata(controller) as { path: string };

    this.fastifyInstance.route({
      ...methodMetadata,
      handler: this.httpHandlerUtils.getHandler(controller, methodName),
      url: (baseMetadata.path ?? "" + methodMetadata.path ?? "") || "/",
    });
  }
}
