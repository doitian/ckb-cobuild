/* eslint-disable @typescript-eslint/no-explicit-any */
import { mol } from "../";

describe("AroundCodec", () => {
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
