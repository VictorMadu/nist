import { InjectableStore } from "../../core/injectable-store";
import { Constructor } from "ts-util-types";
import { InjectableBase } from "../../core/injectables";
import { BaseMetadata } from "../interface/ws-adapter.interface";
import * as _ from "lodash";

const DEFAULT_PATH = "/";
const DEFAULT_HEARTBEAT = 3000; // 3000 milliseconds
const DEFAULT_AUTH_AND_GET_USER_DETAILS = () => ({});
const store = InjectableStore.getStore();

export function WsController(config: { type?: string }) {
  return (Target: Constructor) => {
    setBaseMeta(Target, config);
    return InjectableBase()(Target);
  };
}

export function setWsConfig(config: Partial<BaseMetadata>, Targets: Constructor[]) {
  _.map(Targets, (Target) => {
    setBaseMeta(Target, config);
  });
}

const setBaseMeta = (Target: Constructor, config: Partial<BaseMetadata>) => {
  const baseMeta = store.getWsMetadata(Target).getBaseMeta<Partial<BaseMetadata>>();
  store.getWsMetadata(Target).setBaseMeta({
    path: (baseMeta.path ?? "") + (config.path ?? "") || DEFAULT_PATH,
    type: (baseMeta.type ?? "") + (config.type ?? "") || "",
    heartbeat: config.heartbeat ?? baseMeta.heartbeat ?? DEFAULT_HEARTBEAT,
    authAndGetUserDetails:
      config.authAndGetUserDetails ??
      baseMeta.authAndGetUserDetails ??
      DEFAULT_AUTH_AND_GET_USER_DETAILS,
  });
};
