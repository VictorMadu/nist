import { CONTROLLER_METHOD_PARAMS_KEY, METADATA_KEY } from "../constant";

export type IMetadata<
  T extends { [key: string]: any } = { [key: string]: any }
> = {
  [METADATA_KEY]: T;
};

export type IParamsMetadata<
  T extends {
    [key: string]: any;
  }[] = {
    [key: string]: any;
  }[]
> = IMetadata<{
  [CONTROLLER_METHOD_PARAMS_KEY]: T;
}>;
