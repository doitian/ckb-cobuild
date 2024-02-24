import { Uint64, Int64 } from "../";
import mol from "@ckb-cobuild/molecule";

describe("Uint64", () => {
  describe(".safeParse", () => {
    test.each([0n, 0xffffffffffffffffn])("(%s)", (input) => {
      expect(Uint64.safeParse(input)).toEqual(mol.parseSuccess(input));
    });

    test.each([0x10000000000000000n])("(%s)", (input) => {
      expect(Uint64.safeParse(input)).toEqual(
        mol.parseError(`Expected a valid number for Uint64, got ${input}`),
      );
    });
  });

  const cases = [
    {
      value: 0n,
      buffer: [0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      value: 1n,
      buffer: [1, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      value: 0xffffffffffffffffn,
      buffer: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
    },
  ];

  describe(".pack", () => {
    test.each(cases)("($value)", ({ value, buffer }) => {
      expect(Uint64.pack(value)).toEqual(Uint8Array.from(buffer));
    });
  });

  describe(".unpack", () => {
    test.each(cases)("($buffer)", ({ value, buffer }) => {
      expect(Uint64.unpack(Uint8Array.from(buffer))).toEqual(value);
    });

    test("([0])", () => {
      expect(() => Uint64.unpack(Uint8Array.of(0))).toThrow(
        "Expected bytes length 8, found 1",
      );
    });
  });

  test(".getSchema", () => {
    expect(Uint64.getSchema()).toEqual("array Uint64 [byte; 8];");
  });
});

describe("Int64", () => {
  describe(".safeParse", () => {
    test.each([-0x8000000000000000n, 0x7fffffffffffffffn])("(%s)", (input) => {
      expect(Int64.safeParse(input)).toEqual(mol.parseSuccess(input));
    });

    test.each([-0x8000000000000001n, 0x8000000000000000n])("(%s)", (input) => {
      expect(Int64.safeParse(input)).toEqual(
        mol.parseError(`Expected a valid number for Int64, got ${input}`),
      );
    });
  });

  const cases = [
    {
      value: 0n,
      buffer: [0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      value: -0x8000000000000000n,
      buffer: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80],
    },
    {
      value: -0x7fffffffffffffffn,
      buffer: [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80],
    },
    {
      value: 0x7fffffffffffffffn,
      buffer: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f],
    },
  ];

  describe(".pack", () => {
    test.each(cases)("($value)", ({ value, buffer }) => {
      expect(Int64.pack(value)).toEqual(Uint8Array.from(buffer));
    });
  });

  describe(".unpack", () => {
    test.each(cases)("($buffer)", ({ value, buffer }) => {
      expect(Int64.unpack(Uint8Array.from(buffer))).toEqual(value);
    });

    test("([0])", () => {
      expect(() => Int64.unpack(Uint8Array.of(0))).toThrow(
        "Expected bytes length 8, found 1",
      );
    });
  });

  test(".getSchema", () => {
    expect(Int64.getSchema()).toEqual("array Int64 [byte; 8];");
  });
});
