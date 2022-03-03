import { Container } from "inversify";
import { INJECTABLE_KEY } from "./core/constant";
import { ConstructorReturnType } from "./types";
import * as _ from "lodash";

const symbols: any = [];

export class ContainerHelper {
  constructor() {}

  bind(
    container: Container,
    injectable: { new (args: any[]): any; [INJECTABLE_KEY]: symbol }
  ) {
    console.log("Running", injectable[INJECTABLE_KEY]);
    symbols.push(injectable[INJECTABLE_KEY]);
    container.bind(injectable[INJECTABLE_KEY]).to(injectable);
  }

  get<T extends { new (args: any[]): any; [INJECTABLE_KEY]: symbol }>(
    container: Container,
    injectable: T
  ) {
    console.log("NEXT INJECTABLE", injectable[INJECTABLE_KEY]);
    console.log(
      "Registered?",
      _.findIndex(symbols, (symbol) => symbol === injectable[INJECTABLE_KEY])
    );
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
