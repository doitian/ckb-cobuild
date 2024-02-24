# @ckb-cobuild/cobuild

## 3.0.0

### Major Changes

- bd644c4: :sparkles: Extract cobuild/json into molecule-json

## 3.0.0-next.0

### Major Changes

- bd644c4: :sparkles: Extract cobuild/json into molecule-json

## 2.0.0

### Major Changes

- e0a4715: Name unpack result same name as codec.

  - Move all codecs in `@ckb-lumos/codec` to a module `builtins`.
  - Name all unpack result types using the same name as the codec itself.

  Example:

  ```
  export type BuildingPacket = UnpackResult<typeof BuildingPacket>;
  ```

## 1.0.0

### Major Changes

- 98805be: bump to 1.0.0

## 0.0.5

### Patch Changes

- 6d61439: improve docs and adjust module exports

## 0.0.4

### Patch Changes

- db73b36: fix exporting the json module with wrong path

## 0.0.3

### Patch Changes

- f3076a1: change Transaction.pack param type
- e229b62: add module recipes and json
- 28fe040: add method getInputCell and getOutputCell
- ea88992: BREAKING: String now uses plain JavaScript string.

  Before it is a hex string, which represents the utf8 buffer of the string.
