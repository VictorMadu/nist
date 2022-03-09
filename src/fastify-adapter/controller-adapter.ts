import { FastifyInstance } from "fastify";
import * as _ from "lodash";
import { getFromMetaData, getMethodParamsMetaData } from "../core/utils";
import { CONTROLLER_KEY } from "../core";
import { HTTP_CONTROLLER_KEY, METADATA_KEY } from "../core/constant";
import { IController } from "../core/interface/controller.interface";
import { getAllClassMethodsName } from "../utils";
import { HttpHandlerUtils } from "./http-handler-args";
import {
  IControllerAdapter,
  IHandlerArgFn,
  IHandlerMetaData,
  IHttpController,
} from "./interface/controller-adapter.interface";

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
    const method = controller[methodName];
    const methodMetadata = getFromMetaData(
      method
    ) as IHttpController[string][typeof METADATA_KEY];

    const baseMetadata = getFromMetaData(controller as any) as { path: string };

    this.fastifyInstance.route({
      ...methodMetadata,
      handler: this.httpHandlerUtils.getHandler(controller, methodName),
      url: (baseMetadata.path ?? "" + methodMetadata.path ?? "") || "/",
    });
  }
}
