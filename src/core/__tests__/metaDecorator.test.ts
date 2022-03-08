import { METADATA_KEY } from "../constant";
import { metaDecorator } from "../metaDecorator";

describe(`test for 'metaDecorator'`, () => {
  test(`should assign 'metaKey' to 'metaValue' in a method's 'METADATA_KEY' prop`, () => {
    const metaKey = "$$metaKey";
    const metaValue = "$$metaValue";

    const methodDecorator: any = metaDecorator(metaKey, metaValue);
    const methodDeoratorForInitalMetaData = function (
      target: Record<string | symbol, any>,
      key: string | symbol
    ) {
      target[key][METADATA_KEY] = {};
    };

    class TestClass {
      @methodDecorator
      @methodDeoratorForInitalMetaData
      methodA() {}
    }

    const mTestClass = new TestClass();
    expect((mTestClass.methodA as any)[METADATA_KEY][metaKey]).toBe(metaValue);
  });
});
