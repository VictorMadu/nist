import { HttpType } from "../../constants/controller.adapter.constants";

export type IHttpClassMetadata = Record<string | symbol, any> & {
  __type: typeof HttpType;
};
