import { CONTROLLER_METHOD_PARAMS_KEY, METADATA_KEY } from "./constant";
import * as _ from "lodash";
import { IMetadata, IParamsMetadata } from "./interface/utils.interface";

// FUTURE: key can be a string or symbol

export function getFromMetaData(obj: IMetadata, key?: string) {
  const objMetadata = obj[METADATA_KEY];
  return key ? _.get(objMetadata, key) : objMetadata;
}

export function setMetaData(obj: object, key: string, value: any): IMetadata {
  const setKey = `${METADATA_KEY}.${key}`;
  const d = _.set(obj, setKey, value) as IMetadata;
  return d;
}

export function removeMetaData(obj: object): IMetadata {
  return _.set(obj, METADATA_KEY, undefined) as IMetadata;
}

export function getMethodParamsMetaData<T extends any[] = any[]>(
  obj: IParamsMetadata
) {
  return getFromMetaData(obj, CONTROLLER_METHOD_PARAMS_KEY) as Record<
    number,
    {
      type: string | symbol;
      args: T;
    }
  >;
}

export function setMethodParamsMetaData(
  obj: object,
  index: number,
  value: any
) {
  const setKey = `${CONTROLLER_METHOD_PARAMS_KEY}.${[index]}`;
  return setMetaData(obj, setKey, value);
}
