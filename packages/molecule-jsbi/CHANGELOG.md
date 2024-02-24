# @ckb-cobuild/molecule-jsbi

## 1.0.0

### Major Changes

- 9c7a89f: :sparkles: Molecule integer codecs for bigint

  ```ts
  import { Uint64 } from "@ckb-cobuild/molecule-jsbi";
  import JSBI from "jsbi";
  const buffer = Uint64.pack(JSBI.BigInt(1));
  console.log(buffer);
  // => [1, 0, 0, 0, 0, 0, 0, 0],
  console.log(JSBI.toNumber(Uint64.unpack(buffer)));
  // => 1
  ```

### Patch Changes

- f96a9c5: :bug: Export JSBI in molecule-jsbi

  Required to make the exported types accessible

- Updated dependencies [3450bf0]
- Updated dependencies [abfaa56]
- Updated dependencies [eb6380e]
  - @ckb-cobuild/molecule@1.0.1

## 1.0.0-next.0

### Major Changes

- 9c7a89f: :sparkles: Molecule integer codecs for bigint

  ```ts
  import { Uint64 } from "@ckb-cobuild/molecule-jsbi";
  import JSBI from "jsbi";
  const buffer = Uint64.pack(JSBI.BigInt(1));
  console.log(buffer);
  // => [1, 0, 0, 0, 0, 0, 0, 0],
  console.log(JSBI.toNumber(Uint64.unpack(buffer)));
  // => 1
  ```

### Patch Changes

- f96a9c5: :bug: Export JSBI in molecule-jsbi

  Required to make the exported types accessible

- Updated dependencies [3450bf0]
- Updated dependencies [abfaa56]
- Updated dependencies [eb6380e]
  - @ckb-cobuild/molecule@1.0.1-next.0
