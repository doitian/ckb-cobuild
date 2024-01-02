import { blockchain } from "@ckb-lumos/base";
import {
  tryParseWitness,
  parseWitnessType,
  WitnessLayout,
  Bytes,
  Message,
  BuildingPacketV1,
  BuildingPacket,
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

test("Message.default()", () => {
  const output = Message.default();
  const unpacked = Message.unpack(Message.pack(output));
  expect(output).toStrictEqual(unpacked);
});

test("BuildingPacketV1.default()", () => {
  const output = BuildingPacketV1.default();
  const unpacked = BuildingPacketV1.unpack(BuildingPacketV1.pack(output));
  expect(output).toStrictEqual(unpacked);
});

test("BuildingPacket.default()", () => {
  const output = BuildingPacket.default();
  const unpacked = BuildingPacket.unpack(BuildingPacket.pack(output));
  expect(output).toStrictEqual(unpacked);
});
