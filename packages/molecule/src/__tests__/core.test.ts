import { mol } from "../";

describe("byte", () => {
  describe(".safeParse", () => {
    test("(1)", () => {
      const result = mol.byte.safeParse(1);
      expect(result).toEqual(mol.parseSuccess(1));
    });

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

  describe(".parse", () => {
    test("(1)", () => {
      const result = mol.byte.parse(1);
      expect(result).toEqual(1);
    });

    test.each([-1, 1.1, 256])("(%p)", (input) => {
      expect(() => {
        mol.byte.parse(input);
      }).toThrow(`Expected integer from 0 to 255, found ${input}`);
    });
  });

  describe(".unpack", () => {
    test.each([
      [new Uint8Array([0]), 0],
      [new Uint8Array([1]), 1],
    ])("(%p)", (input, expected) => {
      const result = mol.byte.unpack(input);
      expect(result).toBe(expected);
    });

    test("([])", () => {
      expect(() => {
        mol.byte.unpack(new Uint8Array());
      }).toThrow(`Expected bytes length 1, found 0`);
    });
    test("([2, 3])", () => {
      expect(() => {
        mol.byte.unpack(new Uint8Array([2, 3]));
      }).toThrow(`Expected bytes length 1, found 2`);
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
      test.each([0, 1, 255, null])("(%p)", (input) => {
        expect(ByteOpt.safeParse(input)).toEqual(mol.parseSuccess(input));
      });
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
      test.each([
        [new Uint8Array([1]), 1],
        [new Uint8Array(), null],
      ])("(%p)", (input, expected) => {
        const result = ByteOpt.unpack(input);
        expect(result).toEqual(expected);
      });

      test("([2, 3])", () => {
        expect(() => {
          ByteOpt.unpack(new Uint8Array([2, 3]));
        }).toThrow(`Expected bytes length 1, found 2`);
      });
    });
  });
});
