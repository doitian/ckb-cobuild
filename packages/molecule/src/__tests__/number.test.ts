import { mol } from "../";

describe("Uint32", () => {
  describe(".safeParse", () => {
    test.each([0, 0xffffffff])("(%s)", (input) => {
      expect(mol.Uint32.safeParse(input)).toEqual(mol.parseSuccess(input));
    });

    test.each([0.1, NaN, -1, 0x100000000])("(%s)", (input) => {
      expect(mol.Uint32.safeParse(input)).toEqual(
        mol.parseError(`Expected a valid number for Uint32, got ${input}`),
      );
    });
  });

  const cases = [
    {
      value: 0,
      buffer: [0, 0, 0, 0],
    },
    {
      value: 1,
      buffer: [1, 0, 0, 0],
    },
    {
      value: 0xffffffff,
      buffer: [0xff, 0xff, 0xff, 0xff],
    },
  ];

  describe(".pack", () => {
    test.each(cases)("($value)", ({ value, buffer }) => {
      expect(mol.Uint32.pack(value)).toEqual(Uint8Array.from(buffer));
    });
  });

  describe(".unpack", () => {
    test.each(cases)("($buffer)", ({ value, buffer }) => {
      expect(mol.Uint32.unpack(Uint8Array.from(buffer))).toEqual(value);
    });

    test("([0])", () => {
      expect(() => mol.Uint32.unpack(Uint8Array.of(0))).toThrow(
        "Expected bytes length 4, found 1",
      );
    });
  });

  test(".getSchema", () => {
    expect(mol.Uint32.getSchema()).toEqual("array Uint32 [byte; 4];");
  });
});

describe("Int32", () => {
  describe(".safeParse", () => {
    test.each([-0x80000000, 0x7fffffff])("(%s)", (input) => {
      expect(mol.Int32.safeParse(input)).toEqual(mol.parseSuccess(input));
    });

    test.each([0.1, NaN, -0x80000001, 0x80000000])("(%s)", (input) => {
      expect(mol.Int32.safeParse(input)).toEqual(
        mol.parseError(`Expected a valid number for Int32, got ${input}`),
      );
    });
  });

  const cases = [
    {
      value: 0,
      buffer: [0, 0, 0, 0],
    },
    {
      value: -0x80000000,
      buffer: [0x00, 0x00, 0x00, 0x80],
    },
    {
      value: -0x7fffffff,
      buffer: [0x01, 0x00, 0x00, 0x80],
    },
    {
      value: 0x7fffffff,
      buffer: [0xff, 0xff, 0xff, 0x7f],
    },
  ];

  describe(".pack", () => {
    test.each(cases)("($value)", ({ value, buffer }) => {
      expect(mol.Int32.pack(value)).toEqual(Uint8Array.from(buffer));
    });
  });

  describe(".unpack", () => {
    test.each(cases)("($buffer)", ({ value, buffer }) => {
      expect(mol.Int32.unpack(Uint8Array.from(buffer))).toEqual(value);
    });

    test("([0])", () => {
      expect(() => mol.Int32.unpack(Uint8Array.of(0))).toThrow(
        "Expected bytes length 4, found 1",
      );
    });
  });

  test(".getSchema", () => {
    expect(mol.Int32.getSchema()).toEqual("array Int32 [byte; 4];");
  });
});

describe("Uint16", () => {
  describe(".safeParse", () => {
    test.each([0, 0xffff])("(%s)", (input) => {
      expect(mol.Uint16.safeParse(input)).toEqual(mol.parseSuccess(input));
    });

    test.each([0.1, NaN, -1, 0x10000])("(%s)", (input) => {
      expect(mol.Uint16.safeParse(input)).toEqual(
        mol.parseError(`Expected a valid number for Uint16, got ${input}`),
      );
    });
  });

  const cases = [
    {
      value: 0,
      buffer: [0, 0],
    },
    {
      value: 1,
      buffer: [1, 0],
    },
    {
      value: 0xffff,
      buffer: [0xff, 0xff],
    },
  ];

  describe(".pack", () => {
    test.each(cases)("($value)", ({ value, buffer }) => {
      expect(mol.Uint16.pack(value)).toEqual(Uint8Array.from(buffer));
    });
  });

  describe(".unpack", () => {
    test.each(cases)("($buffer)", ({ value, buffer }) => {
      expect(mol.Uint16.unpack(Uint8Array.from(buffer))).toEqual(value);
    });

    test("([0])", () => {
      expect(() => mol.Uint16.unpack(Uint8Array.of(0))).toThrow(
        "Expected bytes length 2, found 1",
      );
    });
  });

  test(".getSchema", () => {
    expect(mol.Uint16.getSchema()).toEqual("array Uint16 [byte; 2];");
  });
});

describe("Int16", () => {
  describe(".safeParse", () => {
    test.each([-0x8000, 0x7fff])("(%s)", (input) => {
      expect(mol.Int16.safeParse(input)).toEqual(mol.parseSuccess(input));
    });

    test.each([0.1, NaN, -0x8001, 0x8000])("(%s)", (input) => {
      expect(mol.Int16.safeParse(input)).toEqual(
        mol.parseError(`Expected a valid number for Int16, got ${input}`),
      );
    });
  });

  const cases = [
    {
      value: 0,
      buffer: [0, 0],
    },
    {
      value: -0x8000,
      buffer: [0x00, 0x80],
    },
    {
      value: -0x7fff,
      buffer: [0x01, 0x80],
    },
    {
      value: 0x7fff,
      buffer: [0xff, 0x7f],
    },
  ];

  describe(".pack", () => {
    test.each(cases)("($value)", ({ value, buffer }) => {
      expect(mol.Int16.pack(value)).toEqual(Uint8Array.from(buffer));
    });
  });

  describe(".unpack", () => {
    test.each(cases)("($buffer)", ({ value, buffer }) => {
      expect(mol.Int16.unpack(Uint8Array.from(buffer))).toEqual(value);
    });

    test("([0])", () => {
      expect(() => mol.Int16.unpack(Uint8Array.of(0))).toThrow(
        "Expected bytes length 2, found 1",
      );
    });
  });

  test(".getSchema", () => {
    expect(mol.Int16.getSchema()).toEqual("array Int16 [byte; 2];");
  });
});
