import { InjectableStore } from "victormadu-nist-core";
import { MethodMetadata } from "../interface/ws-adapter.interface";
import { MethodMetadataSetter } from "./_utils";
import { Constructor } from "ts-util-types";

// TODO: Remove dupliation from ws.param.decorators when resturcturing folder into service, ws and http

const store = InjectableStore.getStore();
const getMetadataFn = (Target: Constructor) => store.getWsMetadata(Target);

const setter = new MethodMetadataSetter(getMetadataFn);

export function Type(type = "") {
    return setter.set<Required<MethodMetadata>, "type">("type", type);
}
