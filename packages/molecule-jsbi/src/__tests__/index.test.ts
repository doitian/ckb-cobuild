import JSBI from "jsbi";
import {
  makeJSBI,
  Uint64,
  Int64,
  Uint128,
  Int128,
  Uint256,
  Int256,
  packUintN,
  unpackUintN,
} from "../";
import mol from "@ckb-cobuild/molecule";

describe("Uint64", () => {
  describe(".safeParse", () => {
    test.each(["0", "0xffffffffffffffff"])("(%s)", (input) => {
      const jsbi = JSBI.BigInt(input);
      expect(Uint64.safeParse(jsbi)).toEqual(mol.parseSuccess(jsbi));
    });

    test.each(["0x10000000000000000"])("(%s)", (input) => {
      const jsbi = JSBI.BigInt(input);
      expect(Uint64.safeParse(jsbi)).toEqual(
        mol.parseError(`Expected a valid number for Uint64, got ${jsbi}`),
      );
    });
  });

  const cases = [
    {
      value: "0",
      buffer: [0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      value: "1",
      buffer: [1, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      value: "0xffffffffffffffff",
      buffer: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
    },
  ];

  describe(".pack", () => {
    test.each(cases)("($value)", ({ value, buffer }) => {
      expect(Uint64.pack(JSBI.BigInt(value))).toEqual(Uint8Array.from(buffer));
    });
  });

  describe(".unpack", () => {
    test.each(cases)("($buffer)", ({ value, buffer }) => {
      expect(Uint64.unpack(Uint8Array.from(buffer))).toEqual(
        JSBI.BigInt(value),
      );
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
    test.each(["-0x8000000000000000", "0x7fffffffffffffff"])(
      "(%s)",
      (input) => {
        const jsbi = makeJSBI(input);
        expect(Int64.safeParse(jsbi)).toEqual(mol.parseSuccess(jsbi));
      },
    );

    test.each(["-0x8000000000000001", "0x8000000000000000"])(
      "(%s)",
      (input) => {
        const jsbi = makeJSBI(input);
        expect(Int64.safeParse(jsbi)).toEqual(
          mol.parseError(`Expected a valid number for Int64, got ${jsbi}`),
        );
      },
    );
  });

  const cases = [
    {
      value: "0",
      buffer: [0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      value: "-0x8000000000000000",
      buffer: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80],
    },
    {
      value: "-0x7fffffffffffffff",
      buffer: [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80],
    },
    {
      value: "0x7fffffffffffffff",
      buffer: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f],
    },
  ];

  describe(".pack", () => {
    test.each(cases)("($value)", ({ value, buffer }) => {
      expect(Int64.pack(makeJSBI(value))).toEqual(Uint8Array.from(buffer));
    });
  });

  describe(".unpack", () => {
    test.each(cases)("($buffer)", ({ value, buffer }) => {
      expect(Int64.unpack(Uint8Array.from(buffer))).toEqual(makeJSBI(value));
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

describe("Uint128", () => {
  describe(".safeParse", () => {
    test.each(["0", "0xffffffffffffffffffffffffffffffff"])("(%s)", (input) => {
      const jsbi = makeJSBI(input);
      expect(Uint128.safeParse(makeJSBI(jsbi))).toEqual(mol.parseSuccess(jsbi));
    });

    test.each(["0x1000000000000000000000000000000000"])("(%s)", (input) => {
      const jsbi = makeJSBI(input);
      expect(Uint128.safeParse(jsbi)).toEqual(
        mol.parseError(`Expected a valid number for Uint128, got ${jsbi}`),
      );
    });
  });

  const cases = [
    {
      value: "0",
      buffer: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      value: "1",
      buffer: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      value: "0xffffffffffffffffffffffffffffffff",
      buffer: [
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff,
      ],
    },
  ];

  describe(".pack", () => {
    test.each(cases)("($value)", ({ value, buffer }) => {
      expect(Uint128.pack(makeJSBI(value))).toEqual(Uint8Array.from(buffer));
    });
  });

  describe(".unpack", () => {
    test.each(cases)("($buffer)", ({ value, buffer }) => {
      expect(Uint128.unpack(Uint8Array.from(buffer))).toEqual(makeJSBI(value));
    });

    test("([0])", () => {
      expect(() => Uint128.unpack(Uint8Array.of(0))).toThrow(
        "Expected bytes length 16, found 1",
      );
    });
  });

  test(".getSchema", () => {
    expect(Uint128.getSchema()).toEqual("array Uint128 [byte; 16];");
  });
});

describe("Int128", () => {
  describe(".safeParse", () => {
    test.each([
      "-0x80000000000000000000000000000000",
      "0x7fffffffffffffffffffffffffffffff",
    ])("(%s)", (input) => {
      const jsbi = makeJSBI(input);
      expect(Int128.safeParse(jsbi)).toEqual(mol.parseSuccess(jsbi));
    });

    test.each([
      "-0x80000000000000000000000000000001",
      "0x80000000000000000000000000000000",
    ])("(%s)", (input) => {
      const jsbi = makeJSBI(input);
      expect(Int128.safeParse(jsbi)).toEqual(
        mol.parseError(`Expected a valid number for Int128, got ${jsbi}`),
      );
    });
  });

  const cases = [
    {
      value: "0",
      buffer: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      value: "-0x80000000000000000000000000000000",
      buffer: [
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x80,
      ],
    },
    {
      value: "-0x7fffffffffffffffffffffffffffffff",
      buffer: [
        0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x80,
      ],
    },
    {
      value: "0x7fffffffffffffffffffffffffffffff",
      buffer: [
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0x7f,
      ],
    },
  ];

  describe(".pack", () => {
    test.each(cases)("($value)", ({ value, buffer }) => {
      expect(Int128.pack(makeJSBI(value))).toEqual(Uint8Array.from(buffer));
    });
  });

  describe(".unpack", () => {
    test.each(cases)("($buffer)", ({ value, buffer }) => {
      expect(Int128.unpack(Uint8Array.from(buffer))).toEqual(makeJSBI(value));
    });

    test("([0])", () => {
      expect(() => Int128.unpack(Uint8Array.of(0))).toThrow(
        "Expected bytes length 16, found 1",
      );
    });
  });

  test(".getSchema", () => {
    expect(Int128.getSchema()).toEqual("array Int128 [byte; 16];");
  });
});

describe("Uint256", () => {
  describe(".safeParse", () => {
    test.each([
      "0",
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    ])("(%s)", (input) => {
      const jsbi = makeJSBI(input);
      expect(Uint256.safeParse(jsbi)).toEqual(mol.parseSuccess(jsbi));
    });

    test.each([
      "0x10000000000000000000000000000000000000000000000000000000000000000000",
    ])("(%s)", (input) => {
      const jsbi = makeJSBI(input);
      expect(Uint256.safeParse(jsbi)).toEqual(
        mol.parseError(`Expected a valid number for Uint256, got ${jsbi}`),
      );
    });
  });

  const cases = [
    {
      value: "0",
      buffer: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
      ],
    },
    {
      value: "1",
      buffer: [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
      ],
    },
    {
      value:
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      buffer: [
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      ],
    },
  ];

  describe(".pack", () => {
    test.each(cases)("($value)", ({ value, buffer }) => {
      expect(Uint256.pack(makeJSBI(value))).toEqual(Uint8Array.from(buffer));
    });
  });

  describe(".unpack", () => {
    test.each(cases)("($buffer)", ({ value, buffer }) => {
      expect(Uint256.unpack(Uint8Array.from(buffer))).toEqual(makeJSBI(value));
    });

    test("([0])", () => {
      expect(() => Uint256.unpack(Uint8Array.of(0))).toThrow(
        "Expected bytes length 32, found 1",
      );
    });
  });

  test(".getSchema", () => {
    expect(Uint256.getSchema()).toEqual("array Uint256 [byte; 32];");
  });
});

describe("Int256", () => {
  describe(".safeParse", () => {
    test.each([
      "-0x8000000000000000000000000000000000000000000000000000000000000000",
      "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    ])("(%s)", (input) => {
      const jsbi = makeJSBI(input);
      expect(Int256.safeParse(jsbi)).toEqual(mol.parseSuccess(jsbi));
    });

    test.each([
      "-0x8000000000000000000000000000000000000000000000000000000000000001",
      "0x8000000000000000000000000000000000000000000000000000000000000000",
    ])("(%s)", (input) => {
      const jsbi = makeJSBI(input);
      expect(Int256.safeParse(jsbi)).toEqual(
        mol.parseError(`Expected a valid number for Int256, got ${jsbi}`),
      );
    });
  });

  const cases = [
    {
      value: "0",
      buffer: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
      ],
    },
    {
      value:
        "-0x8000000000000000000000000000000000000000000000000000000000000000",
      buffer: [
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80,
      ],
    },
    {
      value:
        "-0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      buffer: [
        0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80,
      ],
    },
    {
      value:
        "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      buffer: [
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f,
      ],
    },
  ];

  describe(".pack", () => {
    test.each(cases)("($value)", ({ value, buffer }) => {
      expect(Int256.pack(makeJSBI(value))).toEqual(Uint8Array.from(buffer));
    });
  });

  describe(".unpack", () => {
    test.each(cases)("($buffer)", ({ value, buffer }) => {
      expect(Int256.unpack(Uint8Array.from(buffer))).toEqual(makeJSBI(value));
    });

    test("([0])", () => {
      expect(() => Int256.unpack(Uint8Array.of(0))).toThrow(
        "Expected bytes length 32, found 1",
      );
    });
  });

  test(".getSchema", () => {
    expect(Int256.getSchema()).toEqual("array Int256 [byte; 32];");
  });
});

const uintNCases: {
  byteLength: number;
  value: string;
  expected: number[];
  littleEndian: boolean;
}[] = [
  { byteLength: 1, value: "0", expected: [0], littleEndian: true },
  { byteLength: 1, value: "1", expected: [1], littleEndian: true },
  { byteLength: 1, value: "0", expected: [0], littleEndian: false },
  { byteLength: 1, value: "1", expected: [1], littleEndian: false },

  { byteLength: 2, value: "0", expected: [0, 0], littleEndian: true },
  { byteLength: 2, value: "1", expected: [1, 0], littleEndian: true },
  {
    byteLength: 2,
    value: "0xffff",
    expected: [0xff, 0xff],
    littleEndian: true,
  },
  { byteLength: 2, value: "0", expected: [0, 0], littleEndian: false },
  { byteLength: 2, value: "1", expected: [0, 1], littleEndian: false },
  {
    byteLength: 2,
    value: "0xffff",
    expected: [0xff, 0xff],
    littleEndian: false,
  },

  { byteLength: 3, value: "0", expected: [0, 0, 0], littleEndian: true },
  { byteLength: 3, value: "1", expected: [1, 0, 0], littleEndian: true },
  {
    byteLength: 3,
    value: "0xffffff",
    expected: [0xff, 0xff, 0xff],
    littleEndian: true,
  },
  { byteLength: 3, value: "0", expected: [0, 0, 0], littleEndian: false },
  { byteLength: 3, value: "1", expected: [0, 0, 1], littleEndian: false },
  {
    byteLength: 3,
    value: "0xffffff",
    expected: [0xff, 0xff, 0xff],
    littleEndian: false,
  },

  { byteLength: 4, value: "0", expected: [0, 0, 0, 0], littleEndian: true },
  { byteLength: 4, value: "1", expected: [1, 0, 0, 0], littleEndian: true },
  {
    byteLength: 4,
    value: "0xffffffff",
    expected: [0xff, 0xff, 0xff, 0xff],
    littleEndian: true,
  },
  { byteLength: 4, value: "0", expected: [0, 0, 0, 0], littleEndian: false },
  { byteLength: 4, value: "1", expected: [0, 0, 0, 1], littleEndian: false },
  {
    byteLength: 4,
    value: "0xffffffff",
    expected: [0xff, 0xff, 0xff, 0xff],
    littleEndian: false,
  },

  {
    byteLength: 7,
    value: "0",
    expected: [0, 0, 0, 0, 0, 0, 0],
    littleEndian: true,
  },
  {
    byteLength: 7,
    value: "1",
    expected: [1, 0, 0, 0, 0, 0, 0],
    littleEndian: true,
  },
  {
    byteLength: 7,
    value: "0xffffffffffffff",
    expected: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
    littleEndian: true,
  },
  {
    byteLength: 7,
    value: "0",
    expected: [0, 0, 0, 0, 0, 0, 0],
    littleEndian: false,
  },
  {
    byteLength: 7,
    value: "1",
    expected: [0, 0, 0, 0, 0, 0, 1],
    littleEndian: false,
  },
  {
    byteLength: 7,
    value: "0xffffffffffffff",
    expected: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
    littleEndian: false,
  },

  {
    byteLength: 16,
    value: "0",
    expected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    littleEndian: true,
  },
  {
    byteLength: 16,
    value: "1",
    expected: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    littleEndian: true,
  },
  {
    byteLength: 16,
    value: "0xffffffffffffffffffffffffffffffff",
    expected: [
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff,
    ],
    littleEndian: true,
  },
  {
    byteLength: 16,
    value: "0",
    expected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    littleEndian: false,
  },
  {
    byteLength: 16,
    value: "1",
    expected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    littleEndian: false,
  },
  {
    byteLength: 16,
    value: "0xffffffffffffffffffffffffffffffff",
    expected: [
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff,
    ],
    littleEndian: false,
  },

  {
    byteLength: 17,
    value: "0",
    expected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    littleEndian: true,
  },
  {
    byteLength: 17,
    value: "1",
    expected: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    littleEndian: true,
  },
  {
    byteLength: 17,
    value: "0xffffffffffffffffffffffffffffffffff",
    expected: [
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff,
    ],
    littleEndian: true,
  },
  {
    byteLength: 17,
    value: "0",
    expected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    littleEndian: false,
  },
  {
    byteLength: 17,
    value: "1",
    expected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    littleEndian: false,
  },
  {
    byteLength: 17,
    value: "0xffffffffffffffffffffffffffffffffff",
    expected: [
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff,
    ],
    littleEndian: false,
  },
];

describe("packUintN", () => {
  test.each(uintNCases)(
    "($byteLength, $value, _, $littleEndian)",
    ({ byteLength, value, expected, littleEndian }) => {
      const jsbi = makeJSBI(value);
      const buffer = new Uint8Array(byteLength);
      packUintN(byteLength, jsbi, buffer, littleEndian);
      expect(buffer).toEqual(Uint8Array.from(expected));
    },
  );
});

describe("unpackUintN", () => {
  test.each(uintNCases)(
    "($byteLength, $expected, $littleEndian)",
    ({ byteLength, value, expected, littleEndian }) => {
      const jsbi = makeJSBI(value);
      const actual = unpackUintN(
        byteLength,
        Uint8Array.from(expected),
        littleEndian,
      );
      expect(actual).toEqual(jsbi);
    },
  );
});
