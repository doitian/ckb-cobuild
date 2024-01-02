import { blockchain } from "@ckb-lumos/base";
import {
  tryParseWitness,
  parseWitnessType,
  WitnessLayout,
  Bytes,
} from "../building-packet";

const { WitnessArgs } = blockchain;

test("tryParseWitness(empty)", () => {
  expect(() => tryParseWitness(null)).toThrow("Unknown witness format");
  expect(() => tryParseWitness(undefined)).toThrow("Unknown witness format");
  expect(() => tryParseWitness("0x")).toThrow("Unknown witness format");
});

test("tryParseWitness(WitnessArgs)", () => {
  const unpacked = {
    lock: "0x",
  };
  const input = WitnessArgs.pack(unpacked);
  const { type, value } = tryParseWitness(input);
  expect(type).toBe("WitnessArgs");
  expect(value).toEqual(unpacked);
});

test("tryParseWitness(WitnessLayout)", () => {
  const unpacked = {
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

test("tryParseWitness(Bytes)", () => {
  const input = Bytes.pack("0x00");
  expect(() => tryParseWitness(input)).toThrow("Unknown witness format");
});

test("parseWitnessType(empty)", () => {
  expect(() => parseWitnessType(null)).toThrow("Unknown witness format");
  expect(() => parseWitnessType(undefined)).toThrow("Unknown witness format");
  expect(() => parseWitnessType("0x")).toThrow("Unknown witness format");
});

test("parseWitnessType(WitnessArgs)", () => {
  const unpacked = {
    lock: "0x",
  };
  const input = WitnessArgs.pack(unpacked);
  const type = parseWitnessType(input);
  expect(type).toBe("WitnessArgs");
});

test("parseWitnessType(WitnessLayout)", () => {
  const unpacked = {
    type: "SighashAllOnly",
    value: {
      seal: "0x",
    },
  };
  const input = WitnessLayout.pack(unpacked);
  const type = parseWitnessType(input);
  expect(type).toBe(unpacked.type);
});

test("parseWitnessType(Bytes)", () => {
  const input = Bytes.pack("0x00");
  // cannot differentiate with WitnessArgs
  const type = parseWitnessType(input);
  expect(type).toBe("WitnessArgs");
});
