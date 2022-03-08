import { Container } from "inversify";
import { INJECTABLE_KEY } from "./constant";
import { ConstructorReturnType } from "../types";
import * as _ from "lodash";
import { InjectableClass } from "./interface/injectable.interface";

export class ContainerHelper {
  constructor() {}

  bind(container: Container, injectable: InjectableClass) {
    container.bind(injectable[INJECTABLE_KEY]).to(injectable);
  }

  get<T extends InjectableClass = InjectableClass>(
    container: Container,
    injectable: T
  ) {
    return container.get<ConstructorReturnType<T>>(injectable[INJECTABLE_KEY]);
  }

  merge(
    container1: Container,
    container2: Container,
    ...otherContainers: Container[]
  ) {
    return Container.merge(
      container1,
      container2,
      ...otherContainers
    ) as Container;
  }

  createContainer() {
    return new Container({ defaultScope: "Singleton" });
  }
}
