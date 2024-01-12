import { mol } from "../";

describe("byte", () => {
  describe(".safeParse", () => {
    test("(1)", () => {
      const result = mol.byte.safeParse(1);
      expect(result).toEqual({
        success: true,
        data: 1,
      });
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
});
