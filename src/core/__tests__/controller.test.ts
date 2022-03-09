import { ConstructorReturnType } from "../../types";
import { INJECTABLE_KEY, METADATA_KEY } from "../constant";
import { HttpController, IReturnTypeControllerFn } from "../http-controller";
import * as injectable from "../injectable";
import { metaMethodDecorator } from "../metaDecorator";
import { Get, Post } from "../methods-decorators";
import * as _ from "lodash";
import {
  IController,
  IControllerClass,
} from "../interface/controller.interface";

const setUp1 = () => {
  class ControllerClass {}
  const DecoratedControllerClass = HttpController()(ControllerClass);

  return [ControllerClass, DecoratedControllerClass];
};

const setUp2 = (path?: string): [IControllerClass, IController] => {
  @HttpController(path)
  class ControllerClass {}
  const mControllerClass = new (ControllerClass as IControllerClass)();

  return [ControllerClass as IReturnTypeControllerFn, mControllerClass];
};

const setUp3 = (
  controllerPath: string | undefined = undefined,
  method1Path: string | undefined = undefined,
  method2Path: string | undefined = undefined
): [
  { new (...args: any[]): any },
  string,
  string,
  string,
  string,
  string,
  string
] => {
  const method1 = "method1";
  const method2 = "method2";
  const additionMethod1MetaKey = "additional";
  const additionMethod1MetaValue = "additional";
  const additionMethod2MetaKey = "additional";
  const additionMethod2MetaValue = "additional";
  @HttpController(controllerPath)
  class Controller1 {
    constructor() {}

    @((metaMethodDecorator as any)(
      additionMethod1MetaKey,
      additionMethod1MetaValue
    ))
    @Get(method1Path)
    [method1]() {
      return "method1";
    }

    @((metaMethodDecorator as any)(
      additionMethod2MetaKey,
      additionMethod2MetaValue
    ))
    @Post(method2Path)
    [method2]() {
      return "method1";
    }
  }

  return [
    Controller1,
    method1,
    method2,
    additionMethod1MetaKey,
    additionMethod1MetaValue,
    additionMethod2MetaKey,
    additionMethod2MetaValue,
  ];
};

describe(`test for controller`, () => {
  describe(`test for calls on 'Injectable'`, () => {
    let spyInjectable: jest.SpyInstance;
    let ControllerClass: { new (...args: any[]): any };
    let DecoratedControllerClass: { new (...args: any[]): any };
    const mockInjectableReturnFn = jest.fn(
      (a: { new (...args: any[]): any }) => a
    );
    const mockInjectable = jest.fn(() => mockInjectableReturnFn);

    beforeAll(() => {
      spyInjectable = jest.spyOn(injectable, "Injectable");
      spyInjectable.mockImplementation(mockInjectable);
      [ControllerClass, DecoratedControllerClass] = setUp1();
    });

    afterAll(() => {
      mockInjectable.mockClear();
      mockInjectableReturnFn.mockClear();
      spyInjectable.mockRestore();
    });

    test(`should be called once`, () => {
      expect(mockInjectable).toBeCalledTimes(1);
    });

    test(`should return function first call be 'ControllerClass`, () => {
      expect(mockInjectableReturnFn.mock.calls[0]).toHaveLength(1);
      expect(mockInjectableReturnFn.mock.calls[0][0]).toBe(ControllerClass);
    });
  });

  describe(`test to check the props of 'HttpController'`, () => {
    describe(`test to check the 'INJECTABLE_KEY'`, () => {
      const [MControllerClass] = setUp2();

      test(`should be defined`, () => {
        expect(MControllerClass[INJECTABLE_KEY]).toBeDefined();
      });

      test(`should be of type 'symbol'`, () => {
        expect(typeof MControllerClass[INJECTABLE_KEY]).toBe("symbol");
      });
    });

    describe(`test to check the 'METADATA_KEY'`, () => {
      test(`should be defined`, () => {
        const [_, mControllerClass] = setUp2();
        expect(mControllerClass[METADATA_KEY]).toBeDefined();
      });

      test(`should have a correct value1`, () => {
        const [_, mControllerClass]: any = setUp2();
        expect(mControllerClass[METADATA_KEY]).toEqual({ path: "" });
      });

      test(`should have a correct value2`, () => {
        const path = "";
        const [_, mControllerClass]: any = setUp2(path);
        expect(mControllerClass[METADATA_KEY]).toEqual({
          path: path,
        });
      });

      test(`should have a correct value3`, () => {
        const path = "/cats";
        const [_, mControllerClass]: any = setUp2(path);
        expect(mControllerClass[METADATA_KEY]).toEqual({
          path: path,
        });
      });

      test(`should have a correct value4`, () => {
        const path = "/cats/:id";
        const [_, mControllerClass]: any = setUp2(path);
        expect(mControllerClass[METADATA_KEY]).toEqual({
          path: path,
        });
      });

      test(`should have a correct value5`, () => {
        const path = "/cats/:id/posts";
        const [_, mControllerClass]: any = setUp2(path);
        expect(mControllerClass[METADATA_KEY]).toEqual({
          path: path,
        });
      });
    });
  });

  describe(`test for a fully constructed HttpController Class`, () => {
    describe(`test for default behaviour`, () => {
      let HttpController: { new (...args: any[]): any };
      let controller: any;
      let method1: string;
      let method2: string;
      let additionMethod1MetaKey: string;
      let additionMethod1MetaValue: string;
      let additionMethod2MetaKey: string;
      let additionMethod2MetaValue: string;

      let controllerPath: undefined = undefined;
      let method1Path = "";
      let method2Path = "/cat/:id/post";

      beforeAll(() => {
        [
          HttpController,
          method1,
          method2,
          additionMethod1MetaKey,
          additionMethod1MetaValue,
          additionMethod2MetaKey,
          additionMethod2MetaValue,
        ] = setUp3(controllerPath, method1Path, method2Path);

        controller = new HttpController();
      });
      test(`should 'HttpController' be defined`, () => {
        expect(HttpController).toBeDefined();
      });

      test(`should 'method1' be defined`, () => {
        expect(method1).toBeDefined();
      });
      test(`should 'method2' be defined`, () => {
        expect(method2).toBeDefined();
      });
      test(`should 'additionMethod1MetaKey' be defined`, () => {
        expect(additionMethod1MetaKey).toBeDefined();
      });
      test(`should 'additionMethod1MetaValue' be defined`, () => {
        expect(additionMethod1MetaValue).toBeDefined();
      });
      test(`should 'additionMethod2MetaKey' be defined`, () => {
        expect(additionMethod2MetaKey).toBeDefined();
      });
      test(`should 'additionMethod2MetaValue' be defined`, () => {
        expect(additionMethod2MetaValue).toBeDefined();
      });

      describe(`test for instance`, () => {
        test(`should be defined`, () => {
          expect(controller).toBeDefined();
        });
        describe(`test for 'METADATA'`, () => {
          test(`should be defined`, () => {
            expect(controller[METADATA_KEY]).toBeDefined();
          });
          describe(`test for properties`, () => {
            describe(`test for path`, () => {
              test(`should be defined`, () => {
                expect(controller[METADATA_KEY]).toHaveProperty("path");
              });
              test(`should be of type string`, () => {
                expect(typeof controller[METADATA_KEY].path).toBe("string");
              });
              test(`should be of correct value`, () => {
                expect(controller[METADATA_KEY].path).toBe("");
              });
            });
          });
        });
      });

      describe(`test for method1`, () => {
        let handler1: any;
        beforeAll(() => {
          handler1 = _.get(controller, method1);
        });
        test(`should be defined`, () => {
          expect(handler1).toBeDefined();
        });
        describe(`test for 'METADATA'`, () => {
          let handlerMetaData: any;
          beforeAll(() => {
            handlerMetaData = controller[method1][METADATA_KEY];
          });
          test(`should be defined`, () => {
            expect(handlerMetaData).toBeDefined();
          });
          describe(`test for 'method`, () => {
            let method: any;
            beforeAll(() => {
              method = handlerMetaData.method;
            });

            test(`should have prop 'method'`, () => {
              expect(handlerMetaData).toHaveProperty("method");
            });

            test(`should be defined`, () => {
              expect(method).toBeDefined();
            });
            test(`should be of correct value`, () => {
              expect(method).toBe("GET");
            });
          });
          describe(`test for 'path`, () => {
            let path: any;
            beforeAll(() => {
              path = handlerMetaData.path;
            });

            test(`should have prop 'path'`, () => {
              expect(handlerMetaData).toHaveProperty("path");
            });

            test(`should be defined`, () => {
              expect(path).toBeDefined();
            });
            test(`should be of correct value`, () => {
              expect(path).toBe(controllerPath ?? "" + method1Path);
            });
          });

          describe(`test for additional metaDecorator`, () => {
            describe(`test for 'additionMethod1MetaKey'`, () => {
              test(`should have property`, () => {
                expect(handlerMetaData).toHaveProperty(additionMethod1MetaKey);
              });

              test(`should be defined`, () => {
                expect(handlerMetaData[additionMethod1MetaKey]).toBeDefined();
              });

              test(`should be correct value`, () => {
                expect(handlerMetaData[additionMethod1MetaKey]).toBe(
                  additionMethod1MetaValue
                );
              });
            });
          });
        });
      });

      describe(`test for method2`, () => {
        let handler2: any;
        beforeAll(() => {
          handler2 = _.get(controller, method2);
        });
        test(`should be defined`, () => {
          expect(handler2).toBeDefined();
        });
        describe(`test for 'METADATA'`, () => {
          let handlerMetaData: any;
          beforeAll(() => {
            handlerMetaData = controller[method2][METADATA_KEY];
          });
          test(`should be defined`, () => {
            expect(handlerMetaData).toBeDefined();
          });
          describe(`test for 'method`, () => {
            let method: any;
            beforeAll(() => {
              method = handlerMetaData.method;
            });

            test(`should have prop 'method'`, () => {
              expect(handlerMetaData).toHaveProperty("method");
            });

            test(`should be defined`, () => {
              expect(method).toBeDefined();
            });
            // TODO: Automatic method name for here and also method1
            test(`should be of correct value`, () => {
              expect(method).toBe("POST");
            });
          });
          describe(`test for 'path`, () => {
            let path: any;
            beforeAll(() => {
              path = handlerMetaData.path;
            });

            test(`should have prop 'path'`, () => {
              expect(handlerMetaData).toHaveProperty("path");
            });

            test(`should be defined`, () => {
              expect(path).toBeDefined();
            });
            test(`should be of correct value`, () => {
              expect(path).toBe(controllerPath ?? "" + method2Path);
            });
          });

          describe(`test for additional metaDecorator`, () => {
            describe(`test for 'additionMethod2MetaKey'`, () => {
              test(`should have property`, () => {
                expect(handlerMetaData).toHaveProperty(additionMethod2MetaKey);
              });

              test(`should be defined`, () => {
                expect(handlerMetaData[additionMethod2MetaKey]).toBeDefined();
              });

              test(`should be correct value`, () => {
                expect(handlerMetaData[additionMethod2MetaKey]).toBe(
                  additionMethod2MetaValue
                );
              });
            });
          });
        });
      });
    });
  });
});
