import { Container } from "inversify";
import { ContainerHelper } from "../../containerHelper";
import { ConstructorReturnType } from "../../types";
import { METADATA_KEY } from "../constant";
import { Controller } from "../controller";
import { ControllerLoader } from "../controller.loader";
import { Injectable } from "../injectable";
import { IControllerAdapter, Injectable as IInjectable } from "../interface";
import { Get } from "../methods";

describe(`test for 'ControllerLoader'`, () => {
  test(`should be defined`, () => {
    expect(ControllerLoader).toBeDefined();
  });
  test(`should be of type 'function'`, () => {
    expect(typeof ControllerLoader).toBe("function");
  });

  test(`should be have method 'getInstance'`, () => {
    expect(ControllerLoader.prototype.getInstance).toBeDefined();
  });
  test(`should be have method 'load'`, () => {
    expect(ControllerLoader.prototype.load).toBeDefined();
  });

  describe(`test for method 'getInstance'`, () => {
    let controllerLoader: ControllerLoader;
    let mockControllerAdapter = {
      attachToRoute: jest.fn((a: any) => a),
    };

    beforeAll(() => {
      controllerLoader = new ControllerLoader(mockControllerAdapter as any);
    });

    describe(`test for setUp`, () => {
      describe(`test for 'mockControllerAdapter'`, () => {
        test(`should be defined`, () => {
          expect(mockControllerAdapter).toBeDefined();
        });
        test(`should have prop 'attachToRoute'`, () => {
          expect(mockControllerAdapter).toHaveProperty("attachToRoute");
        });
        describe(`test for property 'attachToRoute'`, () => {
          test(`should be defined`, () => {
            expect(mockControllerAdapter.attachToRoute).toBeDefined();
          });
          test(`should be of type 'function'`, () => {
            expect(typeof mockControllerAdapter.attachToRoute).toBe("function");
          });
        });
      });
    });
    test(`should be defined`, () => {
      expect(controllerLoader).toBeDefined();
    });
    test(`should be of type 'object'`, () => {
      expect(typeof controllerLoader).toBe("object");
    });

    describe(`test for method 'getInstance'`, () => {
      let getInstance: any;

      beforeAll(() => {
        getInstance = controllerLoader.getInstance.bind(controllerLoader);
      });

      test(`should be defined`, () => {
        expect(getInstance).toBeDefined();
      });
      test(`should be of type 'function'`, () => {
        expect(typeof getInstance).toBe("function");
      });

      describe(`test for calls`, () => {
        let container: Container;
        let Service: any;
        let setUp = () => {
          const container = new Container();
          @Injectable()
          class Service {}
          return [container, Service] as [Container, IInjectable];
        };

        describe(`test when with wrong argument`, () => {
          beforeAll(() => {
            [container, Service] = setUp();
          });
          test(`should throw`, () => {
            expect(() => getInstance(container, Service)).toThrow();
          });
        });
        describe(`test when with correct arguments`, () => {
          beforeAll(() => {
            [container, Service] = setUp();
            new ContainerHelper().bind(container, Service);
          });

          test(`should not throw`, () => {
            expect(() => getInstance(container, Service)).not.toThrow();
          });

          describe(`test for return value`, () => {
            let instance: ConstructorReturnType<typeof Service>;
            beforeAll(() => {
              instance = getInstance(container, Service);
            });
            test(`should be defined`, () => {
              expect(instance).toBeDefined();
            });
            test(`should be instance of second argument`, () => {
              expect(instance).toBeInstanceOf(Service);
            });
          });
        });
      });
    });

    describe(`test for method 'load`, () => {
      let load: any;
      beforeAll(() => {
        load = controllerLoader.load.bind(controllerLoader);
      });

      test(`should be defined`, () => {
        expect(load).toBeDefined();
      });
      test(`should be of type 'function'`, () => {
        expect(typeof load).toBe("function");
      });

      describe(`test for calls`, () => {
        let controller: any;
        describe(`test for 'ControllerCass' instance methods`, () => {
          describe(`test when has 'METADATA_KEY' as method name`, () => {
            beforeAll(() => {
              class ControllerCass {
                [METADATA_KEY]() {}
              }

              controller = new ControllerCass();
            });

            afterAll(() => {
              mockControllerAdapter.attachToRoute.mockClear();
            });

            test(`should throw`, () => {
              expect(() => controllerLoader.load(controller)).toThrow();
            });
          });
        });
        describe(`test when not have 'METADATA_KEY' as method name`, () => {
          beforeAll(() => {
            class ControllerCass {
              [METADATA_KEY + "additionalText"]() {}
            }

            controller = new ControllerCass();
          });
          test(`should not throw`, () => {
            expect(() => controllerLoader.load(controller)).not.toThrow();
          });
        });
        describe(`test for ControllerAdapter`, () => {
          let mockAttachToRoute: jest.Mock<IControllerAdapter["attachToRoute"]>;
          beforeAll(() => {
            mockAttachToRoute = mockControllerAdapter.attachToRoute;
          });

          describe(`test for calls on 'ControllerAdapter''s 'attachToRoute'`, () => {
            describe(`test for no. of calls`, () => {
              beforeEach(() => {
                mockAttachToRoute.mockClear();
                controllerLoader.load(controller);
              });
              describe(`test when 'ControllerClas' instance has no method`, () => {
                beforeAll(() => {
                  class ControllerCass {}
                  controller = new ControllerCass();
                });

                test(`should be zero`, () => {
                  expect(mockAttachToRoute.mock.calls).toHaveLength(0);
                });
              });
              describe(`test when 'ControllerClas' instance has one method`, () => {
                beforeAll(() => {
                  class ControllerCass {
                    method1() {}
                  }
                  controller = new ControllerCass();
                });

                test(`should be one`, () => {
                  expect(mockAttachToRoute.mock.calls).toHaveLength(1);
                });
              });

              describe(`test when 'ControllerClas' instance has two method`, () => {
                beforeAll(() => {
                  class ControllerCass {
                    method1() {}
                    method2() {}
                  }
                  controller = new ControllerCass();
                });

                test(`should be two`, () => {
                  expect(mockAttachToRoute.mock.calls).toHaveLength(2);
                });
              });
            });
          });
          describe(`test for arguments passed to controllerAdapter's 'attachToRoute`, () => {
            let controllerPath: string;
            let methodPath: string;
            let methodConfig: Record<string, any>;

            beforeAll(() => {
              controllerPath = "/cat";
              methodPath = "/post/:id";
              methodConfig = {
                decorator: Get,
                method: "GET",
              };
              @Controller(controllerPath)
              class ControllerCass {
                @((methodConfig.decorator as any)(methodPath))
                method1() {}
              }
              controller = new ControllerCass();
              mockAttachToRoute.mockClear();
              controllerLoader.load(controller);
            });
            describe(`test for no. of calls`, () => {
              test(`should be once`, () => {
                expect(mockAttachToRoute.mock.calls).toHaveLength(1);
              });
            });
            describe(`test for first argument`, () => {
              let arg1: object;
              beforeAll(() => {
                arg1 = {
                  url: methodPath,
                  handler: controller.method1,
                  method: methodConfig.method,
                };
              });
              test(`should be equal to 'arg1'`, () => {
                expect(mockAttachToRoute.mock.calls[0][0]).toEqual(arg1);
              });
            });
            describe(`test for second argument`, () => {
              let arg1: object;
              beforeAll(() => {
                arg1 = {
                  basePath: controllerPath,
                };
              });
              test(`should be equal`, () => {
                expect(mockAttachToRoute.mock.calls[0][1]).toEqual(arg1);
              });
            });
          });
        });
      });
    });
  });
});
