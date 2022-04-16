import { delay, inject } from "tsyringe";
import { Constructor } from "ts-util-types";

export function InjectDelay(token: Constructor) {
  return inject(delay(() => token));
}
