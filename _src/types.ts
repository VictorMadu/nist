export type Func<R extends any = any, A extends any[] = any[]> = (...args: A) => R;
export type VoidFunc<T extends any[] = any[]> = Func<void, T>;

export type IsSubType<T extends any, U extends any> = T extends U ? T : never;

export type IsEqualType<T extends any, U extends any> = IsSubType<T, U> extends never ? never: IsSubType<U, T> extends never ? never: T;

// https://stackoverflow.com/questions/60872063/enforce-typescript-object-has-exactly-one-key-from-a-set
export type ExactlyOneKey<K extends keyof any, V, KK extends keyof any = K> = {
    [P in K]: 
        { [Q in P]: V } & { [Q in Exclude<KK, P>]?: undefined } extends infer O ? 
            { [Q in keyof O]: O[Q] } : never;
}[K];

export type ExactlyAllKey<K extends keyof any, V> = {
    [P in K]: V;
};


export type AtLeastOne<T extends Record<string | symbol | number, any>> = {
    [K in keyof T]: 
        {[Q in K]: T[Q]} & {[Q in Exclude<keyof T, K>]?: T[Q]} extends infer O ? 
            {[Q in keyof O]: O[Q]} : never;
}[keyof T]


export type ExactlyOne<T extends Record<string | symbol | number, any>> =  {
  [K in keyof T]: {
    [Q in K]: T[Q]
  }
}[keyof T]

export type AndWithPromise<K extends any> = K | Promise<K>;

export type AndWithArray<T> = T | T[]

export type Keys<T extends Record< string | symbol | number, any>,> = {
  [K in keyof T]: K
}[keyof T]

export type Values<T extends Record< string | symbol | number, any>,> = {
  [K in keyof T]: T[K]
}[keyof T]


export type ExcludeKey<
  T extends Record< string | symbol | number, any>,
  U extends keyof T
> = {
  [Q in Exclude<keyof T, U>]: T[Q];
};

export type ExtractKeys<T extends Record< string | symbol | number, any>, U extends string | symbol | number | keyof T> = Extract<Keys<T>, U>;

export type PropListener<T extends Record< string | symbol | number, any>> = {[K in ExtractKeys<T, string> as `on${Capitalize<K>}`]? : (...args: any[]) => void}

export type FuncParams<T extends (...args: any[]) => any> = T extends (... args: infer O) => any ? O : never;

export type FuncReturn<T extends (...args: any[]) => any> = T extends (... args: any[]) => infer O ? O : never;

export type ArrayType<T> = T extends [...args: infer O] ? O[number] : never;

export type FuncType<T extends Func> = Func<FuncParams<T>,ReturnType<T>>

export type WithPromiseReturn<T extends Func> = Func< Promise<ReturnType<T>>, FuncParams<T>>

export type PromiseReturnType<T> = T extends Func<Promise<infer O>, any[]> ? O : never; 


export type ConstructorParamsType<T extends abstract new (...args: any[]) => any> = T extends abstract new (...args: infer O) => any ? O : never

export type ConstructorReturnType<T extends abstract new (...args: any[]) => any> = T extends abstract new (...args: any[]) => infer O ? O : never;

export type Constructor<R extends any = any, T extends any[] = any[]> = {
    new (...args: T): R;
  };

  export type Methods<T extends Record<string | symbol | number, any>> = {
    [K in keyof T]: T[K] extends Function ? K : never;
  }[keyof T];


// Inspired by:  https://stackoverflow.com/questions/21224922/is-there-a-way-to-represent-a-non-negative-integer-in-typescript-so-that-the-com

export type Integer<T extends number> = `${T}` extends `${number}.${number}` ? never : T;

export type PosInteger<T extends number> =  Integer<T> extends never ? never : `${T}` extends `-${number}` ? never : T;

export type NegInteger<T extends number> =  Integer<T> extends never ? never : PosInteger<T> extends never ? T : never;

export type Float<T extends number> = Integer<T> extends never ? T : never;

export type PosFloat<T extends number> = Float<T> extends never ? never : `${T}` extends `-${number}.${number}` ? never : T;

export type NegFloat<T extends number> =  Float<T> extends never ? never : PosFloat<T> extends never ? T : never;

// TODO: other datatypes

// TODO: Tackle the following below
type TwoStrCombo<T extends string, U extends string> = T | U | `${T} ${U}` | `${U} ${T}`;

type ThreeStrCombo<T extends string, U extends string, V extends string> = T | U | V |  `${T} ${U}` | `${T} ${V}` | `${U} ${T}`| `${U} ${V}`  |`${V} ${T}`  |`${V} ${U}`  |   `${T} ${V} ${U}` | `${T} ${U} ${V}` | `${U} ${V} ${T}` | `${U} ${T} ${V}`  | `${V} ${T} ${U}` | `${V} ${U} ${T}`;

// type ShallowPartial<T, U extends string> = {
//     [K in keyof T]: CC<T, U> extends {} ? {K?: T[K]} : {K: T[K]}
// }[keyof T]

