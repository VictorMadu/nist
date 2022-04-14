import { setParamMetadata } from "nist-core/deco-utils";
import { IMethodParamDecoFn } from "./interface/http.adapter.interface";
// TODO: Check "src\fastify-adapter\ws\ws.param.decorator.ts:8" for better understanding. Add generic types for all setParaMetadata and setMethodMetadata. Even check other things

// TODO: Expose `setParamMetadata` fn for client to use to create custom paramDeco

export const dataKey = Symbol();

export function Body() {
  return setParamMetadata<IMethodParamDecoFn>((req, rep) => req.body);
}

export function Params() {
  return setParamMetadata<IMethodParamDecoFn>((req, rep) => req.params);
}

export function Query() {
  return setParamMetadata<IMethodParamDecoFn>((req, rep) => req.query);
}

export function Headers() {
  return setParamMetadata<IMethodParamDecoFn>((req, rep) => req.headers);
}

export function Send() {
  return setParamMetadata<IMethodParamDecoFn>(
    (req, rep) => <T extends unknown = unknown>(
      code: number,
      payload: unknown
    ) => rep.code(code).send(payload)
  );
}

export function Req() {
  return setParamMetadata<IMethodParamDecoFn>((req, rep) => req);
}

export function Rep() {
  return setParamMetadata<IMethodParamDecoFn>((req, rep) => rep);
}

export function ReqData() {
  return setParamMetadata<IMethodParamDecoFn>(
    (req, rep) => (req as any)[dataKey]
  );
}

export function RepData() {
  return setParamMetadata<IMethodParamDecoFn>(
    (req, rep) => (rep as any)[dataKey]
  );
}
