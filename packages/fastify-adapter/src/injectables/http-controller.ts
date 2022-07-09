import { InjectableStore } from "../../core/injectable-store";
import { InjectableBase } from "../../core/injectables";
import { BaseMetadata } from "../interface/http-adapter.interface";
import { Constructor } from "ts-util-types";

const store = InjectableStore.getStore();

export function HttpController(path = "") {
  return (Target: Constructor) => {
    store.getHttpMetadata(Target).setBaseMeta<BaseMetadata>({ path });
    return InjectableBase()(Target);
  };
}
