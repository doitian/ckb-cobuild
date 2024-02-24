import {
  makeBigInt,
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

describe("makeBigInt", () => {
  test.each([
    ["0xf", 0xfn],
    ["-0xf", -0xfn],
  ])("%s", (input, expected) => {
    expect(makeBigInt(input)).toEqual(expected);
  });
});

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

describe("Uint128", () => {
  describe(".safeParse", () => {
    test.each([0n, 0xffffffffffffffffffffffffffffffffn])("(%s)", (input) => {
      expect(Uint128.safeParse(input)).toEqual(mol.parseSuccess(input));
    });

    test.each([0x1000000000000000000000000000000000n])("(%s)", (input) => {
      expect(Uint128.safeParse(input)).toEqual(
        mol.parseError(`Expected a valid number for Uint128, got ${input}`),
      );
    });
  });

  const cases = [
    {
      value: 0n,
      buffer: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      value: 1n,
      buffer: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      value: 0xffffffffffffffffffffffffffffffffn,
      buffer: [
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff,
      ],
    },
  ];

  describe(".pack", () => {
    test.each(cases)("($value)", ({ value, buffer }) => {
      expect(Uint128.pack(value)).toEqual(Uint8Array.from(buffer));
    });
  });

  describe(".unpack", () => {
    test.each(cases)("($buffer)", ({ value, buffer }) => {
      expect(Uint128.unpack(Uint8Array.from(buffer))).toEqual(value);
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
      -0x80000000000000000000000000000000n,
      0x7fffffffffffffffffffffffffffffffn,
    ])("(%s)", (input) => {
      expect(Int128.safeParse(input)).toEqual(mol.parseSuccess(input));
    });

    test.each([
      -0x80000000000000000000000000000001n,
      0x80000000000000000000000000000000n,
    ])("(%s)", (input) => {
      expect(Int128.safeParse(input)).toEqual(
        mol.parseError(`Expected a valid number for Int128, got ${input}`),
      );
    });
  });

  const cases = [
    {
      value: 0n,
      buffer: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      value: -0x80000000000000000000000000000000n,
      buffer: [
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x80,
      ],
    },
    {
      value: -0x7fffffffffffffffffffffffffffffffn,
      buffer: [
        0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x80,
      ],
    },
    {
      value: 0x7fffffffffffffffffffffffffffffffn,
      buffer: [
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0x7f,
      ],
    },
  ];

  describe(".pack", () => {
    test.each(cases)("($value)", ({ value, buffer }) => {
      expect(Int128.pack(value)).toEqual(Uint8Array.from(buffer));
    });
  });

  describe(".unpack", () => {
    test.each(cases)("($buffer)", ({ value, buffer }) => {
      expect(Int128.unpack(Uint8Array.from(buffer))).toEqual(value);
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
      0n,
      0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn,
    ])("(%s)", (input) => {
      expect(Uint256.safeParse(input)).toEqual(mol.parseSuccess(input));
    });

    test.each([
      0x10000000000000000000000000000000000000000000000000000000000000000000n,
    ])("(%s)", (input) => {
      expect(Uint256.safeParse(input)).toEqual(
        mol.parseError(`Expected a valid number for Uint256, got ${input}`),
      );
    });
  });

  const cases = [
    {
      value: 0n,
      buffer: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
      ],
    },
    {
      value: 1n,
      buffer: [
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
      ],
    },
    {
      value:
        0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn,
      buffer: [
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      ],
    },
  ];

  describe(".pack", () => {
    test.each(cases)("($value)", ({ value, buffer }) => {
      expect(Uint256.pack(value)).toEqual(Uint8Array.from(buffer));
    });
  });

  describe(".unpack", () => {
    test.each(cases)("($buffer)", ({ value, buffer }) => {
      expect(Uint256.unpack(Uint8Array.from(buffer))).toEqual(value);
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
      -0x8000000000000000000000000000000000000000000000000000000000000000n,
      0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn,
    ])("(%s)", (input) => {
      expect(Int256.safeParse(input)).toEqual(mol.parseSuccess(input));
    });

    test.each([
      -0x8000000000000000000000000000000000000000000000000000000000000001n,
      0x8000000000000000000000000000000000000000000000000000000000000000n,
    ])("(%s)", (input) => {
      expect(Int256.safeParse(input)).toEqual(
        mol.parseError(`Expected a valid number for Int256, got ${input}`),
      );
    });
  });

  const cases = [
    {
      value: 0n,
      buffer: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
      ],
    },
    {
      value:
        -0x8000000000000000000000000000000000000000000000000000000000000000n,
      buffer: [
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80,
      ],
    },
    {
      value:
        -0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn,
      buffer: [
        0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80,
      ],
    },
    {
      value:
        0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn,
      buffer: [
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f,
      ],
    },
  ];

  describe(".pack", () => {
    test.each(cases)("($value)", ({ value, buffer }) => {
      expect(Int256.pack(value)).toEqual(Uint8Array.from(buffer));
    });
  });

  describe(".unpack", () => {
    test.each(cases)("($buffer)", ({ value, buffer }) => {
      expect(Int256.unpack(Uint8Array.from(buffer))).toEqual(value);
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
  value: bigint;
  expected: number[];
  littleEndian: boolean;
}[] = [
  { byteLength: 1, value: 0n, expected: [0], littleEndian: true },
  { byteLength: 1, value: 1n, expected: [1], littleEndian: true },
  { byteLength: 1, value: 0n, expected: [0], littleEndian: false },
  { byteLength: 1, value: 1n, expected: [1], littleEndian: false },

  { byteLength: 2, value: 0n, expected: [0, 0], littleEndian: true },
  { byteLength: 2, value: 1n, expected: [1, 0], littleEndian: true },
  {
    byteLength: 2,
    value: 0xffffn,
    expected: [0xff, 0xff],
    littleEndian: true,
  },
  { byteLength: 2, value: 0n, expected: [0, 0], littleEndian: false },
  { byteLength: 2, value: 1n, expected: [0, 1], littleEndian: false },
  {
    byteLength: 2,
    value: 0xffffn,
    expected: [0xff, 0xff],
    littleEndian: false,
  },

  { byteLength: 3, value: 0n, expected: [0, 0, 0], littleEndian: true },
  { byteLength: 3, value: 1n, expected: [1, 0, 0], littleEndian: true },
  {
    byteLength: 3,
    value: 0xffffffn,
    expected: [0xff, 0xff, 0xff],
    littleEndian: true,
  },
  { byteLength: 3, value: 0n, expected: [0, 0, 0], littleEndian: false },
  { byteLength: 3, value: 1n, expected: [0, 0, 1], littleEndian: false },
  {
    byteLength: 3,
    value: 0xffffffn,
    expected: [0xff, 0xff, 0xff],
    littleEndian: false,
  },

  { byteLength: 4, value: 0n, expected: [0, 0, 0, 0], littleEndian: true },
  { byteLength: 4, value: 1n, expected: [1, 0, 0, 0], littleEndian: true },
  {
    byteLength: 4,
    value: 0xffffffffn,
    expected: [0xff, 0xff, 0xff, 0xff],
    littleEndian: true,
  },
  { byteLength: 4, value: 0n, expected: [0, 0, 0, 0], littleEndian: false },
  { byteLength: 4, value: 1n, expected: [0, 0, 0, 1], littleEndian: false },
  {
    byteLength: 4,
    value: 0xffffffffn,
    expected: [0xff, 0xff, 0xff, 0xff],
    littleEndian: false,
  },

  {
    byteLength: 7,
    value: 0n,
    expected: [0, 0, 0, 0, 0, 0, 0],
    littleEndian: true,
  },
  {
    byteLength: 7,
    value: 1n,
    expected: [1, 0, 0, 0, 0, 0, 0],
    littleEndian: true,
  },
  {
    byteLength: 7,
    value: 0xffffffffffffffn,
    expected: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
    littleEndian: true,
  },
  {
    byteLength: 7,
    value: 0n,
    expected: [0, 0, 0, 0, 0, 0, 0],
    littleEndian: false,
  },
  {
    byteLength: 7,
    value: 1n,
    expected: [0, 0, 0, 0, 0, 0, 1],
    littleEndian: false,
  },
  {
    byteLength: 7,
    value: 0xffffffffffffffn,
    expected: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
    littleEndian: false,
  },

  {
    byteLength: 16,
    value: 0n,
    expected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    littleEndian: true,
  },
  {
    byteLength: 16,
    value: 1n,
    expected: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    littleEndian: true,
  },
  {
    byteLength: 16,
    value: 0xffffffffffffffffffffffffffffffffn,
    expected: [
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff,
    ],
    littleEndian: true,
  },
  {
    byteLength: 16,
    value: 0n,
    expected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    littleEndian: false,
  },
  {
    byteLength: 16,
    value: 1n,
    expected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    littleEndian: false,
  },
  {
    byteLength: 16,
    value: 0xffffffffffffffffffffffffffffffffn,
    expected: [
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff,
    ],
    littleEndian: false,
  },

  {
    byteLength: 17,
    value: 0n,
    expected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    littleEndian: true,
  },
  {
    byteLength: 17,
    value: 1n,
    expected: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    littleEndian: true,
  },
  {
    byteLength: 17,
    value: 0xffffffffffffffffffffffffffffffffffn,
    expected: [
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff,
    ],
    littleEndian: true,
  },
  {
    byteLength: 17,
    value: 0n,
    expected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    littleEndian: false,
  },
  {
    byteLength: 17,
    value: 1n,
    expected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    littleEndian: false,
  },
  {
    byteLength: 17,
    value: 0xffffffffffffffffffffffffffffffffffn,
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
      const buffer = new Uint8Array(byteLength);
      packUintN(byteLength, value, buffer, littleEndian);
      expect(buffer).toEqual(Uint8Array.from(expected));
    },
  );
});

describe("unpackUintN", () => {
  test.each(uintNCases)(
    "($byteLength, $expected, $littleEndian)",
    ({ byteLength, value, expected, littleEndian }) => {
      const actual = unpackUintN(
        byteLength,
        Uint8Array.from(expected),
        littleEndian,
      );
      expect(actual).toEqual(value);
    },
  );
});
