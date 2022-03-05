import { METADATA_KEY } from "./constant";
import * as _ from "lodash";

// FUTURE: key can be a string or symbol

export function getFromMetaData(
  obj: { [METADATA_KEY]: Record<string | symbol, any> },
  key?: string
) {
  const objMetadata = obj[METADATA_KEY];
  return _.isUndefined(key) ? objMetadata : _.get(objMetadata, key);
}

export function setMetaData(obj: object, key: string, value: any) {
  const setKey = `${METADATA_KEY}.${key}`;
  _.set(obj, setKey, value);
}

export function removeMetaData(obj: object) {
  _.set(obj, METADATA_KEY, undefined);
}
