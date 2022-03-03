import { Container } from "inversify";
import { ContainerHelper } from "src/containerHelper";
import { INJECTABLE_KEY } from "./constant";

export abstract class Loader<
  T extends { new (...args: any[]): any; [INJECTABLE_KEY]: symbol }
> {
  getInstance(container: Container, Service: T) {
    return new ContainerHelper().get(container, Service);
  }
}
