import { Container } from "inversify";
import { ContainerHelper } from "../../containerHelper";
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
  IModule,
  ILoader,
  IControllerDecoConstructor,
  IServiceDecoConstructor,
  Injectable as IInjectable,
} from "../interface";
import { Get, Post } from "../methods";
import { IConfig, Module } from "../module";

// TODO: Check if manual garbage collection is faster
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
  let AppModuleCreator: { new (): IModuleClassManager };

  beforeAll(() => {
    [serviceAdapter, controllerAdapter] = setUp2();
    [
      Controller1,
      Controller2,
      Service1,
      Service2,
      Service3,
      AppModuleCreator,
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
        expect(AppModuleCreator).toBeDefined();
      });
    });
  });

  describe(`test for created module instance`, () => {
    let module: IModule;

    beforeAll(() => {
      module = new AppModuleCreator().createModuleInstance();
    });

    test(`should be defined`, () => {
      expect(module).toBeDefined();
    });

    test(`should be of type 'object'`, () => {
      expect(typeof module).toBe("object");
    });

    describe(`test for method 'load'`, () => {
      let load: IModule["load"];
      beforeAll(() => {
        load = module.load.bind(module);
      });

      test(`should be defined`, () => {
        expect(load).toBeDefined();
      });

      test(`should be of type 'function'`, () => {
        expect(typeof load).toBe("function");
      });

      describe("test for calls", () => {
        let mockServiceLoader: ILoader<
          IServiceDecoConstructor,
          IServiceAdapter
        >;
        let mockControllerLoader: ILoader<
          IControllerDecoConstructor,
          IControllerAdapter
        >;

        describe("test for behaviour on call", () => {
          let loaderSetUp: any;
          let load: IModule["load"];

          beforeAll(() => {
            load = module.load.bind(module);
            loaderSetUp = () => load(mockServiceLoader, mockControllerLoader);
            mockServiceLoader = {
              getInstance: jest.fn(),
              load: jest.fn(),
            };
            mockControllerLoader = {
              getInstance: jest.fn(),
              load: jest.fn(),
            };
          });

          test(`should not throw`, () => {
            expect(loaderSetUp).not.toThrow();
          });

          test(`should return`, () => {
            expect(loaderSetUp()).toBeDefined();
          });
        });

        describe(`test for return value`, () => {
          let exportContainer: Container;
          let module: IModule;
          let load: IModule["load"];

          beforeAll(() => {
            module = new AppModuleCreator().createModuleInstance();
            load = module.load.bind(module);
            exportContainer = load(mockServiceLoader, mockControllerLoader);
          });

          test(`should be defined`, () => {
            expect(exportContainer).toBeDefined();
          });

          test(`should of type 'Container'`, () => {
            expect(exportContainer).toBeInstanceOf(Container);
          });

          describe(`test for behaviour`, () => {
            let getInstance: any;
            getInstance = (injectable: IInjectable) => {
              return new ContainerHelper().get(exportContainer, injectable);
            };
            describe(`test for get on 'Service1'`, () => {
              test(`should throw`, () => {
                expect(() => getInstance(Service1)).toThrow();
              });
            });
            describe(`test for get on 'Service2'`, () => {
              test(`should not throw`, () => {
                expect(() => getInstance(Service2)).not.toThrow();
              });

              describe(`test for returned instance`, () => {
                let service2Instance: any;
                beforeAll(() => {
                  service2Instance = getInstance(Service2);
                });
                test(`should to defined`, () => {
                  expect(service2Instance).toBeDefined();
                });

                test(`should to instance of 'Service2'`, () => {
                  expect(service2Instance).toBeInstanceOf(Service2);
                });
              });
            });

            describe(`test for get on 'Service3'`, () => {
              test(`should not throw`, () => {
                expect(() => getInstance(Service3)).not.toThrow();
              });

              describe(`test for returned instance`, () => {
                let service2Instance: any;
                beforeAll(() => {
                  service2Instance = getInstance(Service3);
                });
                test(`should to defined`, () => {
                  expect(service2Instance).toBeDefined();
                });

                test(`should to instance of 'Service3'`, () => {
                  expect(service2Instance).toBeInstanceOf(Service3);
                });
              });
            });

            describe(`test for get on 'Controller1'`, () => {
              test(`should throw`, () => {
                expect(() => getInstance(Controller1)).toThrow();
              });
            });

            describe(`test for get on 'Controller2'`, () => {
              test(`should throw`, () => {
                expect(() => getInstance(Controller2)).toThrow();
              });
            });
          });
        });
        // TODO: Repharse from here down to be test for 'ServiceLoader' and 'ControllerLoader'
        // TODO: Also test to see that argument from 'getInstance' is passed to 'load'
        describe(`test for 'Service' types`, () => {
          describe(`test for action with 'Service1'`, () => {
            describe(`test for call on 'ServiceLoader'`, () => {
              describe(`test for arguments passed`, () => {
                test.todo(`should be called with two aruments`);

                describe(`test for first arument`, () => {
                  test.todo(`should be defined`);

                  test.todo(`should be of type Container`);
                });

                describe(`test for second arument`, () => {
                  test.todo(`should be defined`);

                  describe("test for its properties", () => {
                    test.todo(`should have 'INJECTABLE_KEY'`);
                    describe(`test for 'INJECTABLE_KEY'`, () => {
                      test.todo(`should be defined`);

                      test.todo(`should be one of`);
                    });
                  });
                });
              });
            });
          });

          describe(`test for action with 'Service2'`, () => {
            describe(`test for call on 'ServiceLoader'`, () => {
              describe(`test for arguments passed`, () => {
                test.todo(`should be called with two aruments`);

                describe(`test for first arument`, () => {
                  test.todo(`should be defined`);

                  test.todo(`should be of type Container`);
                });

                describe(`test for second arument`, () => {
                  test.todo(`should be defined`);

                  describe("test for its properties", () => {
                    test.todo(`should have 'INJECTABLE_KEY'`);
                    describe(`test for 'INJECTABLE_KEY'`, () => {
                      test.todo(`should be defined`);

                      test.todo(`should be one of`);
                    });
                  });
                });
              });
            });
          });

          describe(`test for action with 'Service3'`, () => {
            describe(`test for call on 'ServiceLoader'`, () => {
              describe(`test for arguments passed`, () => {
                test.todo(`should be called with two aruments`);

                describe(`test for first arument`, () => {
                  test.todo(`should be defined`);

                  test.todo(`should be of type Container`);
                });

                describe(`test for second arument`, () => {
                  test.todo(`should be defined`);

                  describe("test for its properties", () => {
                    test.todo(`should have 'INJECTABLE_KEY'`);
                    describe(`test for 'INJECTABLE_KEY'`, () => {
                      test.todo(`should be defined`);

                      test.todo(`should be one of`);
                    });
                  });
                });
              });
            });
          });
        });

        describe(`test for 'Controller' types`, () => {
          describe(`test for action with 'Controller1'`, () => {
            describe(`test for call on 'ControllerLoader'`, () => {
              describe(`test for arguments passed`, () => {
                test.todo(`should be called with two aruments`);

                describe(`test for first arument`, () => {
                  test.todo(`should be defined`);

                  test.todo(`should be of type Container`);
                });

                describe(`test for second arument`, () => {
                  test.todo(`should be defined`);

                  describe("test for its properties", () => {
                    test.todo(`should have 'INJECTABLE_KEY'`);
                    describe(`test for 'INJECTABLE_KEY'`, () => {
                      test.todo(`should be defined`);

                      test.todo(`should be one of`);
                    });
                  });
                });
              });
            });
          });

          describe(`test for action with 'Controller2'`, () => {
            describe(`test for call on 'ControllerLoader'`, () => {
              describe(`test for arguments passed`, () => {
                test.todo(`should be called with two aruments`);

                describe(`test for first arument`, () => {
                  test.todo(`should be defined`);

                  test.todo(`should be of type Container`);
                });

                describe(`test for second arument`, () => {
                  test.todo(`should be defined`);

                  describe("test for its properties", () => {
                    test.todo(`should have 'INJECTABLE_KEY'`);
                    describe(`test for 'INJECTABLE_KEY'`, () => {
                      test.todo(`should be defined`);

                      test.todo(`should be one of`);
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
