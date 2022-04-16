import { Constructor } from "ts-util-types";
import { ClassMetadata, ClassMetadataImpl } from "./class-metadata";

export interface Store {
  getHttps(): IterableIterator<Constructor>;
  getWs(): IterableIterator<Constructor>;
  getHttpMetadata(Target: Constructor): ClassMetadata;
  getWsMetadata(Target: Constructor): ClassMetadata;
  addService(Target: Constructor): Store;
  getServices(): Constructor[];
}

export class StoreImpl implements Store {
  private services: Constructor[] = [];
  private httpControllersObj = new Map<Constructor, ClassMetadata>();
  private wsControllersObj = new Map<Constructor, ClassMetadata>();

  getHttps() {
    return this.httpControllersObj.keys();
  }

  getWs() {
    return this.wsControllersObj.keys();
  }

  getHttpMetadata(Target: Constructor) {
    if (this.httpControllersObj.has(Target)) {
      this.httpControllersObj.set(Target, new ClassMetadataImpl());
    }
    return this.httpControllersObj.get(Target) as ClassMetadata;
  }

  getWsMetadata(Target: Constructor) {
    if (this.wsControllersObj.has(Target)) {
      this.wsControllersObj.set(Target, new ClassMetadataImpl());
    }
    return this.wsControllersObj.get(Target) as ClassMetadata;
  }

  addService(Target: Constructor) {
    this.services.push(Target);
    return this;
  }

  getServices() {
    return this.services;
  }
}
