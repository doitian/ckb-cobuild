/* eslint-disable @typescript-eslint/no-explicit-any */
import { mol } from "../";

// Test Vectors from https://github.com/nervosnetwork/molecule/blob/master/docs/encoding_spec.md
describe("## Molecule Encoding Spec", () => {
  // If we define `array Byte3 [byte; 3];`
  const Byte3 = mol.array("Byte3", mol.byte, 3);
  // If we define `array Uint32 [byte; 4];`
  const Uint32 = mol.byteArray("Uint32", 4).around({
    safeParse: (n: number) => mol.parseSuccess(n),
    willPack: (n: number) => {
      const bytes = new Uint8Array(4);
      const view = new DataView(bytes.buffer);
      view.setUint32(0, n, true);
      return bytes;
    },
    didUnpack: (bytes: Uint8Array) => {
      const view = new DataView(bytes.buffer, bytes.byteOffset);
      return view.getUint32(0, true);
    },
  });
  // If we define `vector Bytes <byte>;`:
  const Bytes = mol.byteVector("Bytes");
  // If we define `vector BytesVec <Bytes>;`:
  const BytesVec = mol.vector("BytesVec", Bytes);
  // If we define `option BytesVecOpt (BytesVec);`
  const BytesVecOpt = mol.option("BytesVecOpt", BytesVec);

  // ### Summary
  //
  // #### Fixed Size or Dynamic Size
  //
  // | Type | byte  | array | struct | vector  |  table  | option  |  union  |
  // |------|-------|-------|--------|---------|---------|---------|---------|
  // | Size | Fixed | Fixed | Fixed  | Dynamic | Dynamic | Dynamic | Dynamic |
  //
  // #### Memory Layout
  //
  // ```
  // |  Type  |                      Header                      |               Body                |
  // |--------+--------------------------------------------------+-----------------------------------|
  // | array  |                                                  |  item-0 |  item-1 | ... |  item-N |
  // | struct |                                                  | field-0 | field-1 | ... | field-N |
  // | fixvec | items-count                                      |  item-0 |  item-1 | ... |  item-N |
  // | dynvec | full-size | offset-0 | offset-1 | ... | offset-N |  item-0 |  item-1 | ... |  item-N |
  // | table  | full-size | offset-0 | offset-1 | ... | offset-N | filed-0 | field-1 | ... | field-N |
  // | option |                                                  | item or none (zero bytes)         |
  // | union  | item-type-id                                     | item                              |
  // ```
  //
  // - All items in Header are 32 bit unsigned integers in little-endian.

  describe("### Primitive Type", () => {
    describe("#### `byte`", () => {
      // The `byte` is a byte.
      describe("##### Examples", () => {
        test("`00` is a `byte`", () => {
          expect(mol.byte.pack(0)).toEqual(Uint8Array.of(0));
          expect(mol.byte.unpack(Uint8Array.of(0))).toEqual(0);
        });
      });
    });
  });

  describe("### Composite Types", () => {
    describe("#### `array`", () => {
      // The `array` is a fixed-size type: it has a fixed-size inner type and a fixed length.
      // The size of an `array` is the size of inner type times the length.
      //
      // Serializing an `array` only need to serialize all items in it.
      //
      // There's no overhead to serialize an `array`, which stores all items consecutively, without extra space between two adjacent items.
      describe("##### Examples", () => {
        const TwoUint32 = mol.array("TwoUint32", Uint32, 2);

        test.each([
          // If we define `array Byte3 [byte; 3];`, and we want to store three bytes: first is `01`, the second is `02` and the last is `03`, then the serialized bytes will be `01 02 03`.
          [Byte3, [1, 2, 3], Uint8Array.of(1, 2, 3)],
          // If we define `array Uint32 [byte; 4];` , and we want to store a 32 bit unsigned integer `0x01020304` into it in little-endian, then the serialized bytes will be `04 03 02 01`.
          [Uint32, 0x01020304, Uint8Array.of(4, 3, 2, 1)],
          // If we define `array TwoUint32 [Uint32; 2];`, and we want to store two 32 bit unsigned integers in little-endian: first is `0x01020304` and second is `0xabcde`, then the serialized bytes will be `04 03 02 01 de bc 0a 00`.
          [
            TwoUint32,
            [0x01020304, 0xabcde],
            Uint8Array.of(4, 3, 2, 1, 0xde, 0xbc, 0x0a, 0),
          ],
        ])(`If we define %s`, (codec, value, buffer) => {
          expect(codec.pack(value as any)).toEqual(buffer);
          expect(codec.unpack(buffer)).toEqual(value);
        });
      });
    });

    describe("#### `struct`", () => {
      // The `struct` is a fixed-size type: all fields in `struct` are fixed-size and it has a fixed quantity of fields.
      // The size of a `struct` is the sum of all fields' size.
      //
      // Serializing a `struct` only need to serialize all fields in it.
      // Fields in a `struct` are stored in the order they are declared.
      //
      // There's no overhead to serialize a `struct`, which stores all fields consecutively, without extra space between two adjacent items.

      // If we define `struct OnlyAByte { f1: byte }`
      const OnlyAByte = mol.struct("OnlyAByte", { f1: mol.byte }, ["f1"]);
      // If we define `struct ByteAndUint32 { f1: byte, f2: Uint32 }`
      const ByteAndUint32 = mol.struct(
        "ByteAndUint32",
        {
          f1: mol.byte,
          f2: Uint32,
        },
        ["f1", "f2"],
      );

      describe("##### Examples", () => {
        test.each([
          // If we define `struct OnlyAByte { f1: byte }`, and we want to store a byte `ab`, then the serialized bytes will be `ab`.
          [OnlyAByte, { f1: 0xab }, Uint8Array.of(0xab)],
          // If we define `struct ByteAndUint32 { f1: byte, f2: Uint32 }`, and we want to store a byte `ab` and a 32 bit unsigned integer `0x010203` in little-endian, then the serialized bytes will be `ab 03 02 01 00`.
          [
            ByteAndUint32,
            { f1: 0xab, f2: 0x010203 },
            Uint8Array.of(0xab, 3, 2, 1, 0),
          ],
        ])(`If we define %s`, (codec, value, buffer) => {
          expect(codec.pack(value as any)).toEqual(buffer);
          expect(codec.unpack(buffer)).toEqual(value);
        });
      });
    });

    describe("#### `vector`", () => {
      //
      // There two kinds of vectors: fixed vector `fixvec` and dynamic vector `dynvec`.
      //
      // Whether a vector is fixed or dynamic depends on the type of its inner item: if the inner item is fixed-size, then it's a `fixvec`; otherwise, it's a `dynvec`.
      //
      // Both of `fixvec` and `dynvec` are dynamic-size types.
      describe("##### `fixvec` - fixed vector", () => {
        // There are two steps of serializing a `fixvec`:
        // 1. Serialize the length as a 32 bit unsigned integer in little-endian.
        // 2. Serialize all items in it.

        describe("##### Examples", () => {
          // If we define `vector Bytes <byte>;`:
          const Uint32Vec = mol.vector("Uint32Vec", Uint32);

          test.each([
            // - the serialized bytes of an empty bytes is `00 00 00 00`(the length of any empty fixed vector is `0`).
            [Bytes, Uint8Array.of(), Uint8Array.of(0, 0, 0, 0)],
            // - the serialized bytes of `0x12` is `01 00 00 00, 12`.
            [Bytes, Uint8Array.of(0x12), Uint8Array.of(1, 0, 0, 0, 0x12)],
            // - the serialized bytes of `0x1234567890abcdef` is `08 00 00 00, 12 34 56 78 90 ab cd ef`.
            [
              Bytes,
              Uint8Array.of(0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef),
              Uint8Array.of(
                8,
                0,
                0,
                0,
                0x12,
                0x34,
                0x56,
                0x78,
                0x90,
                0xab,
                0xcd,
                0xef,
              ),
            ],
            // If we define `vector Uint32Vec <Uint32>;`:
            // - the serialized bytes of an empty `Uint32Vec` is `00 00 00 00`.
            [Uint32Vec, [], Uint8Array.of(0, 0, 0, 0)],
            // - the serialized bytes of `0x123` is `01 00 00 00, 23 01 00 00`.
            [Uint32Vec, [0x123], Uint8Array.of(1, 0, 0, 0, 0x23, 0x01, 0, 0)],
            // - the serialized bytes of `[0x123, 0x456, 0x7890, 0xa, 0xbc, 0xdef]` is
            //   ```
            //   # there are 6 items
            //   06 00 00 00
            //   # six items
            //   23 01 00 00, 56 04 00 00, 90 78 00 00, 0a 00 00 00, bc 00 00 00, ef 0d 00 00
            //   ```
            [
              Uint32Vec,
              [0x123, 0x456, 0x7890, 0xa, 0xbc, 0xdef],
              Uint8Array.of(
                6,
                0,
                0,
                0,
                0x23,
                0x01,
                0x00,
                0x00,
                0x56,
                0x04,
                0x00,
                0x00,
                0x90,
                0x78,
                0x00,
                0x00,
                0x0a,
                0x00,
                0x00,
                0x00,
                0xbc,
                0x00,
                0x00,
                0x00,
                0xef,
                0x0d,
                0x00,
                0x00,
              ),
            ],
          ])(`If we define %s`, (codec, value, buffer) => {
            expect(codec.pack(value as any)).toEqual(buffer);
            expect(codec.unpack(buffer)).toEqual(value);
          });
        });
      });

      describe("##### `dynvec` - dynamic vector", () => {
        // There are three steps of serializing a `dynvec`:
        // 1. Serialize the full size in bytes as a 32 bit unsigned integer in little-endian.
        // 2. Serialize all offset of items as 32 bit unsigned integer in little-endian.
        // 3. Serialize all items in it.

        describe("###### Examples", () => {
          // If we define `vector BytesVec <Bytes>;`:
          test.each([
            // - the serialized bytes of an empty `BytesVec`  is `04 00 00 00`(the full size of an empty dynamic vector is 4 bytes).
            [BytesVec, [], Uint8Array.of(4, 0, 0, 0)],
            // - the serialized bytes of `[0x1234]` is
            //   ```
            //   # the full size is 14 bytes
            //   0e 00 00 00
            //   # one offset
            //   08 00 00 00
            //   # one item
            //   02 00 00 00 12 34
            //   ```
            [
              BytesVec,
              [Uint8Array.of(0x12, 0x34)],
              Uint8Array.of(0xe, 0, 0, 0, 8, 0, 0, 0, 2, 0, 0, 0, 0x12, 0x34),
            ],
            // - the serialized bytes of `[0x1234, 0x, 0x567, 0x89, 0xabcdef]` is
            [
              BytesVec,
              [
                Uint8Array.of(0x12, 0x34),
                Uint8Array.of(),
                Uint8Array.of(0x05, 0x67),
                Uint8Array.of(0x89),
                Uint8Array.of(0xab, 0xcd, 0xef),
              ],
              Uint8Array.from(
                [
                  // ```
                  // # the full size is 52 (0x34) bytes
                  [0x34, 0, 0, 0],
                  // # five offsets (20 bytes in total)
                  [
                    0x18, 0, 0, 0, 0x1e, 0, 0, 0, 0x22, 0, 0, 0, 0x28, 0, 0, 0,
                    0x2d, 0, 0, 0,
                  ],
                  // # five items (28 bytes in total)
                  [2, 0, 0, 0, 0x12, 0x34],
                  [0, 0, 0, 0],
                  [2, 0, 0, 0, 0x05, 0x67],
                  [1, 0, 0, 0, 0x89],
                  [3, 0, 0, 0, 0xab, 0xcd, 0xef],
                  // ```
                ].flat(),
              ),
            ],
          ])(`If we define %s`, (codec, value, buffer) => {
            expect(codec.pack(value as any)).toEqual(buffer);
            expect(codec.unpack(buffer)).toEqual(value);
          });
        });
      });
    });

    describe("#### `table`", () => {
      // The `table` is a dynamic-size type. It can be considered as a `dynvec` but the length is fixed.
      //
      // The serializing steps are same as `dynvec`:
      // 1. Serialize the full size in bytes as a 32 bit unsigned integer in little-endian.
      // 2. Serialize all offset of fields as 32 bit unsigned integer in little-endian.
      // 3. Serialize all fields in it in the order they are declared.
      const MixedType = mol.table(
        "MixedType",
        { f1: Bytes, f2: mol.byte, f3: Uint32, f4: Byte3, f5: Bytes },
        ["f1", "f2", "f3", "f4", "f5"],
      );

      describe("##### Examples", () => {
        // If we define `table MixedType { f1: Bytes, f2: byte, f3: Uint32, f4: Byte3, f5: Bytes }`
        // - the serialized bytes of a `MixedType { f1: 0x, f2: 0xab, f3: 0x123, f4: 0x456789, f5: 0xabcdef }`  is
        test.each([
          [
            MixedType,
            {
              f1: Uint8Array.of(),
              f2: 0xab,
              f3: 0x123,
              f4: [0x45, 0x67, 0x89],
              f5: Uint8Array.of(0xab, 0xcd, 0xef),
            },
            Uint8Array.from(
              [
                // ```
                // # the full size is 43 (0x2b) bytes
                [0x2b, 0, 0, 0],
                // # five offsets (20 bytes in total)
                [0x18, 0, 0, 0],
                [0x1c, 0, 0, 0],
                [0x1d, 0, 0, 0],
                [0x21, 0, 0, 0],
                [0x24, 0, 0, 0],
                // # five items (19 bytes in total)
                [0, 0, 0, 0],
                [0xab],
                [0x23, 0x01, 0, 0],
                [0x45, 0x67, 0x89],
                [3, 0, 0, 0, 0xab, 0xcd, 0xef],
                // ```
              ].flat(),
            ),
          ],
        ])(`If we define %s`, (codec, value, buffer) => {
          expect(codec.pack(value as any)).toEqual(buffer);
          expect(codec.unpack(buffer)).toEqual(value);
        });
      });
    });

    describe("#### `option`", () => {
      // The `option` is a dynamic-size type.
      //
      // Serializing an `option` depends on whether it is empty or not:
      // - if it's empty, there is **zero** bytes (the size is `0`).
      // - if it's not empty, just serialize the inner item (the size is same as the inner item's size).

      describe("##### Examples", () => {
        // If we define `option BytesVecOpt (BytesVec);`
        test.each([
          // - the serialized bytes of `None` is ` ` (empty).
          [BytesVecOpt, null, Uint8Array.of()],
          // - the serialized bytes of `Some([])` is `04 00 00 00`.
          [BytesVecOpt, [], Uint8Array.of(4, 0, 0, 0)],
          // - the serialized bytes of `Some([0x])` is
          //   ```
          //   # the full size of BytesVec is 12 bytes
          //   0c 00 00 00
          //   # the offset of Bytes
          //   08 00 00 00
          //   # the length of Bytes
          //   00 00 00 00
          //   ```
          [
            BytesVecOpt,
            [Uint8Array.of()],
            Uint8Array.of(0x0c, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0),
          ],
        ])(`If we define %s`, (codec, value, buffer) => {
          expect(codec.pack(value as any)).toEqual(buffer);
          expect(codec.unpack(buffer)).toEqual(value);
        });
      });
    });

    describe("#### `union`", () => {
      // The `union` is a dynamic-size type.
      //
      // Serializing a `union` has two steps:
      // - Serialize a item type id in bytes as a 32 bit unsigned integer in little-endian.
      //   The item type id is the index of the inner items, and it's starting at 0.
      // - Serialize the inner item.

      // If we define `union HybridBytes { Byte3, Bytes, BytesVec, BytesVecOpt }`
      const HybridBytes = mol.union(
        "HybridBytes",
        { Byte3, Bytes, BytesVec, BytesVecOpt },
        ["Byte3", "Bytes", "BytesVec", "BytesVecOpt"],
      );

      describe("##### Examples", () => {
        test.each([
          // - the serialized bytes of `Byte3 (0x123456)` is `00 00 00 00, 12 34 56`
          [
            HybridBytes,
            { type: "Byte3", value: [0x12, 0x34, 0x56] },
            Uint8Array.of(0, 0, 0, 0, 0x12, 0x34, 0x56),
          ],
          // - the serialized bytes of `Bytes (0x)` is `01 00 00 00, 00 00 00 00`
          [
            HybridBytes,
            { type: "Bytes", value: Uint8Array.of() },
            Uint8Array.of(1, 0, 0, 0, 0, 0, 0, 0),
          ],
          // - the serialized bytes of `Bytes (0x123)` is `01 00 00 00, 02 00 00 00, 01 23`
          [
            HybridBytes,
            { type: "Bytes", value: Uint8Array.of(0x01, 0x23) },
            Uint8Array.of(1, 0, 0, 0, 2, 0, 0, 0, 0x01, 0x23),
          ],
          // - the serialized bytes of `BytesVec ([])` is `02 00 00 00, 04 00 00 00`
          [
            HybridBytes,
            { type: "BytesVec", value: [] },
            Uint8Array.of(2, 0, 0, 0, 4, 0, 0, 0),
          ],
          // - the serialized bytes of `BytesVec ([0x])` is `02 00 00 00, 0c 00 00 00, 08 00 00 00, 00 00 00 00`
          [
            HybridBytes,
            { type: "BytesVec", value: [Uint8Array.of()] },
            Uint8Array.of(2, 0, 0, 0, 0xc, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0),
          ],
          // - the serialized bytes of `BytesVec ([0x123])` is `02 00 00 00, 0e 00 00 00, 08 00 00 00, 02 00 00 00, 01 23`
          [
            HybridBytes,
            { type: "BytesVec", value: [Uint8Array.of(0x1, 0x23)] },
            Uint8Array.of(
              2,
              0,
              0,
              0,
              0xe,
              0,
              0,
              0,
              8,
              0,
              0,
              0,
              2,
              0,
              0,
              0,
              0x1,
              0x23,
            ),
          ],
          // - the serialized bytes of `BytesVec ([0x123, 0x456])` is
          [
            HybridBytes,
            {
              type: "BytesVec",
              value: [Uint8Array.of(0x1, 0x23), Uint8Array.of(0x4, 0x56)],
            },
            Uint8Array.from(
              [
                // ```
                // # Item Type Id
                [0x02, 0x00, 0x00, 0x00],
                // # the full size of BytesVec is 24 bytes
                [0x18, 0x00, 0x00, 0x00],
                // # two offsets of BytesVec (8 bytes in total)
                [0x0c, 0x00, 0x00, 0x00],
                [0x12, 0x00, 0x00, 0x00],
                // # two Bytes (12 bytes in total)
                [0x02, 0x00, 0x00, 0x00, 0x01, 0x23],
                [0x02, 0x00, 0x00, 0x00, 0x04, 0x56],
                // ```
              ].flat(),
            ),
          ],
          // - the serialized bytes of `BytesVecOpt (None)` is `03 00 00 00`
          [
            HybridBytes,
            { type: "BytesVecOpt", value: null },
            Uint8Array.of(3, 0, 0, 0),
          ],
          // - the serialized bytes of `BytesVecOpt (Some(([])))` is `03 00 00 00, 04 00 00 00`
          [
            HybridBytes,
            { type: "BytesVecOpt", value: [] },
            Uint8Array.of(3, 0, 0, 0, 4, 0, 0, 0),
          ],
          // - the serialized bytes of `BytesVecOpt (Some(([0x])))` is `03 00 00 00, 0c 00 00 00, 08 00 00 00, 00 00 00 00`
          [
            HybridBytes,
            { type: "BytesVecOpt", value: [Uint8Array.of()] },
            Uint8Array.of(3, 0, 0, 0, 0xc, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0),
          ],
          // - the serialized bytes of `BytesVecOpt (Some(([0x123])))` is `03 00 00 00, 0e 00 00 00, 08 00 00 00, 02 00 00 00, 01 23`
          [
            HybridBytes,
            { type: "BytesVecOpt", value: [Uint8Array.of(0x1, 0x23)] },
            Uint8Array.of(
              3,
              0,
              0,
              0,
              0xe,
              0,
              0,
              0,
              8,
              0,
              0,
              0,
              2,
              0,
              0,
              0,
              0x1,
              0x23,
            ),
          ],
          // - the serialized bytes of `BytesVecOpt (Some(([0x123, 0x456])))` is
          [
            HybridBytes,
            {
              type: "BytesVecOpt",
              value: [Uint8Array.of(0x1, 0x23), Uint8Array.of(0x4, 0x56)],
            },
            Uint8Array.from(
              [
                // ```
                // # Item Type Id
                [0x03, 0x00, 0x00, 0x00],
                // # the full size of BytesVec is 24 bytes
                [0x18, 0x00, 0x00, 0x00],
                // # two offsets of BytesVec (8 bytes in total)
                [0x0c, 0x00, 0x00, 0x00],
                [0x12, 0x00, 0x00, 0x00],
                // # two Bytes (12 bytes in total)
                [0x02, 0x00, 0x00, 0x00, 0x01, 0x23],
                [0x02, 0x00, 0x00, 0x00, 0x04, 0x56],
                // ```
              ].flat(),
            ),
          ],
        ])(`If we define %s`, (codec, value, buffer) => {
          expect(codec.pack(value as any)).toEqual(buffer);
          expect(codec.unpack(buffer)).toEqual(value);
        });
      });
    });
  });
});
