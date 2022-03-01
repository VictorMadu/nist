import { ConstructorReturnType } from "src/types";
import { INJECTABLE_KEY, METADATA_KEY } from "../constant";
import { Controller, IReturnTypeControllerFn } from "../controller";
import * as injectable from "../injectable";

const setUp1 = () => {
  class ControllerClass {}
  const DecoratedControllerClass = Controller()(ControllerClass);

  return [ControllerClass, DecoratedControllerClass];
};

const setUp2 = (
  path?: string
): [
  IReturnTypeControllerFn,
  ConstructorReturnType<IReturnTypeControllerFn>
] => {
  @Controller(path)
  class ControllerClass {}
  const mControllerClass = new (ControllerClass as IReturnTypeControllerFn)();

  return [ControllerClass as IReturnTypeControllerFn, mControllerClass];
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
    });

    test(`should be called once`, () => {
      expect(mockInjectable).toBeCalledTimes(1);
    });

    test(`should return function first call be 'ControllerClass`, () => {
      expect(mockInjectableReturnFn.mock.calls[0]).toHaveLength(1);
      expect(mockInjectableReturnFn.mock.calls[0][0]).toBe(ControllerClass);
    });
  });

  describe(`test to check the props of 'Controller'`, () => {
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
        expect(mControllerClass[METADATA_KEY]).toEqual({ basePath: "" });
      });

      test(`should have a correct value2`, () => {
        const path = "";
        const [_, mControllerClass]: any = setUp2(path);
        expect(mControllerClass[METADATA_KEY]).toEqual({
          basePath: path,
        });
      });

      test(`should have a correct value3`, () => {
        const path = "/cats";
        const [_, mControllerClass]: any = setUp2(path);
        expect(mControllerClass[METADATA_KEY]).toEqual({
          basePath: path,
        });
      });

      test(`should have a correct value4`, () => {
        const path = "/cats/:id";
        const [_, mControllerClass]: any = setUp2(path);
        expect(mControllerClass[METADATA_KEY]).toEqual({
          basePath: path,
        });
      });

      test(`should have a correct value5`, () => {
        const path = "/cats/:id/posts";
        const [_, mControllerClass]: any = setUp2(path);
        expect(mControllerClass[METADATA_KEY]).toEqual({
          basePath: path,
        });
      });
    });
  });
});
