import { blockchain } from "@ckb-lumos/base";
import { PackParam } from "@ckb-lumos/codec";
import {
  tryParseWitness,
  parseWitnessType,
  WitnessLayout,
  Bytes,
} from "../witness-layout";

const { WitnessArgs } = blockchain;

describe("tryParseWitness", () => {
  test("(empty)", () => {
    expect(() => tryParseWitness(null)).toThrow("Unknown witness format");
    expect(() => tryParseWitness(undefined)).toThrow("Unknown witness format");
    expect(() => tryParseWitness("0x")).toThrow("Unknown witness format");
  });

  test("(WitnessArgs)", () => {
    const unpacked = {
      lock: "0x",
    };
    const input = WitnessArgs.pack(unpacked);
    const { type, value } = tryParseWitness(input);
    expect(type).toBe("WitnessArgs");
    expect(value).toEqual(unpacked);
  });

  test("(WitnessLayout)", () => {
    const unpacked: PackParam<typeof WitnessLayout> = {
      type: "SighashAllOnly",
      value: {
        seal: "0x",
      },
    };
    const input = WitnessLayout.pack(unpacked);
    const { type, value } = tryParseWitness(input);
    expect(type).toBe(unpacked.type);
    expect(value).toEqual(unpacked.value);
  });

  test("(Bytes)", () => {
    const input = Bytes.pack("0x00");
    expect(() => tryParseWitness(input)).toThrow("Unknown witness format");
  });
});

describe("parseWitnessType", () => {
  test("(empty)", () => {
    expect(() => parseWitnessType(null)).toThrow("Unknown witness format");
    expect(() => parseWitnessType(undefined)).toThrow("Unknown witness format");
    expect(() => parseWitnessType("0x")).toThrow("Unknown witness format");
  });

  test("(WitnessArgs)", () => {
    const unpacked = {
      lock: "0x",
    };
    const input = WitnessArgs.pack(unpacked);
    const type = parseWitnessType(input);
    expect(type).toBe("WitnessArgs");
  });

  test("(WitnessLayout)", () => {
    const unpacked: PackParam<typeof WitnessLayout> = {
      type: "SighashAllOnly",
      value: {
        seal: "0x",
      },
    };
    const input = WitnessLayout.pack(unpacked);
    const type = parseWitnessType(input);
    expect(type).toBe(unpacked.type);
  });

  test("(Bytes)", () => {
    const input = Bytes.pack("0x00");
    // cannot differentiate with WitnessArgs
    const type = parseWitnessType(input);
    expect(type).toBe("WitnessArgs");
  });
});

describe("WitnessLayout", () => {
  test.each([
    [
      "SighashAll",
      {
        seal: "0x01",
        message: {
          actions: [
            {
              scriptInfoHash: `0x02${"0".repeat(62)}`,
              scriptHash: `0x03${"0".repeat(62)}`,
              data: "0x04",
            },
          ],
        },
      },
    ],
    ["SighashAllOnly", { seal: "0x10" }],
  ])("unpack(pack(%s))", (type, value) => {
    const unpack = WitnessLayout.unpack(
      WitnessLayout.pack({ type, value } as any),
    );
    expect(unpack).toEqual({ type, value });
  });
});
