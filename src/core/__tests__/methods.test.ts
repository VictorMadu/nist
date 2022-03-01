import { METADATA_KEY } from "../constant";
import { Delete, Get, Patch, Post, Put } from "../methods";

type IPath = string | undefined;
type IReturnMethodDeco = (
  target: Record<string | symbol, any>,
  key: string,
  descriptor: PropertyDescriptor
) => void;

const setUp = (
  MethodDecorator: (path: IPath) => IReturnMethodDeco,
  path?: IPath
) => {
  class TestClass {
    @MethodDecorator(path)
    methodA() {}
  }

  const mTestClass = new TestClass();
  return mTestClass.methodA as any;
};

describe(`test for 'methods'`, () => {
  describe(`test for 'Get'`, () => {
    let getSetUp: (path?: IPath) => any;

    beforeAll(() => {
      getSetUp = (path) => setUp(Get, path);
    });

    describe(`test for 'method'`, () => {
      test(`should be 'GET'`, () => {
        expect(getSetUp()[METADATA_KEY].method).toBe("GET");
      });
    });

    describe(`test for 'url'`, () => {
      test(`should be '' when no path is passed (default value)`, () => {
        expect(getSetUp()[METADATA_KEY].url).toBe("");
      });
      test(`should be what 'path' is 1`, () => {
        const path = "";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });

      test(`should be what 'path' is 2`, () => {
        const path = "/cats";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });

      test(`should be what 'path' is 3`, () => {
        const path = "/cats/:id";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });

      test(`should be what 'path' is 4`, () => {
        const path = "/cats/:id/posts";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });
    });
  });

  describe(`test for 'Post'`, () => {
    let getSetUp: (path?: IPath) => any;

    beforeAll(() => {
      getSetUp = (path) => setUp(Post, path);
    });

    describe(`test for 'method'`, () => {
      test(`should be 'POST'`, () => {
        expect(getSetUp()[METADATA_KEY].method).toBe("POST");
      });
    });

    describe(`test for 'url'`, () => {
      test(`should be '' when no path is passed (default value)`, () => {
        expect(getSetUp()[METADATA_KEY].url).toBe("");
      });
      test(`should be what 'path' is 1`, () => {
        const path = "";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });

      test(`should be what 'path' is 2`, () => {
        const path = "/cats";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });

      test(`should be what 'path' is 3`, () => {
        const path = "/cats/:id";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });

      test(`should be what 'path' is 4`, () => {
        const path = "/cats/:id/posts";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });
    });
  });

  describe(`test for 'Put'`, () => {
    let getSetUp: (path?: IPath) => any;

    beforeAll(() => {
      getSetUp = (path) => setUp(Put, path);
    });

    describe(`test for 'method'`, () => {
      test(`should be 'PUT'`, () => {
        expect(getSetUp()[METADATA_KEY].method).toBe("PUT");
      });
    });

    describe(`test for 'url'`, () => {
      test(`should be '' when no path is passed (default value)`, () => {
        expect(getSetUp()[METADATA_KEY].url).toBe("");
      });
      test(`should be what 'path' is 1`, () => {
        const path = "";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });

      test(`should be what 'path' is 2`, () => {
        const path = "/cats";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });

      test(`should be what 'path' is 3`, () => {
        const path = "/cats/:id";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });

      test(`should be what 'path' is 4`, () => {
        const path = "/cats/:id/posts";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });
    });
  });

  describe(`test for 'Patch'`, () => {
    let getSetUp: (path?: IPath) => any;

    beforeAll(() => {
      getSetUp = (path) => setUp(Patch, path);
    });

    describe(`test for 'method'`, () => {
      test(`should be 'PATCH'`, () => {
        expect(getSetUp()[METADATA_KEY].method).toBe("PATCH");
      });
    });

    describe(`test for 'url'`, () => {
      test(`should be '' when no path is passed (default value)`, () => {
        expect(getSetUp()[METADATA_KEY].url).toBe("");
      });
      test(`should be what 'path' is 1`, () => {
        const path = "";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });

      test(`should be what 'path' is 2`, () => {
        const path = "/cats";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });

      test(`should be what 'path' is 3`, () => {
        const path = "/cats/:id";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });

      test(`should be what 'path' is 4`, () => {
        const path = "/cats/:id/posts";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });
    });
  });

  describe(`test for 'Delete'`, () => {
    let getSetUp: (path?: IPath) => any;

    beforeAll(() => {
      getSetUp = (path) => setUp(Delete, path);
    });

    describe(`test for 'method'`, () => {
      test(`should be 'DELETE'`, () => {
        expect(getSetUp()[METADATA_KEY].method).toBe("DELETE");
      });
    });

    describe(`test for 'url'`, () => {
      test(`should be '' when no path is passed (default value)`, () => {
        expect(getSetUp()[METADATA_KEY].url).toBe("");
      });
      test(`should be what 'path' is 1`, () => {
        const path = "";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });

      test(`should be what 'path' is 2`, () => {
        const path = "/cats";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });

      test(`should be what 'path' is 3`, () => {
        const path = "/cats/:id";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });

      test(`should be what 'path' is 4`, () => {
        const path = "/cats/:id/posts";
        expect(getSetUp(path)[METADATA_KEY].url).toBe(path);
      });
    });
  });
});
