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
