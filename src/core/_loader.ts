import { Container } from "inversify";
import { ContainerHelper } from "../containerHelper";
import { INJECTABLE_KEY } from "./constant";
import { Injectable } from "./interface";

export abstract class Loader<T extends Injectable> {
  getInstance(container: Container, Service: T) {
    return new ContainerHelper().get(container, Service);
  }
}
