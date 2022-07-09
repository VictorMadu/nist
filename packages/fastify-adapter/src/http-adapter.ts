import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Constructor } from "ts-util-types";
import * as _ from "lodash";
import { ClassMetadata, ControllerAdapter, ControllerInstance, Store } from "victormadu-nist-core";
import { BaseMetadata, MethodMetadata, ParamMetadata } from "./interface/http-adapter.interface";

const DEFAULT_ROUTE = "/";

export class HttpAdapter extends ControllerAdapter {
    constructor(private fastify: FastifyInstance) {
        super();
    }

    protected getMetadata(store: Store, controllerClass: Constructor) {
        return store.getHttpMetadata(controllerClass);
    }

    protected getControllers(store: Store) {
        return store.getHttps();
    }

    protected attach(httpInstance: ControllerInstance, metadata: ClassMetadata): void {
        const attacherHelper = new RouteAttachHelper(httpInstance, metadata);

        _.forEach(attacherHelper.getMethodNames(), (methodName) => {
            this.fastify.route({
                ...attacherHelper.getMethodMeta(methodName),
                handler: attacherHelper.getHandler(methodName),
                url: attacherHelper.getRoute(methodName),
            });
        });
    }
}
class RouteAttachHelper {
    constructor(private httpInstance: ControllerInstance, private metadata: ClassMetadata) {}

    getMethodNames() {
        return this.metadata.getMethodNames();
    }

    getHandler(methodName: string | symbol) {
        const methodParamFns = this.getMethodParams(methodName);
        return (req: FastifyRequest, rep: FastifyReply) =>
            this.httpInstance[methodName](..._.map(methodParamFns, (paramFn) => paramFn(req, rep)));
    }

    getRoute(methodName: string | symbol) {
        const basePath = this.getBaseMeta().path;
        const methodPath = this.getMethodMeta(methodName).path;
        return basePath + methodPath || DEFAULT_ROUTE;
    }

    getMethodMeta(methodName: string | symbol) {
        return this.metadata.getMethodMeta<MethodMetadata>(methodName);
    }

    private getBaseMeta() {
        return this.metadata.getBaseMeta<BaseMetadata>();
    }

    private getMethodParams(methodName: string | symbol) {
        return this.metadata.getParamMeta<ParamMetadata[]>(methodName);
    }
}
