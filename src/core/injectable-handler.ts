import {
  IClassMetadata,
  IInjectableHandler,
  IMethodsMetadata,
  IMethodsParamDeco,
} from "./interface/injectable-handler.interface";

// Injectable handler. Creates a unique key which will be used for binding to the dependency injectable container. Also stores the Class's metadta

export class InjectableHandler implements IInjectableHandler {
  private key = Symbol();
  classMetaData: IClassMetadata = {}; // eg: overall and constructor
  methodsMetaData: IMethodsMetadata = {};
  methodsParamDeco: IMethodsParamDeco = {};

  public getKey() {
    return this.key;
  }
}

export default InjectableHandler;
