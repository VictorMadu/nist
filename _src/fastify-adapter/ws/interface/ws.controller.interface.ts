import { WsType } from "../../constants/controller.adapter.constants";

export type IWsClassMetadata = Record<string | symbol, any> & {
  __type: typeof WsType;
};
