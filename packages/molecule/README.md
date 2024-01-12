# `@ckb-cobuild/molecule`

An opinionated [molecule](https://github.com/nervosnetwork/molecule) library which defines schema in code.

- [API Docs](https://ckb-cobuild-docs.vercel.app/api/modules/_ckb_cobuild_molecule.html)
- [NPM Package](https://www.npmjs.com/package/@ckb-cobuild/molecule)

## Browser Compatibility

- `TypedArray`: [Can I Use?](https://caniuse.com/mdn-javascript_builtins_typedarray)
- `DataView`: [Can I Use?](https://caniuse.com/mdn-javascript_builtins_dataview)

## Compare With `@ckb-lumos/codec`

The differences between `@ckb-cobuild/molecule` and `@ckb-lumos/codec`:

- Lumos is flexible on the parameter type of the `pack` function, this library is strict and provides `parse`, `safeParse`, `around` to do conversions.
- Lumos table codec fields are nullable, this library only allows null for option field.
- This library supports schema validation via `parse` and `safeParse`.
- This library supports exporting molecule schema to `.mol` file.
