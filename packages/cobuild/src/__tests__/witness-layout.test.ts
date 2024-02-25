import { Bytes, WitnessArgs } from "@ckb-cobuild/ckb-molecule-codecs";
import { makeByte32 } from "../factory";
import {
  WitnessLayout,
  parseWitnessType,
  tryParseWitness,
} from "../witness-layout";

describe("tryParseWitness", () => {
  test("(empty)", () => {
    expect(() => tryParseWitness(null)).toThrow("Unknown witness format");
    expect(() => tryParseWitness(undefined)).toThrow("Unknown witness format");
    expect(() => tryParseWitness(new Uint8Array())).toThrow(
      "Unknown witness format",
    );
  });

  test("(WitnessArgs)", () => {
    const unpacked: WitnessArgs = {
      lock: Uint8Array.of(),
      input_type: null,
      output_type: null,
    };
    const input = WitnessArgs.pack(unpacked);
    const { type, value } = tryParseWitness(input);
    expect(type).toBe("WitnessArgs");
    expect(value).toEqual(unpacked);
  });

  test("(WitnessLayout)", () => {
    const unpacked: WitnessLayout = {
      type: "SighashAllOnly",
      value: {
        seal: Uint8Array.of(),
      },
    };
    const input = WitnessLayout.pack(unpacked);
    const { type, value } = tryParseWitness(input);
    expect(type).toBe(unpacked.type);
    expect(value).toEqual(unpacked.value);
  });

  test("(Bytes)", () => {
    const input = Bytes.pack(Uint8Array.of(0));
    expect(() => tryParseWitness(input)).toThrow("Unknown witness format");
  });
});

describe("parseWitnessType", () => {
  test("(empty)", () => {
    expect(() => parseWitnessType(null)).toThrow("Unknown witness format");
    expect(() => parseWitnessType(undefined)).toThrow("Unknown witness format");
    expect(() => parseWitnessType(new Uint8Array())).toThrow(
      "Unknown witness format",
    );
  });

  test("(WitnessArgs)", () => {
    const unpacked = {
      lock: new Uint8Array(),
      input_type: null,
      output_type: null,
    };
    const input = WitnessArgs.pack(unpacked);
    const type = parseWitnessType(input);
    expect(type).toBe("WitnessArgs");
  });

  test("(WitnessLayout)", () => {
    const unpacked: WitnessLayout = {
      type: "SighashAllOnly",
      value: {
        seal: new Uint8Array(),
      },
    };
    const input = WitnessLayout.pack(unpacked);
    const type = parseWitnessType(input);
    expect(type).toBe(unpacked.type);
  });

  test("(Bytes)", () => {
    const input = Bytes.pack(Uint8Array.of(0));
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
        seal: Uint8Array.of(1),
        message: {
          actions: [
            {
              script_info_hash: makeByte32(2),
              script_hash: makeByte32(3),
              data: Uint8Array.of(4),
            },
          ],
        },
      },
    ],
    ["SighashAllOnly", { seal: Uint8Array.of(10) }],
  ])("unpack(pack(%s))", (type, value) => {
    const unpack = WitnessLayout.unpack(
      WitnessLayout.pack({ type, value } as WitnessLayout),
    );
    expect(unpack).toEqual({ type, value });
  });
});
