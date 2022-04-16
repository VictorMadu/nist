import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import * as _ from "lodash";
import { Constructor } from "ts-util-types";
import { ClassMetadata } from "../core/class-metadata";
import { ControllerAdapter, ControllerInstance } from "../core/controller-adapter";
import { Store } from "../core/store";
import { BaseMetadata, MethodMetadata, ParamMetadata } from "./interface/http-adapter.interface";

const DEFAULT_ROUTE = "/";

export class HttpAdapter extends ControllerAdapter {
  private httpAttacher: HttpAttacher;

  constructor(fastify: FastifyInstance) {
    super();
    this.httpAttacher = new HttpAttacher(fastify);
  }

  protected getMetadata(store: Store, controllerClass: Constructor) {
    return store.getHttpMetadata(controllerClass);
  }
  protected getControllers(store: Store) {
    return store.getHttps();
  }

  protected attach(httpInstance: ControllerInstance, metadata: ClassMetadata): void {
    this.httpAttacher.setHttpInstance(httpInstance).setMetadata(metadata);
    _.forEach(metadata.getMethodNames(), (methodName) => this.httpAttacher.attach(methodName));
  }
}

class HttpAttacher {
  private httpInstance!: ControllerInstance;
  private metadata!: ClassMetadata;

  constructor(private fastify: FastifyInstance) {}

  setHttpInstance(httpInstance: ControllerInstance) {
    this.httpInstance = httpInstance;
    return this;
  }

  setMetadata(metadata: ClassMetadata) {
    this.metadata = metadata;
    return this;
  }

  attach(methodName: string | symbol) {
    const methodMeta = this.getMethodMeta(methodName);
    const methodParamFns = this.getMethodParamFns(methodName);

    this.fastify.route({
      ...methodMeta,
      handler: (req: FastifyRequest, rep: FastifyReply) =>
        this.httpInstance[methodName](..._.map(methodParamFns, (paramFn) => paramFn(req, rep))),
      url: this.buildRoutePath(methodName),
    });
  }

  private buildRoutePath(methodName: string | symbol) {
    const basePath = this.getBaseMeta().path ?? "";
    const methodPath = this.getMethodMeta(methodName).path ?? "";
    return basePath + methodPath || DEFAULT_ROUTE;
  }

  private getBaseMeta() {
    return this.metadata.getBaseMeta<BaseMetadata>();
  }

  private getMethodMeta(methodName: string | symbol) {
    return this.metadata.getMethodMeta<MethodMetadata>(methodName);
  }

  private getMethodParamFns(methodName: string | symbol) {
    return this.metadata.getParamMeta<ParamMetadata[]>(methodName);
  }
}
