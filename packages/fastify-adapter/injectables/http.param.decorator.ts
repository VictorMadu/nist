import * as _ from "lodash";
import { ParamMetadata } from "../interface/http-adapter.interface";
import { Constructor, Func } from "ts-util-types";
import { InjectableStore } from "../../core/injectable-store";
import { setParamMetadata } from "./_utils";

export const dataKey = Symbol();

export function Body() {
  return setParamMetadata<ParamMetadata>((req, rep) => req.body);
}

export function Params() {
  return setParamMetadata<ParamMetadata>((req, rep) => req.params);
}

export function Query() {
  return setParamMetadata<ParamMetadata>((req, rep) => req.query);
}

export function Headers() {
  return setParamMetadata<ParamMetadata>((req, rep) => req.headers);
}

export function Send() {
  return setParamMetadata<ParamMetadata>(
    (req, rep) => <T extends unknown = unknown>(code: number, payload: unknown) =>
      rep.code(code).send(payload)
  );
}

export function Req() {
  return setParamMetadata<ParamMetadata>((req, rep) => req);
}

export function Rep() {
  return setParamMetadata<ParamMetadata>((req, rep) => rep);
}

export function ReqData() {
  return setParamMetadata<ParamMetadata>((req, rep) => (req as any)[dataKey]);
}

export function RepData() {
  return setParamMetadata<ParamMetadata>((req, rep) => (rep as any)[dataKey]);
}
