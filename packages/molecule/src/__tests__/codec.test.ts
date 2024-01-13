/* eslint-disable @typescript-eslint/no-explicit-any */
import { mol } from "../";

describe("FixedSizeAroundCodec", () => {
  const ByteOpt = mol.option("ByteOpt", mol.byte);
  const BooleanOpt = ByteOpt.around({
    safeParse: (input: boolean | null) => mol.parseSuccess(input),
    willPack: (input: boolean | null) =>
      input !== null ? (input ? 1 : 0) : null,
    didUnpack: (value: number | null) => (value !== null ? value !== 0 : null),
  });

  describe(".safeParse", () => {
    test.each([null, true, false])("(%p)", (input) => {
      expect(BooleanOpt.safeParse(input)).toEqual(mol.parseSuccess(input));
    });
  });

  describe(".pack", () => {
    test.each([
      [null, new Uint8Array()],
      [true, new Uint8Array([1])],
      [false, new Uint8Array([0])],
    ])("(%p)", (input, expected) => {
      expect(BooleanOpt.pack(input)).toEqual(expected);
    });
  });

  describe(".pack", () => {
    test.each([
      [new Uint8Array(), null],
      [new Uint8Array([2]), true],
      [new Uint8Array([1]), true],
      [new Uint8Array([0]), false],
    ])("(%p)", (input, expected) => {
      expect(BooleanOpt.unpack(input)).toEqual(expected);
    });
  });
});

describe("FixedSizeCodec", () => {
  const BooleanCodec = mol.byte.around({
    safeParse: (input: boolean) => mol.parseSuccess(input),
    willPack: (input: boolean) => (input ? 1 : 0),
    didUnpack: (value: number) => value !== 0,
  });

  describe(".safeParse", () => {
    test.each([true, false])("(%p)", (input) => {
      expect(BooleanCodec.safeParse(input)).toEqual(mol.parseSuccess(input));
    });
  });

  describe(".pack", () => {
    test.each([
      [true, new Uint8Array([1])],
      [false, new Uint8Array([0])],
    ])("(%p)", (input, expected) => {
      expect(BooleanCodec.pack(input)).toEqual(expected);
    });
  });

  describe(".pack", () => {
    test.each([
      [new Uint8Array([2]), true],
      [new Uint8Array([1]), true],
      [new Uint8Array([0]), false],
    ])("(%p)", (input, expected) => {
      expect(BooleanCodec.unpack(input)).toEqual(expected);
    });
  });
});

describe("coerce", () => {
  describe("Number", () => {
    const ByteCoerce = mol.byte.beforeParse((input: any) => Number(input));

    describe(".safeParse", () => {
      describe("/* success */", () => {
        test.each([0, 1, "1", "0xa", true, false, null])("(%p)", (input) => {
          expect(ByteCoerce.safeParse(input)).toEqual(
            mol.parseSuccess(Number(input)),
          );
        });
      });

      describe("/* error */", () => {
        test.each(["a", undefined])("(%p)", (input) => {
          const result = ByteCoerce.safeParse(input);
          expect(result.success).toBeFalsy();
          if (!result.success) {
            expect(result.error.toString()).toMatch(
              "Expected integer from 0 to 255, found NaN",
            );
          }
        });
      });
    });
  });

  describe("parseInt", () => {
    const ByteCoerce = mol.byte.beforeSafeParse((input: any) => {
      const result = parseInt(input);
      if (!Number.isNaN(result)) {
        return mol.parseSuccess(result);
      }
      return mol.parseError("Not a number");
    });

    describe(".safeParse", () => {
      describe("/* success */", () => {
        test.each([0, 1, "1", "0xa"])("(%p)", (input) => {
          expect(ByteCoerce.safeParse(input)).toEqual(
            mol.parseSuccess(Number(input)),
          );
        });
      });

      describe("/* error */", () => {
        test.each([true, false, null, "a", undefined])("(%p)", (input) => {
          const result = ByteCoerce.safeParse(input);
          expect(result.success).toBeFalsy();
          if (!result.success) {
            expect(result.error.toString()).toMatch("Not a number");
          }
        });
      });
    });
  });
});

describe("isFixedSizeCodec", () => {
  const ByteOpt = mol.option("ByteOpt", mol.byte);
  test.each([
    mol.byte,
    mol.array("Byte32", mol.byte, 32),
    mol.byteArray("ByteArray32", 32),
  ])("(%s) => true", (codec) => {
    expect(mol.isFixedSizeCodec(codec)).toBeTruthy();
  });
  test.each([
    ByteOpt,
    mol.fixvec("Fixvec", mol.byte),
    mol.byteFixvec("ByteFixvec"),
    mol.dynvec("Dynvec", ByteOpt),
    mol.vector("ByteOptVec", ByteOpt),
  ])("(%s) => false", (codec) => {
    expect(mol.isFixedSizeCodec(codec)).toBeFalsy();
  });
});

describe("complex types", () => {
  const ByteOpt = mol.option("ByteOpt", mol.byte);
  const ByteOptOpt = mol.option("ByteOptOpt", ByteOpt);
  const Byte2 = mol.array("Byte2", mol.byte, 2);
  const Byte2x2 = mol.array("Byte2x2", Byte2, 2);
  const Bytes = mol.fixvec("Bytes", mol.byte);
  const Byte2Vec = mol.fixvec("Byte2Vec", Byte2);
  const ByteOptVec = mol.dynvec("ByteOptVec", ByteOpt);
  const Byte4 = mol.array("Byte4", mol.byte, 4);
  const Byte2n4 = mol.struct(
    "Byte2n4",
    {
      b2: Byte2,
      b4: Byte4,
    },
    ["b2", "b4"],
  );

  describe("exportSchema", () => {
    test.each([
      [mol.byte, []],
      [ByteOpt, [["ByteOpt", "option ByteOpt (byte);"]]],
      [
        ByteOptOpt,
        [
          ["ByteOpt", "option ByteOpt (byte);"],
          ["ByteOptOpt", "option ByteOptOpt (ByteOpt);"],
        ],
      ],
      [Byte2, [["Byte2", "array Byte2 [byte; 2];"]]],
      [
        mol.byteArray("Byte2Uint8Array", 2),
        [["Byte2Uint8Array", "array Byte2Uint8Array [byte; 2];"]],
      ],
      [
        Byte2x2,
        [
          ["Byte2", "array Byte2 [byte; 2];"],
          ["Byte2x2", "array Byte2x2 [Byte2; 2];"],
        ],
      ],
      [Bytes, [["Bytes", "vector Bytes <byte>;"]]],
      [
        Byte2Vec,
        [
          ["Byte2", "array Byte2 [byte; 2];"],
          ["Byte2Vec", "vector Byte2Vec <Byte2>;"],
        ],
      ],
      [
        ByteOptVec,
        [
          ["ByteOpt", "option ByteOpt (byte);"],
          ["ByteOptVec", "vector ByteOptVec <ByteOpt>;"],
        ],
      ],
      [
        Byte2n4,
        [
          ["Byte2", "array Byte2 [byte; 2];"],
          ["Byte4", "array Byte4 [byte; 4];"],
          [
            "Byte2n4",
            `struct Byte2n4 {
    b2: Byte2,
    b4: Byte4,
}`,
          ],
        ],
      ],
    ])("(%s)", (codec, schemaEntries) => {
      const schema = codec.exportSchema();
      expect(Array.from(schema.entries())).toEqual(schemaEntries);
    });
  });

  describe("safeParse", () => {
    test("struct parse errors", () => {
      // a/1 a/1/a
      const Byte2n4x3 = mol.array("Byte2n4x2", Byte2n4, 3);
      const codec = mol.structFromEntries("Codec", [
        ["a", mol.byte],
        ["b", Byte2n4x3],
      ]);
      const result = codec.safeParse({
        b: [
          null,
          { b2: [0, 0], b4: [0, 0, 0, 0] },
          { b2: [0, -1], b4: [0, 0, 0, 0] },
        ],
      });
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
    });
  });
});
