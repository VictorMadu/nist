import * as _ from "lodash";

/**
 *
 * Returns all the methods of a given Class including those of its ancestors or super class
 */
export const getAllClassMethodsName = (Class: Function) => {
  const getMethods = (e: any) =>
    Object.getOwnPropertyNames(e).filter((f) => f != "constructor");

  const _recursive = (current: any, arrayOfMethod: string[]): string[] => {
    if (current.__proto__.constructor.prototype.__proto__ == null)
      return arrayOfMethod;
    return _recursive(
      current.__proto__.constructor.prototype,
      arrayOfMethod.concat(getMethods(current.__proto__))
    );
  };

  return _recursive(Class.prototype, getMethods(Class.prototype));
};

export const throwError = (error: string | Error) => {
  throw error;
};
