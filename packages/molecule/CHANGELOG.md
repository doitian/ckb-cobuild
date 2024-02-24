# @ckb-cobuild/molecule

## 1.0.1-next.0

### Patch Changes

- 3450bf0: :bug: Ensure beforeParse reserve fixed codec

  Ensure beforeParse and beforeSafeParse returns FixedSizeCodec on FixedSizeCodec,
  and returns DynamicSizeCodec on DynamicSizeCodec.

- abfaa56: :sparkles: Add integer codecs
- eb6380e: :memo: Fix code example for byteFixvec

## 1.0.0

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

### Patch Changes

- 22f373a: :sparkles: Implement exportSchema in molecule
- 75410e9: :sparkles: Molecule union

  ```ts
  const Byte2 = mol.array("Byte2", mol.byte, 2);
  const Byte2x2 = mol.array("Byte2x2", Byte2, 2);
  const Byte4 = mol.array("Byte4", mol.byte, 4);
  const Word = mol.union(
    "Word",
    {
      Byte4,
      Byte2x2,
    },
    ["Byte4", "Byte2x2"],
  );
  const WordCustomTag = mol.union(
    "WordCustomTag",
    {
      Byte4,
      Byte2x2,
    },
    {
      Byte4: 4,
      Byte2x2: 2,
    },
  );
  ```

- 782f854: :sparkles: Add array

  ```ts
  import { mol } from "@ckb-cobuild/molecule";
  const Byte32 = mol.byteArray("Byte32", 32);
  const Point = mol.array("Point", Byte32, 2);
  ```

- 7815d37: :bug: Fix unpack buffer offset bug

  Create `DataView` from `Uint8Array.buffer` does not inherit the
  byte offset. The correct way is:

  ```ts
  const bytes = Uint8Array(20);
  const slice = bytes.subarray(4, 8);
  const view = new DataView(slice.buffer, slice.byteOffset);
  ```

- c6d6bc6: :sparkles: Molecule table

  ```ts
  import { mol } from "@ckb-cobuild/molecule";
  const Point = mol.table("Point", {
    x: mol.byte,
    y, mol.byte,
  ], ["x", "y"]);
  ```

- 3523da7: :recycle: Change preprocess to around

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

- cb66d2f: :sparkles: Add option

  ```ts
  import { mol } from "@ckb-cobuild/molecule";
  const ByteOpt = mol.option("ByteOpt", mol.byte);
  ```

- b653b68: :sparkles: Add molecule struct

  ```ts
  import { mol } from "@ckb-cobuild/molecule";
  const Point = mol.struct(
    "Point",
    {
      x: mol.byte,
      y: mol.byte,
    },
    ["x", "y"],
  );
  ```

- 230a2ec: :sparkles: Add dynvec and vector

  ```ts
  import { mol } from "@ckb-cobuild/molecule";
  const ByteOpt = mol.option("ByteOpt", mol.byte);
  const ByteOptVec = mol.dynvec("ByteOptVec", ByteOpt);
  const ByteOptVec2 = mol.vector("ByteOptVec2", ByteOpt);
  ```

- 2139c1d: :sparkles: Add fixvec

  Add both fixvec and byteFixvec

  ```ts
  import { mol } from "@ckb-cobuild/molecule";
  const Bytes = mol.byteFixvec("Bytes", mol.byte);
  ```

## 1.0.0-next.1

### Patch Changes

- 22f373a: :sparkles: Implement exportSchema in molecule
- 75410e9: :sparkles: Molecule union

  ```ts
  const Byte2 = mol.array("Byte2", mol.byte, 2);
  const Byte2x2 = mol.array("Byte2x2", Byte2, 2);
  const Byte4 = mol.array("Byte4", mol.byte, 4);
  const Word = mol.union(
    "Word",
    {
      Byte4,
      Byte2x2,
    },
    ["Byte4", "Byte2x2"],
  );
  const WordCustomTag = mol.union(
    "WordCustomTag",
    {
      Byte4,
      Byte2x2,
    },
    {
      Byte4: 4,
      Byte2x2: 2,
    },
  );
  ```

- 782f854: :sparkles: Add array

  ```ts
  import { mol } from "@ckb-cobuild/molecule";
  const Byte32 = mol.byteArray("Byte32", 32);
  const Point = mol.array("Point", Byte32, 2);
  ```

- 7815d37: :bug: Fix unpack buffer offset bug

  Create `DataView` from `Uint8Array.buffer` does not inherit the
  byte offset. The correct way is:

  ```ts
  const bytes = Uint8Array(20);
  const slice = bytes.subarray(4, 8);
  const view = new DataView(slice.buffer, slice.byteOffset);
  ```

- c6d6bc6: :sparkles: Molecule table

  ```ts
  import { mol } from "@ckb-cobuild/molecule";
  const Point = mol.table("Point", {
    x: mol.byte,
    y, mol.byte,
  ], ["x", "y"]);
  ```

- 3523da7: :recycle: Change preprocess to around

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

- cb66d2f: :sparkles: Add option

  ```ts
  import { mol } from "@ckb-cobuild/molecule";
  const ByteOpt = mol.option("ByteOpt", mol.byte);
  ```

- b653b68: :sparkles: Add molecule struct

  ```ts
  import { mol } from "@ckb-cobuild/molecule";
  const Point = mol.struct(
    "Point",
    {
      x: mol.byte,
      y: mol.byte,
    },
    ["x", "y"],
  );
  ```

- 230a2ec: :sparkles: Add dynvec and vector

  ```ts
  import { mol } from "@ckb-cobuild/molecule";
  const ByteOpt = mol.option("ByteOpt", mol.byte);
  const ByteOptVec = mol.dynvec("ByteOptVec", ByteOpt);
  const ByteOptVec2 = mol.vector("ByteOptVec2", ByteOpt);
  ```

- 2139c1d: :sparkles: Add fixvec

  Add both fixvec and byteFixvec

  ```ts
  import { mol } from "@ckb-cobuild/molecule";
  const Bytes = mol.byteFixvec("Bytes", mol.byte);
  ```
