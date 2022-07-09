import { InjectableStore } from "victormadu-nist-core";
import * as _ from "lodash";
import { ParamMetadata } from "../interface/http-adapter.interface";
import { Constructor, Func } from "ts-util-types";
import { ParamMetadataSetter } from "./_utils";

const store = InjectableStore.getStore();
const getMetadataFn = (Target: Constructor) => store.getHttpMetadata(Target);

const setter = new ParamMetadataSetter(getMetadataFn);

export const dataKey = Symbol();

export function Body() {
    return setter.set<ParamMetadata>((req, rep) => req.body);
}

export function Params() {
    return setter.set<ParamMetadata>((req, rep) => req.params);
}

export function Query() {
    return setter.set<ParamMetadata>((req, rep) => req.query);
}

export function Headers() {
    return setter.set<ParamMetadata>((req, rep) => req.headers);
}

export function Send() {
    return setter.set<ParamMetadata>(
        (req, rep) =>
            <T extends unknown = unknown>(code: number, payload: unknown) =>
                rep.code(code).send(payload)
    );
}

export function Req() {
    return setter.set<ParamMetadata>((req, rep) => req);
}

export function Rep() {
    return setter.set<ParamMetadata>((req, rep) => rep);
}

export function ReqData() {
    return setter.set<ParamMetadata>((req, rep) => (req as any)[dataKey]);
}

export function RepData() {
    return setter.set<ParamMetadata>((req, rep) => (rep as any)[dataKey]);
}
