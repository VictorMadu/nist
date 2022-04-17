import "reflect-metadata";
import { singleton } from "tsyringe";
import { InjectableStore } from "../injectable-store";
import { Constructor } from "ts-util-types";

const store = InjectableStore.getStore();

export function InjectableBase() {
  return singleton();
}

export function Injectable() {
  return (Target: Constructor) => {
    store.addService(Target);
    return InjectableBase()(Target);
  };
}
