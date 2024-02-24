# @ckb-cobuild/molecule-bigint

## 1.0.0

### Major Changes

- b60f423: :sparkles: Molecule integer codecs for bigint

  ```ts
  import { Uint64 } from "@ckb-cobuild/molecule-bigint";
  const buffer = Uint64.pack(1n);
  console.log(buffer);
  // => [1, 0, 0, 0, 0, 0, 0, 0],
  console.log(Uint64.unpack(buffer));
  // => 1n
  ```

### Patch Changes

- 232903b: :sparkles: Add makeBigInt in molecule-bigint
- ae9dd5b: :sparkles: Add molecule codecs for 128- and 256-bit int
- Updated dependencies [3450bf0]
- Updated dependencies [abfaa56]
- Updated dependencies [eb6380e]
  - @ckb-cobuild/molecule@1.0.1

## 1.0.0-next.0

### Major Changes

- b60f423: :sparkles: Molecule integer codecs for bigint

  ```ts
  import { Uint64 } from "@ckb-cobuild/molecule-bigint";
  const buffer = Uint64.pack(1n);
  console.log(buffer);
  // => [1, 0, 0, 0, 0, 0, 0, 0],
  console.log(Uint64.unpack(buffer));
  // => 1n
  ```

### Patch Changes

- 232903b: :sparkles: Add makeBigInt in molecule-bigint
- ae9dd5b: :sparkles: Add molecule codecs for 128- and 256-bit int
- Updated dependencies [3450bf0]
- Updated dependencies [abfaa56]
- Updated dependencies [eb6380e]
  - @ckb-cobuild/molecule@1.0.1-next.0
