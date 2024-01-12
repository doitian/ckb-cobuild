# @ckb-cobuild/molecule

## 1.0.0-next.0

### Major Changes

- 83bdffc: :tada: PoC of a new molecule codec (#5)

  The PoC only contains a `byte` codec.

  The differences between `@ckb-cobuild/molecule` and `@ckb-lumos/codec`:

  - Lumos is flexible on the parameter type of the `pack` function, this
    library is strict and provides `parse` to preprocess the input first.
  - Lumos table codec fields are nullable, this library only allows null
    for option field.
  - This library supports schema validation via `parse` and `safeParse`.
  - This library supports exporting molecule schema to `.mol` file.
