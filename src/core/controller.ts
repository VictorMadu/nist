import { CONTROLLER_KEY } from "./constant";
import { setMetaData } from "./utils";
import { createInjectable } from "./metaClassDecorator";

export type IReturnTypeControllerFn = ReturnType<ReturnType<typeof Controller>>;

export const Controller = createInjectable<
  [string | undefined] | never[],
  { basePath: string } & Record<string, any>
>(CONTROLLER_KEY, (context, decoArgs) => {
  const path = decoArgs[0];
  setMetaData(context, "basePath", path ?? "");
});
