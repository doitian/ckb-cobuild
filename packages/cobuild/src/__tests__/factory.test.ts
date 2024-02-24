import {
  CellInput,
  CellOutput,
  Script,
} from "@ckb-cobuild/ckb-molecule-codecs";
import { BuildingPacket, BuildingPacketV1 } from "../building-packet";
import {
  makeBuildingPacket,
  makeBuildingPacketV1,
  makeCellInput,
  makeCellOutput,
  makeMessage,
  makeScript,
} from "../factory";
import { Message } from "../witness-layout";

test("makeMessage", () => {
  const output = makeMessage();
  const unpacked = Message.unpack(Message.pack(output));
  expect(output).toStrictEqual(unpacked);
});

test("makeBuildingPacketV1", () => {
  const output = makeBuildingPacketV1();
  const unpacked = BuildingPacketV1.unpack(BuildingPacketV1.pack(output));

  unpacked.payload.hash = output.payload.hash;
  expect(output).toStrictEqual(unpacked);
});

test("makeBuildingPacket", () => {
  const output = makeBuildingPacket();
  const unpacked = BuildingPacket.unpack(BuildingPacket.pack(output));

  unpacked.value.payload.hash = output.value.payload.hash;
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
  expect(output.lock).not.toBeNull();
  expect(output.type).toBeNull();
});

test("makeScript", () => {
  const output = makeScript();
  const unpacked = Script.unpack(Script.pack(output));
  expect(output).toStrictEqual(unpacked);
  expect(output.hash_type).toStrictEqual("data");
});
