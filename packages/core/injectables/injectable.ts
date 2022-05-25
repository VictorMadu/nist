import "reflect-metadata";
import { injectable, singleton } from "tsyringe";
import { InjectableStore } from "../injectable-store";
import { Constructor } from "ts-util-types";

const store = InjectableStore.getStore();

export function InjectableBase(isSingleton = true) {
  if (isSingleton) return singleton();
  return injectable();
}

export function Injectable(isSingleton = true) {
  return (Target: Constructor) => {
    store.addService(Target);
    return InjectableBase(isSingleton)(Target);
  };
}
