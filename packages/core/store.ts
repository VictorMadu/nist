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

// TODO: Refactor and make cleaner. Break into ServiceStore, HttpStore, WsStore Classes.
// TODO: And maybe re-ogranize folder structure and split into service, http and ws
export class StoreImpl implements Store {
  private services: Constructor[] = [];
  private httpControllersObj = new Map<Constructor, ClassMetadata>();
  private wsControllersObj = new Map<Constructor, ClassMetadata>();

  getHttps() {
    return this.getAllTargetsFromStorage(this.httpControllersObj);
  }

  getWs() {
    return this.getAllTargetsFromStorage(this.wsControllersObj);
  }

  getHttpMetadata(Target: Constructor) {
    return this.getMetadata(this.httpControllersObj, Target);
  }

  getWsMetadata(Target: Constructor) {
    return this.getMetadata(this.wsControllersObj, Target);
  }

  addService(Target: Constructor) {
    this.services.push(Target);
    return this;
  }

  getServices() {
    return this.services;
  }

  private getMetadata(storage: Map<Constructor, ClassMetadata>, Target: Constructor) {
    this.storeTargetIfNotStored(storage, Target);
    return storage.get(Target) as ClassMetadata;
  }

  private getAllTargetsFromStorage(storage: Map<Constructor, ClassMetadata>) {
    return storage.keys();
  }

  private storeTargetIfNotStored(storage: Map<Constructor, ClassMetadata>, Target: Constructor) {
    if (!storage.has(Target)) {
      storage.set(Target, new ClassMetadataImpl());
    }
  }
}
