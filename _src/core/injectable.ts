import { injectable } from "inversify";
import * as _ from "lodash";
import { InjectableStore } from "./injectable-store";
import "reflect-metadata";
import { Constructor } from "../types";

// Injectable decorator. Creates an injectable class from a class and stores it in the InjectableStore
export function Injectable() {
  return function <T extends Constructor>(Target: T) {
    const InjectableTarget = injectable()(Target);
    InjectableStore.store(InjectableTarget);
    return InjectableTarget;
  };
}

export default Injectable;
