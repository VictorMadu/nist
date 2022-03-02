import { injectable } from "inversify";
import { Constructor } from "../types";
import { INJECTABLE_KEY, METADATA_KEY } from "./constant";
import { Injectable } from "./injectable";
import {
  IController,
  IControllerDecoConstructor,
  IControllerMetadata,
} from "./interface";

export type IReturnTypeControllerFn = ReturnType<ReturnType<typeof Controller>>;

export function Controller(path = "") {
  return function <
    T extends {
      new (...args: any[]): any;
    }
  >(
    TargetClass: T
  ): {
    new (...args: any[]): {
      [METADATA_KEY]: IControllerMetadata[typeof METADATA_KEY] &
        Record<string, any>;
    } & any;
    [INJECTABLE_KEY]: symbol;
  } {
    return class extends Injectable()(TargetClass) {
      static [INJECTABLE_KEY] = Symbol();
      [METADATA_KEY]: IControllerMetadata[typeof METADATA_KEY];
      constructor(...args: any[]) {
        super(...args);
        this[METADATA_KEY] = {
          basePath: path,
        };
      }
    };
  };
}
