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
      test.each([-1, 1.1, 256])("(%p)", (input) => {
        const result = mol.byte.safeParse(input);
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
        [new Uint8Array([0]), 0],
        [new Uint8Array([1]), 1],
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
      [0, new Uint8Array([0])],
      [1, new Uint8Array([1])],
      [255, new Uint8Array([255])],
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
        test("(-1)", () => {
          const result = ByteOpt.safeParse(-1);
          expect(result.success).toBeFalsy();
          if (!result.success) {
            expect(result.error.toString()).toMatch(
              "Expected integer from 0 to 255, found -1",
            );
          }
        });
      });
    });

    describe(".pack", () => {
      test.each([
        [1, new Uint8Array([1])],
        [null, new Uint8Array()],
      ])("(%p)", (input, expected) => {
        const result = ByteOpt.pack(input);
        expect(result).toEqual(expected);
      });
    });

    describe(".unpack", () => {
      describe("/* success */", () => {
        test.each([
          [new Uint8Array([1]), 1],
          [new Uint8Array(), null],
        ])("(%p)", (input, expected) => {
          const result = ByteOpt.unpack(input);
          expect(result).toEqual(expected);
        });
      });

      describe("/* throws */", () => {
        test("([2, 3])", () => {
          expect(() => {
            ByteOpt.unpack(new Uint8Array([2, 3]));
          }).toThrow(`Expected bytes length 1, found 2`);
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
        test("([1, 2])", () => {
          const result = Byte2.safeParse([1, 2]);
          expect(result).toEqual(mol.parseSuccess([1, 2]));
        });
      });

      describe("/* error */", () => {
        test("([-1, 2])", () => {
          const result = Byte2.safeParse([-1, 2]);
          expect(result.success).toBeFalsy();
          if (!result.success) {
            expect(result.error.toString()).toMatch(
              "Array member parse failed",
            );
          }
        });

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
        test.each([[new Uint8Array([1, 2]), [1, 2]]])(
          "(%p)",
          (input, expected) => {
            const result = Byte2.unpack(input);
            expect(result).toEqual(expected);
          },
        );
      });

      describe("/* throws */", () => {
        test.each([[[]], [[1]], [[1, 2, 3]]])("(%p)", (input) => {
          expect(() => {
            Byte2.unpack(new Uint8Array(input));
          }).toThrow("Expected bytes length 2, found");
        });
      });
    });

    describe(".pack", () => {
      test.each([[[0, 1], new Uint8Array([0, 1])]])(
        "(%p)",
        (input, expected) => {
          const result = Byte2.pack(input);
          expect(result).toEqual(expected);
        },
      );
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
          const result = Byte2.safeParse(new Uint8Array([1, 2]));
          expect(result).toEqual(mol.parseSuccess(new Uint8Array([1, 2])));
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
      });
    });

    describe(".unpack", () => {
      describe("/* success */", () => {
        test.each([[new Uint8Array([1, 2]), [1, 2]]])(
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
          }).toThrow("Expected bytes length 2, found");
        });
      });
    });

    describe(".pack", () => {
      test.each([[[0, 1], new Uint8Array([0, 1])]])(
        "(%p)",
        (input, expected) => {
          const result = Byte2.pack(new Uint8Array(input));
          expect(result).toEqual(expected);
        },
      );
    });
  });
});
