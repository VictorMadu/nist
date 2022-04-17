import "reflect-metadata";
import { inject, InjectionToken } from "tsyringe";

export function Inject(token: InjectionToken<any>) {
  return inject(token);
}
