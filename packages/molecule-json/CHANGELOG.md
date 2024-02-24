# @ckb-cobuild/molecule-json

## 1.0.0-next.0

### Major Changes

- bd644c4: :sparkles: Extract cobuild/json into molecule-json

### Patch Changes

- 3450bf0: :bug: Ensure beforeParse reserve fixed codec

  Ensure beforeParse and beforeSafeParse returns FixedSizeCodec on FixedSizeCodec,
  and returns DynamicSizeCodec on DynamicSizeCodec.

- Updated dependencies [3450bf0]
- Updated dependencies [abfaa56]
- Updated dependencies [eb6380e]
  - @ckb-cobuild/molecule@1.0.1-next.0
