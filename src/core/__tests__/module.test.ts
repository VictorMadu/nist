import { Container } from "inversify";
import { ConstructorReturnType, Constructor } from "../../types";
import { INJECTABLE_KEY } from "../constant";
import { Controller } from "../controller";
import { Inject } from "../inject";
import { Injectable } from "../injectable";
import {
  IServiceAdapter,
  IControllerAdapter,
  IService,
  IModuleClass,
  IModuleClassManager,
} from "../interface";
import { Get, Post } from "../methods";
import { IConfig, Module } from "../module";
import { ServiceLoader } from "../service.loader";

const setUp1 = (): [Constructor, IModuleClassManager] => {
  class ModuleClass {}
  const config: IConfig = {
    imports: [],
    controllers: [],
    services: [],
    exports: [],
  };
  const ModuleClassMangaer = Module(config)(ModuleClass);

  return [ModuleClass, new ModuleClassMangaer()];
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

const setUp3 = (importModules: Constructor[] = []) => {
  @Injectable()
  class Service1 {
    sevice1Method() {
      return "sevice1Method";
    }
  }

  @Injectable()
  class Service2 {
    sevice2Method() {
      return "sevice2Method";
    }
  }

  @Injectable()
  class Service3 {
    constructor(@Inject(Service2) private service2: Service2) {}
    sevice3Method() {
      return this.service2.sevice2Method() + "sevice3Method";
    }
  }
  @Controller()
  class Controller1 {
    constructor(@Inject(Service1) private service1: Service1) {}

    @Get()
    method1() {
      return this.service1.sevice1Method();
    }
  }

  @Controller()
  class Controller2 {
    constructor(
      @Inject(Service1) private service1: Service1,
      @Inject(Service2) private service2: Service2
    ) {}

    @Post()
    method1() {
      return this.service1.sevice1Method() + this.service2.sevice2Method();
    }
  }

  const container = new Container({ defaultScope: "Singleton" });
  const controllerContainer = new Container({ defaultScope: "Singleton" });
  container.bind((Service1 as any)[INJECTABLE_KEY]).to(Service1);
  container.bind((Service2 as any)[INJECTABLE_KEY]).to(Service2);
  container.bind((Service3 as any)[INJECTABLE_KEY]).to(Service3);
  controllerContainer
    .bind((Controller1 as any)[INJECTABLE_KEY])
    .to(Controller1);
  controllerContainer
    .bind((Controller2 as any)[INJECTABLE_KEY])
    .to(Controller2);

  const container1 = Container.merge(container, controllerContainer).get<
    Controller1
  >((Controller1 as any)[INJECTABLE_KEY]);
  const container2 = Container.merge(container, controllerContainer).get<
    Controller2
  >((Controller2 as any)[INJECTABLE_KEY]);
  console.log("container1", JSON.stringify(container1.method1()));
  console.log("container2", JSON.stringify(container2.method1()));

  const config: IConfig = {
    imports: importModules,
    controllers: [Controller1, Controller2],
    services: [Service1, Service2, Service3],
    exports: [Service2, Service3],
  };
  @Module(config)
  class AppModule {}

  return [
    Controller1,
    Controller2,
    Service1,
    Service2,
    Service3,
    AppModule,
  ] as [
    Constructor,
    Constructor,
    Constructor,
    Constructor,
    Constructor,
    { new (): IModuleClassManager }
  ];
};

describe(`test for 'Module'`, () => {
  let serviceAdapter: IServiceAdapter;
  let controllerAdapter: IControllerAdapter;

  let Controller1: Constructor;
  let Controller2: Constructor;
  let Service1: Constructor;
  let Service2: Constructor;
  let Service3: Constructor;
  let AppModule: { new (): IModuleClassManager };

  beforeAll(() => {
    [serviceAdapter, controllerAdapter] = setUp2();
    [
      Controller1,
      Controller2,
      Service1,
      Service2,
      Service3,
      AppModule,
    ] = setUp3();
  });

  describe(`test to check if returns of 'setUp3' is defined`, () => {
    describe(`test for 'Controller1'`, () => {
      test(`should be defined`, () => {
        expect(Controller1).toBeDefined();
      });
    });

    describe(`test for 'Controller2'`, () => {
      test(`should be defined`, () => {
        expect(Controller2).toBeDefined();
      });
    });

    describe(`test for 'Service1'`, () => {
      test(`should be defined`, () => {
        expect(Service1).toBeDefined();
      });
    });

    describe(`test for 'Service2'`, () => {
      test(`should be defined`, () => {
        expect(Service2).toBeDefined();
      });
    });

    describe(`test for 'Service3'`, () => {
      test(`should be defined`, () => {
        expect(Service3).toBeDefined();
      });
    });

    describe(`test for 'AppModule'`, () => {
      test(`should be defined`, () => {
        expect(AppModule).toBeDefined();
      });
    });
  });

  // describe(`test for instance of 'AppModule'`, () => {
  //   let moduleManager: IModuleClassManager;
  //   let module: {
  //     load: () => Container;
  //   };

  //   beforeAll(() => {
  //     moduleManager = new AppModule();
  //     module = moduleManager.createModuleInstance(
  //       serviceAdapter,
  //       controllerAdapter
  //     );
  //   });

  //   describe(`test for 'module'`, () => {
  //     test(`should be defined`, () => {
  //       expect(module).toBeDefined();
  //     });

  //     describe(`test for method 'load'`, () => {
  //       let exportContainer: Container;
  //       beforeAll(() => {
  //         exportContainer = module.load();
  //       });

  //       test(`should be defined`, () => {
  //         expect(exportContainer).toBeDefined();
  //       });

  //       describe(`test for exportContainer`, () => {
  //         describe(`test to check Service1 behaviour`, () => {
  //           test(`should throw since it is not exported`, () => {
  //             expect(() =>
  //               exportContainer.get((Service1 as any)[INJECTABLE_KEY])
  //             ).toThrow();
  //           });
  //         });

  //         describe(`test to check Service2 behaviour`, () => {
  //           test(`should be defined`, () => {
  //             expect(
  //               exportContainer.get((Service2 as any)[INJECTABLE_KEY])
  //             ).toBeDefined();
  //           });
  //         });

  //         describe(`test to check Service3 behaviour`, () => {
  //           test(`should be defined`, () => {
  //             expect(
  //               exportContainer.get((Service3 as any)[INJECTABLE_KEY])
  //             ).toBeDefined();
  //           });
  //         });

  //         describe(`test to check Controller1 behaviour`, () => {
  //           test(`should throw since it is not exported`, () => {
  //             expect(() =>
  //               exportContainer.get((Controller1 as any)[INJECTABLE_KEY])
  //             ).toThrow();
  //           });
  //         });

  //         describe(`test to check Controller2 behaviour`, () => {
  //           test(`should throw since it is not exported`, () => {
  //             expect(() =>
  //               exportContainer.get((Controller2 as any)[INJECTABLE_KEY])
  //             ).toThrow();
  //           });
  //         });

  //         test(`instance for 'Service2' should be defined`, () => {
  //           expect(
  //             exportContainer.get((Service2 as any)[INJECTABLE_KEY])
  //           ).toBeDefined();
  //         });

  //         test(`instance for 'Service3' should be defined`, () => {
  //           expect(
  //             exportContainer.get((Service3 as any)[INJECTABLE_KEY])
  //           ).toBeDefined();
  //         });
  //       });
  //     });
  //   });
  // });

  // describe(`test to check if Services were passed to instance of 'ServiceAdapter'`, () => {

  //   let mockServiceLoadFn = jest.fn(() => {load: (service: any) => {}})
  //   let mockServiceLoaderConstructor = jest.fn(() => mockServiceLoadFn)
  //   let spyServiceLoader: jest.SpyInstance = jest.spyOn()

  //   jest.fn(() => mockServiceLoaderConstructor);

  //   let mockControllerLoadFn = jest.fn(() => {load: (service: any) => {}})
  //   let mockControllerLoaderConstructor = jest.fn(() => mockControllerLoadFn)
  //   let controlerLoaderMock: jest.Mock = jest.fn(() => mockControllerLoaderConstructor);

  //   let moduleManager: IModuleClassManager;
  //   let module: {load: () => Container};

  //   beforeAll(() => {
  //     moduleManager = new AppModule();
  //     module = moduleManager.createModuleInstance(
  //       serviceAdapter,
  //       controllerAdapter
  //     );
  //   });
  // });

  describe(`test to check if Controllers were passed to instance of 'ControllerAdapter'`, () => {});
});

// describe(`test to check if controllers and services where instantiated once`, () => {});

// test(`should be defined`, () => {
//   expect(module).toBeDefined();
// });

// test(`should have method 'load'`, () => {
//   expect(module.load).toBeDefined();
// });

// test(`should have method 'load' of type Function`, () => {
//   expect(typeof module.load).toBe("function");
// });

// describe(`test for return of the method 'load'`, () => {
//   let container: any;
//   beforeAll(() => {
//     container = module.load();
//   });
//   test(`should be defined`, () => {
//     expect(container).toBeDefined();
//   });
//   test(`should be an instance of 'Container'`, () => {
//     expect(container).toBeInstanceOf(Container);
//   });
// });
