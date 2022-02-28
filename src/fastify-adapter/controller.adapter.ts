import { IRouteConfig } from "./interface";

export default class ControllerAdapter {
  constructor(private routeConfigs: IRouteConfig[]) {}

  attachToRoute<T extends IRouteConfig>(
    routeConfig: T,
    baseConfig: { basePath: string }
  ) {
    routeConfig.url = baseConfig.basePath + routeConfig.url;
    this.routeConfigs.push(routeConfig);
  }
}
