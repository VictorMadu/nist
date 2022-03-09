import { metaParamDecorator } from "../core/metaDecorator";
import { ARG_TYPES } from "./constants/http-handler-args.constant";
import { dataKey } from "./data-manager";
import {
  IReqOrRep,
  IReqOrRepProp,
} from "./interface/http-handler-args.interface";
import * as _ from "lodash";

export function Body() {
  return Props("req", "body");
}

export function Params() {
  return Props("req", "params");
}

export function Query() {
  return Props("req", "query");
}

export function Rep() {
  return Props("rep");
}

export function ReqData(props?: string) {
  return ReqOrRepData("req", props);
}

export function RepData(props?: string) {
  return ReqOrRepData("rep", props);
}

function ReqOrRepData(reqOrRep: "req" | "rep", props?: string) {
  const data = Props(reqOrRep, dataKey as any);
  return props ? _.get(data, props) : data;
}

export function Props<T extends IReqOrRep>(
  reqOrRep: T,
  prop?: IReqOrRepProp<T>
) {
  return metaParamDecorator(ARG_TYPES.props, [reqOrRep, prop]);
}

export function Data<T extends IReqOrRep>(
  reqOrRep: T,
  prop?: IReqOrRepProp<T>
) {
  return metaParamDecorator(ARG_TYPES.data, [reqOrRep, prop]);
}
