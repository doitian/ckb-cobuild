/* eslint-disable @typescript-eslint/no-explicit-any */
import { mol } from "../";

describe("byte", () => {
  describe(".safeParse", () => {
    describe("/* success */", () => {
      test("(1)", () => {
        const result = mol.byte.safeParse(1);
        expect(result).toEqual(mol.parseSuccess(1));
      });
    });

    describe("/* error */", () => {
      test.each([-1, 1.1, 256, null, true, "1"])("(%p)", (input) => {
        const result = mol.byte.safeParse(input as any);
        expect(result.success).toBeFalsy();
        if (!result.success) {
          expect(result.error.toString()).toMatch(
            `Expected integer from 0 to 255, found ${input}`,
          );
        }
      });
    });
  });

  describe(".parse", () => {
    describe("/* success */", () => {
      test("(1)", () => {
        const result = mol.byte.parse(1);
        expect(result).toEqual(1);
      });
    });

    describe("/* throws */", () => {
      test.each([-1, 1.1, 256])("(%p)", (input) => {
        expect(() => {
          mol.byte.parse(input);
        }).toThrow(`Expected integer from 0 to 255, found ${input}`);
      });
    });
  });

  describe(".unpack", () => {
    describe("/* success */", () => {
      test.each([
        [Uint8Array.of(0), 0],
        [Uint8Array.of(1), 1],
      ])("(%p)", (input, expected) => {
        const result = mol.byte.unpack(input);
        expect(result).toBe(expected);
      });
    });

    describe("/* throws */", () => {
      test.each([[[]], [[2, 3]]])("(%p)", (input) => {
        expect(() => {
          mol.byte.unpack(new Uint8Array(input));
        }).toThrow(`Expected bytes length 1, found ${input.length}`);
      });
    });
  });

  describe(".pack", () => {
    test.each([
      [0, Uint8Array.of(0)],
      [1, Uint8Array.of(1)],
      [255, Uint8Array.of(255)],
    ])("(%p)", (input, expected) => {
      const result = mol.byte.pack(input);
      expect(result).toEqual(expected);
    });
  });
});

describe("option", () => {
  describe("(byte)", () => {
    const ByteOpt = mol.option("ByteOpt", mol.byte);

    test(".getSchema", () => {
      expect(ByteOpt.getSchema()).toEqual("option ByteOpt (byte);");
    });

    describe(".safeParse", () => {
      describe("/* success */", () => {
        test.each([0, 1, 255, null])("(%p)", (input) => {
          expect(ByteOpt.safeParse(input)).toEqual(mol.parseSuccess(input));
        });
      });
      describe("/* error */", () => {
        test.each([-1, 1.1, 256, true, "1"])("(%p)", (input) => {
          const result = ByteOpt.safeParse(input as any);
          expect(result.success).toBeFalsy();
          if (!result.success) {
            expect(result.error.toString()).toMatch(
              `Expected integer from 0 to 255, found ${input}`,
            );
          }
        });
      });
    });

    describe(".pack", () => {
      test.each([
        [1, Uint8Array.of(1)],
        [null, Uint8Array.of()],
      ])("(%p)", (input, expected) => {
        const result = ByteOpt.pack(input);
        expect(result).toEqual(expected);
      });
    });

    describe(".unpack", () => {
      describe("/* success */", () => {
        test.each([
          [Uint8Array.of(1), 1],
          [Uint8Array.of(), null],
        ])("(%p)", (input, expected) => {
          const result = ByteOpt.unpack(input);
          expect(result).toEqual(expected);
        });
      });

      describe("/* throws */", () => {
        test("([2, 3])", () => {
          expect(() => {
            ByteOpt.unpack(Uint8Array.of(2, 3));
          }).toThrow("Expected bytes length 1, found 2");
        });
      });
    });
  });
});

describe("array", () => {
  const Byte2 = mol.array("Byte2", mol.byte, 2);

  describe("[byte; 2]", () => {
    test(".getSchema", () => {
      expect(Byte2.getSchema()).toEqual("array Byte2 [byte; 2];");
    });

    describe(".safeParse", () => {
      describe("/* success */", () => {
        test.each([[[1, 2]]])("(%p)", (input) => {
          const result = Byte2.safeParse(input as any);
          expect(result).toEqual(mol.parseSuccess(Array.from(input)));
        });
      });

      describe("/* error */", () => {
        test.each([[[-1, 2]]])("(%p)", (input) => {
          const result = Byte2.safeParse(input as any);
          expect(result.success).toBeFalsy();
          if (!result.success) {
            expect(result.error.toString()).toMatch(
              "Array member parse failed",
            );
          }
        });

        test.each(["12", { "0": 1, "1": 2 }, Uint8Array.of(1, 2)])(
          "(%p)",
          (input) => {
            const result = Byte2.safeParse(input as any);
            expect(result.success).toBeFalsy();
            if (!result.success) {
              expect(result.error.toString()).toMatch(
                `Expected array of length 2, found ${input}`,
              );
            }
          },
        );

        test.each([[[1]], [[1, 2, 3]]])("(%p)", (input) => {
          const result = Byte2.safeParse(input);
          expect(result.success).toBeFalsy();
          if (!result.success) {
            expect(result.error.toString()).toMatch(
              `Expected array length 2, found ${input.length}`,
            );
          }
        });
      });
    });

    describe(".unpack", () => {
      describe("/* success */", () => {
        test.each([[[1, 2]]])("(%p)", (input) => {
          const result = Byte2.unpack(Uint8Array.from(input));
          expect(result).toEqual(input);
        });
      });

      describe("/* throws */", () => {
        test.each([[[]], [[1]], [[1, 2, 3]]])("(%p)", (input) => {
          expect(() => {
            Byte2.unpack(new Uint8Array(input));
          }).toThrow(`Expected bytes length 2, found ${input.length}`);
        });
      });
    });

    describe(".pack", () => {
      test.each([[[0, 1], Uint8Array.of(0, 1)]])("(%p)", (input, expected) => {
        const result = Byte2.pack(input);
        expect(result).toEqual(expected);
      });
    });
  });
});

describe("byteArray", () => {
  const Byte2 = mol.byteArray("Byte2", 2);

  describe("[byte; 2]", () => {
    test(".getSchema", () => {
      expect(Byte2.getSchema()).toEqual("array Byte2 [byte; 2];");
    });

    describe(".safeParse", () => {
      describe("/* success */", () => {
        test("([1, 2])", () => {
          const result = Byte2.safeParse(Uint8Array.of(1, 2));
          expect(result).toEqual(mol.parseSuccess(Uint8Array.of(1, 2)));
        });
      });

      describe("/* error */", () => {
        test.each([[[1]], [[1, 2, 3]]])("(%p)", (input) => {
          const result = Byte2.safeParse(new Uint8Array(input));
          expect(result.success).toBeFalsy();
          if (!result.success) {
            expect(result.error.toString()).toMatch(
              `Expected array length 2, found ${input.length}`,
            );
          }
        });
        test.each([Uint16Array.of(1), "12"])("(%p)", (input) => {
          const result = Byte2.safeParse(input as any);
          expect(result.success).toBeFalsy();
          if (!result.success) {
            expect(result.error.toString()).toMatch(
              `Expected Uint8Array of length 2, found ${input}`,
            );
          }
        });
      });
    });

    describe(".unpack", () => {
      describe("/* success */", () => {
        test.each([[Uint8Array.of(1, 2), [1, 2]]])(
          "(%p)",
          (input, expected) => {
            const result = Byte2.unpack(input);
            expect(result).toEqual(new Uint8Array(expected));
          },
        );
      });

      describe("/* throws */", () => {
        test.each([[[]], [[1]], [[1, 2, 3]]])("(%p)", (input) => {
          expect(() => {
            Byte2.unpack(new Uint8Array(input));
          }).toThrow(`Expected bytes length 2, found ${input.length}`);
        });
      });
    });

    describe(".pack", () => {
      test.each([[[0, 1], Uint8Array.of(0, 1)]])("(%p)", (input, expected) => {
        const result = Byte2.pack(new Uint8Array(input));
        expect(result).toEqual(expected);
      });
    });
  });
});

describe("fixvec", () => {
  const Bytes = mol.fixvec("Bytes", mol.byte);

  test(".getSchema", () => {
    expect(Bytes.getSchema()).toEqual("vector Bytes <byte>;");
  });

  describe(".safeParse", () => {
    describe("/* success */", () => {
      test.each([[[]], [[1, 2]]])("(%p)", (input) => {
        const result = Bytes.safeParse(input as any);
        expect(result).toEqual(mol.parseSuccess(input));
      });
    });

    describe("/* error */", () => {
      test.each([[[-1, 2]]])("(%p)", (input) => {
        const result = Bytes.safeParse(input as any);
        expect(result.success).toBeFalsy();
        if (!result.success) {
          expect(result.error.toString()).toMatch("Array member parse failed");
        }
      });
      test.each(["12", Uint8Array.of(1, 2)])("(%p)", (input) => {
        const result = Bytes.safeParse(input as any);
        expect(result.success).toBeFalsy();
        if (!result.success) {
          expect(result.error.toString()).toMatch(
            `Expected array, found ${input}`,
          );
        }
      });
    });
  });

  describe(".unpack", () => {
    describe("/* success */", () => {
      test.each([
        [Uint8Array.of(0, 0, 0, 0), []],
        [Uint8Array.of(2, 0, 0, 0, 1, 2), [1, 2]],
      ])("(%p)", (input, expected) => {
        const result = Bytes.unpack(input);
        expect(result).toEqual(expected);
      });
    });

    describe("/* throws */", () => {
      test.each([[[]], [[1, 2, 3]]])("(%p)", (input) => {
        expect(() => {
          Bytes.unpack(new Uint8Array(input));
        }).toThrow(`Expected bytes length at least 4, found ${input.length}`);
      });

      test.each([
        [[0, 0, 0, 0, 0], 4],
        [[1, 0, 0, 0], 5],
        [[2, 0, 0, 0, 0], 6],
      ])("(%p)", (input, byteLength) => {
        expect(() => {
          Bytes.unpack(new Uint8Array(input));
        }).toThrow(
          `Expected bytes length ${byteLength}, found ${input.length}`,
        );
      });
    });
  });

  describe(".pack", () => {
    test.each([
      [[], Uint8Array.of(0, 0, 0, 0)],
      [[0, 1], Uint8Array.of(2, 0, 0, 0, 0, 1)],
    ])("(%p)", (input, expected) => {
      const result = Bytes.pack(input);
      expect(result).toEqual(expected);
    });
  });
});

describe("byteFixvec", () => {
  const Bytes = mol.byteFixvec("Bytes");

  test(".getSchema", () => {
    expect(Bytes.getSchema()).toEqual("vector Bytes <byte>;");
  });

  describe(".safeParse", () => {
    describe("/* success */", () => {
      test.each([[[]], [[1, 2]]])("(%p)", (input) => {
        const result = Bytes.safeParse(new Uint8Array(input));
        expect(result).toEqual(mol.parseSuccess(new Uint8Array(input)));
      });
    });
    describe("/* error */", () => {
      test.each(["12", Uint16Array.of(1, 2)])("(%p)", (input) => {
        const result = Bytes.safeParse(input as any);
        expect(result.success).toBeFalsy();
        if (!result.success) {
          expect(result.error.toString()).toMatch(
            `Expected Uint8Array, found ${input}`,
          );
        }
      });
    });
  });

  describe(".unpack", () => {
    describe("/* success */", () => {
      test.each([
        [Uint8Array.of(0, 0, 0, 0), []],
        [Uint8Array.of(2, 0, 0, 0, 1, 2), [1, 2]],
      ])("(%p)", (input, expected) => {
        const result = Bytes.unpack(input);
        expect(result).toEqual(new Uint8Array(expected));
      });
    });

    describe("/* throws */", () => {
      test.each([[[]], [[1, 2, 3]]])("(%p)", (input) => {
        expect(() => {
          Bytes.unpack(new Uint8Array(input));
        }).toThrow(`Expected bytes length at least 4, found ${input.length}`);
      });

      test.each([
        [[0, 0, 0, 0, 0], 4],
        [[1, 0, 0, 0], 5],
        [[2, 0, 0, 0, 0], 6],
      ])("(%p)", (input, byteLength) => {
        expect(() => {
          Bytes.unpack(new Uint8Array(input));
        }).toThrow(
          `Expected bytes length ${byteLength}, found ${input.length}`,
        );
      });
    });
  });

  describe(".pack", () => {
    test.each([
      [[], Uint8Array.of(0, 0, 0, 0)],
      [[0, 1], Uint8Array.of(2, 0, 0, 0, 0, 1)],
    ])("(%p)", (input, expected) => {
      const result = Bytes.pack(new Uint8Array(input));
      expect(result).toEqual(expected);
    });
  });
});

describe("dynvec", () => {
  const ByteOpt = mol.option("ByteOpt", mol.byte);
  const ByteOptVec = mol.dynvec("ByteOptVec", ByteOpt);

  test(".getSchema", () => {
    expect(ByteOptVec.getSchema()).toEqual("vector ByteOptVec <ByteOpt>;");
  });

  describe(".safeParse", () => {
    describe("/* success */", () => {
      test.each([[[]], [[1, 2]], [[null]]])("(%p)", (input) => {
        const result = ByteOptVec.safeParse(input);
        expect(result).toEqual(mol.parseSuccess(input));
      });
    });

    describe("/* error */", () => {
      test("([-1, 2])", () => {
        const result = ByteOptVec.safeParse([-1, 2]);
        expect(result.success).toBeFalsy();
        if (!result.success) {
          expect(result.error.toString()).toMatch("Array member parse failed");
        }
      });
    });

    test.each(["12", Uint8Array.of(1, 2)])("(%p)", (input) => {
      const result = ByteOptVec.safeParse(input as any);
      expect(result.success).toBeFalsy();
      if (!result.success) {
        expect(result.error.toString()).toMatch(
          `Expected array, found ${input}`,
        );
      }
    });
  });

  describe(".unpack", () => {
    describe("/* success */", () => {
      test.each([
        [Uint8Array.of(4, 0, 0, 0), []],
        [Uint8Array.of(8, 0, 0, 0, 8, 0, 0, 0), [null]],
        [Uint8Array.of(9, 0, 0, 0, 8, 0, 0, 0, 1), [1]],
        [Uint8Array.of(13, 0, 0, 0, 12, 0, 0, 0, 12, 0, 0, 0, 1), [null, 1]],
        [Uint8Array.of(13, 0, 0, 0, 12, 0, 0, 0, 13, 0, 0, 0, 1), [1, null]],
      ])("(%p)", (input, expected) => {
        const result = ByteOptVec.unpack(input);
        expect(result).toStrictEqual(expected);
      });
    });

    describe("/* throws */", () => {
      test.each([
        [[], 4],
        [[1, 2, 3], 4],
      ])("(%p)", (input, expectedMinimalByteLength) => {
        expect(() => {
          ByteOptVec.unpack(new Uint8Array(input));
        }).toThrow(
          `Expected bytes length at least ${expectedMinimalByteLength}, found ${input.length}`,
        );
      });

      test.each([
        [[5, 0, 0, 0, 0], 5],
        [[7, 0, 0, 0, 0, 0, 0], 7],
      ])("(%p)", (input, byteLength) => {
        expect(() => {
          ByteOptVec.unpack(new Uint8Array(input));
        }).toThrow(`Invalid dynvec bytes length: ${byteLength}`);
      });

      test.each([
        [[5, 0, 0, 0], 5],
        [[3, 0, 0, 0], 3],
      ])("(%p)", (input, expectedByteLength) => {
        expect(() => {
          ByteOptVec.unpack(new Uint8Array(input));
        }).toThrow(
          `Expected bytes length ${expectedByteLength}, found ${input.length}`,
        );
      });

      test.each([
        [
          [8, 0, 0, 0, 0, 0, 0, 0],
          [8, 0],
        ],
        [
          [8, 0, 0, 0, 4, 0, 0, 0],
          [8, 4],
        ],
        [
          [8, 0, 0, 0, 9, 0, 0, 0],
          [8, 9],
        ],
        [
          [12, 0, 0, 0, 12, 0, 0, 0, 8, 0, 0, 0],
          [12, 12, 8],
        ],
      ])("(%p)", (input, parsedHeader) => {
        expect(() => {
          ByteOptVec.unpack(new Uint8Array(input));
        }).toThrow(`Invalid dynvec header parsed so far: ${parsedHeader}`);
      });
    });
  });

  describe(".pack", () => {
    test.each([
      [[], Uint8Array.of(4, 0, 0, 0)],
      [[null], Uint8Array.of(8, 0, 0, 0, 8, 0, 0, 0)],
      [[1], Uint8Array.of(9, 0, 0, 0, 8, 0, 0, 0, 1)],
      [[null, 1], Uint8Array.of(13, 0, 0, 0, 12, 0, 0, 0, 12, 0, 0, 0, 1)],
      [[1, null], Uint8Array.of(13, 0, 0, 0, 12, 0, 0, 0, 13, 0, 0, 0, 1)],
    ])("(%p)", (input, expected) => {
      const result = ByteOptVec.pack(input);
      expect(result).toEqual(expected);
    });
  });
});

describe("vector", () => {
  test("(byte)", () => {
    const Bytes = mol.vector("Bytes", mol.byte);
    expect(Bytes.pack([1, 1])).toEqual(Uint8Array.of(2, 0, 0, 0, 1, 1));
  });

  test("(ByteOpt)", () => {
    const ByteOpt = mol.option("ByteOpt", mol.byte);
    const Bytes = mol.vector("ByteOptVec", ByteOpt);
    expect(Bytes.pack([1, 1])).toEqual(
      Uint8Array.of(14, 0, 0, 0, 12, 0, 0, 0, 13, 0, 0, 0, 1, 1),
    );
  });
});

describe("struct", () => {
  const Byte2 = mol.array("Byte2", mol.byte, 2);
  const Byte4 = mol.array("Byte4", mol.byte, 4);
  const Byte2n4 = mol.struct(
    "Byte2n4",
    {
      b2: Byte2,
      b4: Byte4,
    },
    ["b2", "b4"],
  );
  const Byte4n2 = mol.struct(
    "Byte4n2",
    {
      b2: Byte2,
      b4: Byte4,
    },
    ["b4", "b2"],
  );

  describe(".getSchema", () => {
    test("(Byte2n4)", () => {
      expect(Byte2n4.getSchema()).toEqual(`struct Byte2n4 {
    b2: Byte2,
    b4: Byte4,
}`);
    });
    test("(Byte4n2)", () => {
      expect(Byte4n2.getSchema()).toEqual(`struct Byte4n2 {
    b4: Byte4,
    b2: Byte2,
}`);
    });
  });

  describe(".safeParse", () => {
    describe("/* success */", () => {
      test.each([
        [
          { b2: [1, 2], b4: [1, 2, 3, 4], bn: true },
          { b2: [1, 2], b4: [1, 2, 3, 4] },
        ],
      ])("(%p)", (input) => {
        const result = Byte4n2.safeParse(input);
        expect(result).toEqual(
          mol.parseSuccess({ b2: input.b2, b4: input.b4 }),
        );
      });
    });

    describe("/* error */", () => {
      test.each(["str", []])("([%p])", (input) => {
        const result = Byte4n2.safeParse(input as any);
        expect(result.success).toBeFalsy();
        if (!result.success) {
          expect(result.error.toString()).toMatch(
            `Expected object, found ${input}`,
          );
        }
      });

      test.each([{}, { b2: [1, 2] }, { b2: [1, 2], b4: [1, 2, 3, 4, 5] }])(
        "([%p])",
        (input) => {
          const result = Byte4n2.safeParse(input as any);
          expect(result.success).toBeFalsy();
          if (!result.success) {
            expect(result.error.toString()).toMatch(
              "Struct member parse failed",
            );
          }
        },
      );
    });
  });

  describe(".unpack", () => {
    describe("/* success */", () => {
      test.each([
        [Uint8Array.of(4, 0, 0, 0, 2, 0), { b2: [2, 0], b4: [4, 0, 0, 0] }],
      ])("(%p)", (input, expected) => {
        const result = Byte4n2.unpack(input);
        expect(result).toStrictEqual(expected);
      });
    });

    describe("/* throws */", () => {
      test.each([[[]], [[1, 2, 3, 4, 5]], [[1, 2, 3, 4, 5, 6, 7]]])(
        "(%p)",
        (input) => {
          expect(() => {
            Byte4n2.unpack(new Uint8Array(input));
          }).toThrow(`Expected bytes length 6, found ${input.length}`);
        },
      );
    });
  });

  describe(".pack", () => {
    test.each([
      [{ b2: [2, 2], b4: [4, 4, 4, 4] }, Uint8Array.of(4, 4, 4, 4, 2, 2)],
    ])("(%p)", (input, expected) => {
      const result = Byte4n2.pack(input);
      expect(result).toEqual(expected);
    });
  });
});

describe("structFromEntries", () => {
  const Byte2 = mol.array("Byte2", mol.byte, 2);
  const Byte4 = mol.array("Byte4", mol.byte, 4);
  const Byte2n4 = mol.structFromEntries("Byte2n4", [
    ["b2", Byte2],
    ["b4", Byte4],
  ]);

  describe(".getSchema", () => {
    test("(Byte2n4)", () => {
      expect(Byte2n4.getSchema()).toEqual(`struct Byte2n4 {
    b2: Byte2,
    b4: Byte4,
}`);
    });
  });

  test(".order", () => {
    expect(Byte2n4.order).toEqual(["b2", "b4"]);
  });
});
