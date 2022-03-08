import { CONTROLLER_METHOD_PARAMS_KEY, METADATA_KEY } from "./constant";
import * as _ from "lodash";
import { IMetadata, IParamsMetadata } from "./interface/utils.interface";

// FUTURE: key can be a string or symbol

export function getFromMetaData(obj: IMetadata, key?: string) {
  const objMetadata = obj[METADATA_KEY];
  return _.isUndefined(key) ? objMetadata : _.get(objMetadata, key);
}

export function setMetaData(obj: object, key: string, value: any): IMetadata {
  const setKey = `${METADATA_KEY}.${key}`;
  return _.set(obj, setKey, value) as IMetadata;
}

export function removeMetaData(obj: object): IMetadata {
  return _.set(obj, METADATA_KEY, undefined) as IMetadata;
}

export function getMethodParamsMetaData(obj: IParamsMetadata, key?: string) {
  let objKey = key
    ? CONTROLLER_METHOD_PARAMS_KEY + "." + key
    : CONTROLLER_METHOD_PARAMS_KEY;

  return getFromMetaData(obj, objKey);
}

export function setMethodParamsMetaData(
  obj: object,
  index: number,
  key: string,
  value: any
) {
  const setKey = `${CONTROLLER_METHOD_PARAMS_KEY}.${[index]}.${key}`;
  return setMetaData(obj, setKey, value);
}
