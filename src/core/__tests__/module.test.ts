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
    test.todo(`should be defined`, () => {});

    test.todo(`should be of type 'object'`, () => {});

    describe(`test for method 'load'`, () => {
      test.todo(`should be defined`, () => {});

      test.todo(`should be of type 'function'`, () => {});

      describe("test for calls", () => {
        test.todo(`should not throw`, () => {});

        test.todo(`should return`, () => {});

        describe(`test for return value`, () => {
          test.todo(`should be defined`, () => {});

          test.todo(`should of type 'Container'`, () => {});

          describe(`test for behaviour`, () => {
            describe(`test for get on 'Service1'`, () => {
              test.todo(`should throw`, () => {});
            });
            describe(`test for get on 'Service2'`, () => {
              test.todo(`should not throw`, () => {});

              describe(`test for returned instance`, () => {
                test.todo(`should to defined`, () => {});

                test.todo(`should to defined`, () => {});

                test.todo(`should to instance of 'Service2'`, () => {});
              });
            });

            describe(`test for get on 'Service3'`, () => {
              test.todo(`should not throw`, () => {});

              describe(`test for returned instance`, () => {
                test.todo(`should to defined`, () => {});

                test.todo(`should to defined`, () => {});

                test.todo(`should to instance of 'Service3'`, () => {});
              });
            });

            describe(`test for get on 'Controller1'`, () => {
              test.todo(`should throw`, () => {});
            });

            describe(`test for get on 'Controller2'`, () => {
              test.todo(`should throw`, () => {});
            });
          });
        });

        describe(`test for 'Service' types`, () => {
          describe(`test for action with 'Service1'`, () => {
            describe(`test for call on 'ServiceLoader'`, () => {
              describe(`test for arguments passed`, () => {
                test.todo(`should be called with two aruments`, () => {});

                describe(`test for first arument`, () => {
                  test.todo(`should be defined`, () => {});

                  test.todo(`should be of type Container`, () => {});
                });

                describe(`test for second arument`, () => {
                  test.todo(`should be defined`, () => {});

                  describe("test for its properties", () => {
                    test.todo(`should have 'INJECTABLE_KEY'`, () => {});
                    describe(`test for 'INJECTABLE_KEY'`, () => {
                      test.todo(`should be defined`, () => {});

                      test.todo(`should be one of`, () => {});
                    });
                  });
                });
              });
            });
          });

          describe(`test for action with 'Service2'`, () => {
            describe(`test for call on 'ServiceLoader'`, () => {
              describe(`test for arguments passed`, () => {
                test.todo(`should be called with two aruments`, () => {});

                describe(`test for first arument`, () => {
                  test.todo(`should be defined`, () => {});

                  test.todo(`should be of type Container`, () => {});
                });

                describe(`test for second arument`, () => {
                  test.todo(`should be defined`, () => {});

                  describe("test for its properties", () => {
                    test.todo(`should have 'INJECTABLE_KEY'`, () => {});
                    describe(`test for 'INJECTABLE_KEY'`, () => {
                      test.todo(`should be defined`, () => {});

                      test.todo(`should be one of`, () => {});
                    });
                  });
                });
              });
            });
          });

          describe(`test for action with 'Service3'`, () => {
            describe(`test for call on 'ServiceLoader'`, () => {
              describe(`test for arguments passed`, () => {
                test.todo(`should be called with two aruments`, () => {});

                describe(`test for first arument`, () => {
                  test.todo(`should be defined`, () => {});

                  test.todo(`should be of type Container`, () => {});
                });

                describe(`test for second arument`, () => {
                  test.todo(`should be defined`, () => {});

                  describe("test for its properties", () => {
                    test.todo(`should have 'INJECTABLE_KEY'`, () => {});
                    describe(`test for 'INJECTABLE_KEY'`, () => {
                      test.todo(`should be defined`, () => {});

                      test.todo(`should be one of`, () => {});
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
                test.todo(`should be called with two aruments`, () => {});

                describe(`test for first arument`, () => {
                  test.todo(`should be defined`, () => {});

                  test.todo(`should be of type Container`, () => {});
                });

                describe(`test for second arument`, () => {
                  test.todo(`should be defined`, () => {});

                  describe("test for its properties", () => {
                    test.todo(`should have 'INJECTABLE_KEY'`, () => {});
                    describe(`test for 'INJECTABLE_KEY'`, () => {
                      test.todo(`should be defined`, () => {});

                      test.todo(`should be one of`, () => {});
                    });
                  });
                });
              });
            });
          });

          describe(`test for action with 'Controller2'`, () => {
            describe(`test for call on 'ControllerLoader'`, () => {
              describe(`test for arguments passed`, () => {
                test.todo(`should be called with two aruments`, () => {});

                describe(`test for first arument`, () => {
                  test.todo(`should be defined`, () => {});

                  test.todo(`should be of type Container`, () => {});
                });

                describe(`test for second arument`, () => {
                  test.todo(`should be defined`, () => {});

                  describe("test for its properties", () => {
                    test.todo(`should have 'INJECTABLE_KEY'`, () => {});
                    describe(`test for 'INJECTABLE_KEY'`, () => {
                      test.todo(`should be defined`, () => {});

                      test.todo(`should be one of`, () => {});
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
