import { HttpType } from "../../constants/controller.adapter.constants";

export type IHttpClassMetadata =  {
  basePath?: string;
  __type: typeof HttpType;
};

export type IArgs = [path?: string]
