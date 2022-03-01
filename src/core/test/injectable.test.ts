import { Injectable } from "../injectable";
import * as inversify from "inversify";
import { INJECTABLE_KEY } from "../constant";

describe(`test for Injectable`, () => {
  let spyInjectable: jest.SpyInstance;
  let DecoratedMClass: {
    new (...args: any[]): any;
    [INJECTABLE_KEY]: symbol;
  };
  class MClass {}

  const mockInjectableReturn = jest.fn(
    (Class: { new (...args: any[]): any }) => Class
  );
  const mockInjectable = jest.fn(() => mockInjectableReturn);

  beforeAll(() => {
    spyInjectable = jest.spyOn(inversify, "injectable");
    spyInjectable.mockImplementation(mockInjectable);
    DecoratedMClass = Injectable()(MClass);
  });

  afterAll(() => {
    mockInjectable.mockClear();
    mockInjectableReturn.mockClear();
    spyInjectable.mockRestore();
  });

  describe(`test to assert the calls on 'injectable'`, () => {
    test(`should be called two times`, () => {
      expect(mockInjectable).toBeCalledTimes(2);
    });

    test(`should return function be called two times`, () => {
      expect(mockInjectableReturn).toBeCalledTimes(2);
    });

    test(`should return function first call be without any argument`, () => {
      expect(mockInjectableReturn.mock.calls[0]).toHaveLength(1);
      expect(mockInjectableReturn.mock.calls[0][0]).toBe(MClass);
    });

    test(`should return function second call be with a subclass of 'MClass'`, () => {
      expect(mockInjectableReturn.mock.calls[1]).toHaveLength(1);
      expect(mockInjectableReturn.mock.calls[1][0].prototype).toBeInstanceOf(
        MClass
      );
    });
  });

  describe("test to check the static prop $KEY", () => {
    test("should be defined", () => {
      expect(DecoratedMClass[INJECTABLE_KEY]).toBeDefined();
    });

    test(`should be of type 'symbol'`, () => {
      expect(typeof DecoratedMClass[INJECTABLE_KEY]).toBe("symbol");
    });
  });
});
