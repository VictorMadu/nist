import { IMetaData } from "./controller.interface";

export type IMetadataFn<
  M extends IMetaData = IMetaData,
  A extends any[] = any[]
> = (...decoArgs: A) => M;
