import { Container } from "inversify";
import { ConstructorReturnType } from "../../types";
import { Controller } from "../controller";
import { Inject } from "../inject";
import { Injectable } from "../injectable";
import { IServiceAdapter, IControllerAdapter, IService } from "../interface";
import { Get } from "../methods";
import {
  getExportContainer,
  IConfig,
  IModuleClass,
  Module,
  ModuleClassManager,
} from "../module";

const setUp1 = (): [{ new (...args: any[]): any }, ModuleClassManager] => {
  class ModuleClass {}
  const config: IConfig = {
    imports: [],
    controllers: [],
    services: [],
    exports: [],
  };
  const moduleClassMangaer = Module(config)(ModuleClass);

  return [ModuleClass, moduleClassMangaer];
};

const setUp2 = (): [IServiceAdapter, IControllerAdapter] => {
  class ServiceAdapter {
    attachLifeCycleListener(service: IService) {}
  }

  class ControllerAdapter {
    attachToRoute(routeConfig: {}, baseConfig: { basePath: string }) {}
  }

  return [new ServiceAdapter(), new ControllerAdapter()];
};

describe(`test for 'Module'`, () => {
  let ModuleClass: { new (...args: any[]): any };
  let moduleManager: ModuleClassManager;
  let serviceAdapter: IServiceAdapter;
  let controllerAdapter: IControllerAdapter;
  let module: ConstructorReturnType<IModuleClass>;

  beforeAll(() => {
    [ModuleClass, moduleManager] = setUp1();
    [serviceAdapter, controllerAdapter] = setUp2();
    module = moduleManager.createModuleInstance(
      serviceAdapter,
      controllerAdapter
    );
  });

  describe(`test for ModuleClass instance`, () => {
    test(`should be defined`, () => {
      expect(module).toBeDefined();
    });

    test(`should have method 'load'`, () => {
      expect(module.load).toBeDefined();
    });

    test(`should have method 'load' of type Function`, () => {
      expect(typeof module.load).toBe("function");
    });

    describe(`test for return of the method 'load'`, () => {
      let container: any;
      beforeAll(() => {
        container = module.load();
      });
      test(`should be defined`, () => {
        expect(container).toBeDefined();
      });
      test(`should be an instance of 'Container'`, () => {
        expect(container).toBeInstanceOf(Container);
      });
    });
  });
});
