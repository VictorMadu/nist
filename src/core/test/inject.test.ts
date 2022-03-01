import { Injectable } from "../injectable";
import { Inject } from "../inject";
import * as inversify from "inversify";

describe(`test for inject`, () => {
  describe(`test to assert the calls on 'inject'`, () => {
    const spyInject: jest.SpyInstance = jest.spyOn(inversify, "inject");
    let InjectableClass: any;

    const setUp = () => {
      @Injectable()
      class InjectableClass {}

      @Injectable()
      class WithInjectClass {
        constructor(@Inject(InjectableClass) private a: InjectableClass) {}
      }

      return [InjectableClass, WithInjectClass];
    };

    beforeAll(() => {
      [InjectableClass] = setUp();
    });

    test(`should be called once`, () => {
      expect(spyInject.mock.calls).toHaveLength(1);
    });

    test(`should be called with the correct argument`, () => {
      expect(spyInject.mock.calls[0][0]).toBe((InjectableClass as any).$KEY);
    });
  });
});
