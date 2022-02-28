import Injectable from "../injectable";
import * as inversify from "inversify";

// jest.mock("inversify");

describe(`test for Injectable`, () => {
  let spyInjectable: jest.SpyInstance;
  let DecoratedMClass: {
    new (...args: any[]): any;
    $KEY: symbol;
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

    test(`should return function second call be without correct argument`, () => {
      expect(mockInjectableReturn.mock.calls[1]).toHaveLength(1);
      expect(mockInjectableReturn.mock.calls[1][0].prototype).toBeInstanceOf(
        MClass
      );
    });
  });

  describe("test to check the static prop $KEY", () => {
    test("should be defined", () => {
      expect(DecoratedMClass.$KEY).toBeDefined();
    });

    test(`should be of type 'symbol'`, () => {
      expect(typeof DecoratedMClass.$KEY).toBe("symbol");
    });
  });
});
