export type MergeShapes<U, V> = {
  [k in Exclude<keyof U, keyof V>]: U[k];
} & V;
export type identity<T> = T;
export type flatten<T> = identity<{ [k in keyof T]: T[k] }>;
export type extendShape<A, B> = flatten<Omit<A, keyof B> & B>;

test("foo", () => {});
