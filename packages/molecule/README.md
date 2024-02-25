# `@ckb-cobuild/molecule`

An opinionated [molecule](https://github.com/nervosnetwork/molecule) library which defines schema in code.

- [API Docs](https://ckb-cobuild-docs.vercel.app/api/modules/_ckb_cobuild_molecule.html)
- [NPM Package](https://www.npmjs.com/package/@ckb-cobuild/molecule)

## More Codecs

- `@ckb-cobuild/molecule-bigint`: BigInt codecs for numbers

## Browser Compatibility

- `TypedArray`: [Can I Use?](https://caniuse.com/mdn-javascript_builtins_typedarray)
- `DataView`: [Can I Use?](https://caniuse.com/mdn-javascript_builtins_dataview)

## Compare With `@ckb-lumos/codec`

The differences between `@ckb-cobuild/molecule` and `@ckb-lumos/codec`:

- Lumos is flexible on the parameter type of the `pack` function, this library is strict and provides `parse`, `safeParse`, `around` to do conversions.
- Lumos table codec fields are nullable, this library only allows null for option field.
- This library supports schema validation via `parse` and `safeParse`.
- This library supports exporting molecule schema to `.mol` file.

## About the Interface

This library prefers better type inferring and checking to sipmle schema definition. There will be many type names repetitions because of the limitation of TypeScript.

## Example

### Coerce

```ts
import { mol } from "@ckb-cobuild/molecule";
const ByteCoerce = mol.byte.beforeParse((input: any) => Number(input));
```

### Use Different JavaScript Value

```ts
import { mol } from "@ckb-cobuild/molecule";
const ByteOpt = mol.option("ByteOpt", mol.byte);
const BooleanOpt = ByteOpt.around({
  safeParse: (input: boolean | null) => mol.parseSuccess(input),
  willPack: (input: boolean | null) =>
    input !== null ? (input ? 1 : 0) : null,
  didUnpack: (value: number | null) => (value !== null ? value !== 0 : null),
});
```

### Validation

```ts
const result = codec.safeParse({/*...*/});
expect(result.success).toBeFalsy();
if (!result.success) {
  const messages = result.error.collectMessages();
  expect(messages).toEqual([
    "//: Struct member parse failed",
    "//a: Expected integer from 0 to 255, found undefined",
    "//b: Array member parse failed",
    "//b/0: Expected object, found null",
    "//b/2: Struct member parse failed",
    "//b/2/b2: Array member parse failed",
    "//b/2/b2/1: Expected integer from 0 to 255, found -1",
  ]);
}
```

### Export Schema

```ts
import { mol } from "@ckb-cobuild/molecule";
const ByteOpt = mol.option("ByteOpt", mol.byte);
const ByteOptOpt = mol.option("ByteOptOpt", ByteOpt);
export(Array.from(ByteOptOpt.exportSchema().values())).toEqual([
  "option ByteOpt (byte);",
  "option ByteOptOpt (ByteOpt);",
]);
```
