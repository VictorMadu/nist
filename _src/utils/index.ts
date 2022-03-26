import * as _ from "lodash";

/**
 *
 * Returns all the methods of a given Class including those of its ancestors or super class
 */

export const getAllClassMethodsName = (Class: Function) => {
  const getMethods = (e: any) => [
    ..._.filter(Object.getOwnPropertyNames(e), (f) => f != "constructor"),
    ...Object.getOwnPropertySymbols(e),
  ];

  const _recursive = (
    current: any,
    arrayOfMethod: (string | symbol)[]
  ): (string | symbol)[] => {
    if (current.__proto__.constructor.prototype.__proto__ == null)
      return arrayOfMethod;
    return _recursive(
      current.__proto__.constructor.prototype,
      _.concat(arrayOfMethod, getMethods(current.__proto__))
    );
  };

  return _recursive(Class.prototype, getMethods(Class.prototype));
};

export const throwError = (error: string | Error) => {
  throw error;
};
