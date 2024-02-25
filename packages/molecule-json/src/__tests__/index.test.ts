import { toJson, createNumberJsonCodec, createBigIntJsonCodec } from "..";
import mol from "@ckb-cobuild/molecule";
import * as BigIntCodecs from "@ckb-cobuild/molecule-bigint";

const testCaseIn = {
  aCase: 1,
  bCase: null,
  cCase: undefined,
  dCase: true,
  eCase: false,
  fCase: 2n,
  gCase: "g",
  hCase: new Uint8Array(3),
  iCase: ["0x"],
};

const testCaseOut = {
  aCase: "0x1",
  bCase: null,
  cCase: null,
  dCase: true,
  eCase: false,
  fCase: "0x2",
  gCase: "g",
  hCase: "0x000000",
  iCase: ["0x"],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const testCases: [any, any][] = [
  [testCaseIn, testCaseOut],
  [Object.values(testCaseIn), Object.values(testCaseOut)],
];
for (const [name, value] of Object.entries(testCaseIn)) {
  testCases.push([value, testCaseOut[name as keyof typeof testCaseOut]]);
}

describe("toJson", () => {
  test.each(testCases)("(%p)", (input, expected) => {
    expect(toJson(input)).toStrictEqual(expected);
  });
});

describe("createNumberJsonCodec", () => {
  const Uint32 = createNumberJsonCodec(mol.Uint32);
  describe(".safeParse", () => {
    test.each(["0x0", "0x1", "0xffffffff"])("(%s)", (input) => {
      expect(Uint32.safeParse(input)).toEqual(
        mol.parseSuccess(parseInt(input, 16)),
      );
    });
    test.each([0x0, 0x1, 0xffffffff])("(%s)", (input) => {
      expect(Uint32.safeParse(input)).toEqual(mol.parseSuccess(input));
    });
    test.each(["-0x1", "0x100000000", -1, 0x100000000])("(%s)", (input) => {
      expect(Uint32.safeParse(input)).toEqual(
        mol.parseError(
          `Expected a valid number for Uint32, got ${parseInt(
            input.toString(),
          )}`,
        ),
      );
    });
    test.each(["x"])("(%s)", (input) => {
      expect(Uint32.safeParse(input)).toEqual(
        mol.parseError(`Expected a valid number for Uint32, got NaN`),
      );
    });
  });
});

describe("createBigIntJsonCodec", () => {
  const Uint64 = createBigIntJsonCodec(BigIntCodecs.Uint64);
  describe(".safeParse", () => {
    test.each(["0x0", "0x1", "0xffffffffffffffff"])("(%s)", (input) => {
      expect(Uint64.safeParse(input)).toEqual(mol.parseSuccess(BigInt(input)));
    });
    test.each([0x0n, 0x1n, 0xffffffffffffffffn])("(%s)", (input) => {
      expect(Uint64.safeParse(input)).toEqual(mol.parseSuccess(input));
    });
    test.each(["-0x1", "0x10000000000000000", -1n, 0x10000000000000000n])(
      "(%s)",
      (input) => {
        expect(Uint64.safeParse(input)).toEqual(
          mol.parseError(
            `Expected a valid number for Uint64, got ${BigIntCodecs.makeBigInt(
              input,
            )}`,
          ),
        );
      },
    );
    test.each(["x"])("(%s)", (input) => {
      expect(Uint64.safeParse(input)).toEqual(
        mol.parseError(`Expect bigint or 0x-prefix hex string`),
      );
    });
  });
});
