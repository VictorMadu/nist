import { Container } from "inversify";
import { ContainerHelper } from "../../containerHelper";
import { ConstructorReturnType } from "src/types";
import { Injectable as IInjectable } from "../interface";
import { ServiceLoader } from "../service.loader";
import { Injectable } from "../injectable";

describe(`test for 'ServiceLoader'`, () => {
  test(`should be defined`, () => {
    expect(ServiceLoader).toBeDefined();
  });
  test(`should be of type 'function'`, () => {
    expect(typeof ServiceLoader).toBe("function");
  });

  test(`should be have method 'getInstance'`, () => {
    expect(ServiceLoader.prototype.getInstance).toBeDefined();
  });
  test(`should be have method 'load'`, () => {
    expect(ServiceLoader.prototype.load).toBeDefined();
  });

  describe(`test for method 'getInstance'`, () => {
    let serviceLoader: ServiceLoader;
    let mockServiceAdapter = {
      attachLifeCycleListener: jest.fn((a: any) => a),
    };

    beforeAll(() => {
      serviceLoader = new ServiceLoader(mockServiceAdapter as any);
    });

    describe(`test for setUp`, () => {
      describe(`test for 'mockServiceAdapter'`, () => {
        test(`should be defined`, () => {
          expect(mockServiceAdapter).toBeDefined();
        });
        test(`should have prop 'attachLifeCycleListener'`, () => {
          expect(mockServiceAdapter).toHaveProperty("attachLifeCycleListener");
        });
        describe(`test for property 'attachLifeCycleListener'`, () => {
          test(`should be defined`, () => {
            expect(mockServiceAdapter.attachLifeCycleListener).toBeDefined();
          });
          test(`should be of type 'function'`, () => {
            expect(typeof mockServiceAdapter.attachLifeCycleListener).toBe(
              "function"
            );
          });
        });
      });
    });
    test(`should be defined`, () => {
      expect(serviceLoader).toBeDefined();
    });
    test(`should be of type 'object'`, () => {
      expect(typeof serviceLoader).toBe("object");
    });

    describe(`test for method 'getInstance'`, () => {
      let getInstance: any;

      beforeAll(() => {
        getInstance = serviceLoader.getInstance.bind(serviceLoader);
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
        load = serviceLoader.load.bind(serviceLoader);
      });

      test(`should be defined`, () => {
        expect(load).toBeDefined();
      });
      test(`should be of type 'function'`, () => {
        expect(typeof load).toBe("function");
      });

      describe(`test for calls`, () => {
        let service: any;
        beforeAll(() => {
          service = "SERVICE";
        });
        test(`should not throw`, () => {
          expect(() => load(service)).not.toThrow();
        });
        describe(`test for 'ServiceAdapter'`, () => {
          describe(`test for method 'attachLifeCycleListener'`, () => {
            let attachLifeCycleListener: jest.Mock;
            beforeAll(() => {
              attachLifeCycleListener =
                mockServiceAdapter.attachLifeCycleListener;
            });
            describe(`test for no. of calls`, () => {
              test(`should be once`, () => {
                expect(attachLifeCycleListener.mock.calls).toHaveLength(1);
              });
            });
            describe(`test for arguments passed`, () => {
              test(`should be one`, () => {
                expect(attachLifeCycleListener.mock.calls[0]).toHaveLength(1);
              });
              test(`should be same as passed to 'load'`, () => {
                expect(attachLifeCycleListener.mock.calls[0][0]).toBe(service);
              });
            });
          });
        });
      });
    });
  });
});
