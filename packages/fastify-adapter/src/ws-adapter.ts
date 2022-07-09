import { FastifyInstance } from "fastify";
import { Constructor } from "ts-util-types";
import { WebSocketServer, WebSocket } from "ws";
import { Duplex } from "stream";
import * as _ from "lodash";
import { IncomingMessage } from "http";
import { ClassMetadata, ControllerAdapter, ControllerInstance, Store } from "victormadu-nist-core";
import { WsManager, WsManagerImpl } from "victormadu-nist-ws-manager";
import { BaseMetadata, MethodMetadata, ParamMetadata } from "./interface/ws-adapter.interface";

export class WsAdapter extends ControllerAdapter {
    private wsManager: WsManager;

    constructor(private fastify: FastifyInstance) {
        super();
        this.wsManager = new WsManagerImpl(this.fastify.server);
    }

    protected getMetadata(store: Store, controllerClass: Constructor) {
        return store.getWsMetadata(controllerClass);
    }
    protected getControllers(store: Store) {
        return store.getWs();
    }

    protected attach(wsInstance: ControllerInstance, metadata: ClassMetadata): void {
        const attacherHelper = new WsAttacherHelper(wsInstance, metadata);
        const baseMeta = attacherHelper.getBaseMeta();

        _.forEach(attacherHelper.getMethodNames(), (methodName) =>
            this.wsManager.createWssServerManager(baseMeta.path, (builder) => {
                return builder
                    .setHeartbeat(baseMeta.heartbeat)
                    .setAuthAndGetUserDetails(baseMeta.authAndGetUserDetails)
                    .setHandler(
                        attacherHelper.getType(methodName),
                        attacherHelper.getHandler(methodName)
                    );
            })
        );
    }
}

class WsAttacherHelper {
    constructor(private wsInstance: ControllerInstance, private metadata: ClassMetadata) {}

    getBaseMeta() {
        return this.metadata.getBaseMeta<BaseMetadata>();
    }

    getMethodMeta(methodName: string | symbol) {
        return this.metadata.getMethodMeta<MethodMetadata>(methodName);
    }

    getMethodParamFns(methodName: string | symbol) {
        return this.metadata.getParamMeta<ParamMetadata[]>(methodName);
    }

    getMethodNames() {
        return this.metadata.getMethodNames();
    }

    getType(methodName: string | symbol) {
        return this.getBaseMeta().type + this.getMethodMeta(methodName).type;
    }

    getHandler(methodName: string | symbol) {
        return (
            wss: WebSocketServer,
            ws: WebSocket,
            req: IncomingMessage,
            socket: Duplex,
            head: Buffer,
            payload: any
        ) => {
            this.wsInstance[methodName](
                ..._.map(this.getMethodParamFns(methodName), (fn) =>
                    fn(wss, ws, req, socket, head, payload)
                )
            );
        };
    }
}
