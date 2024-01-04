import { blockchain } from "@ckb-lumos/base";
import {
  makeMessage,
  makeBuildingPacketV1,
  makeBuildingPacket,
  makeCellInput,
  makeCellOutput,
  makeScript,
} from "../building-packet-factory";
import { Message, BuildingPacketV1, BuildingPacket } from "../building-packet";

const { CellInput, CellOutput, Script } = blockchain;

test("makeMessage", () => {
  const output = makeMessage();
  const unpacked = Message.unpack(Message.pack(output));
  expect(output).toStrictEqual(unpacked);
});

test("makeBuildingPacketV1", () => {
  const output = makeBuildingPacketV1();
  const unpacked = BuildingPacketV1.unpack(BuildingPacketV1.pack(output));
  expect(output).toStrictEqual(unpacked);
});

test("makeBuildingPacket", () => {
  const output = makeBuildingPacket();
  const unpacked = BuildingPacket.unpack(BuildingPacket.pack(output));
  expect(output).toStrictEqual(unpacked);
});

test("makeCellInput", () => {
  const output = makeCellInput();
  const unpacked = CellInput.unpack(CellInput.pack(output));
  expect(output).toStrictEqual(unpacked);
});

test("makeCellOutput", () => {
  const output = makeCellOutput();
  const unpacked = CellOutput.unpack(CellOutput.pack(output));
  expect(output).toStrictEqual(unpacked);
  expect(output.lock).not.toBeUndefined();
  expect(output.type).toBeUndefined();
});

test("makeScript", () => {
  const output = makeScript();
  const unpacked = Script.unpack(Script.pack(output));
  expect(output).toStrictEqual(unpacked);
  expect(output.hashType).toStrictEqual("data");
});
