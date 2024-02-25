import {
  CellDep,
  CellInput,
  CellOutput,
  Script,
} from "@ckb-cobuild/ckb-molecule-codecs";
import {
  BuildingPacket,
  BuildingPacketV1,
  ScriptInfo,
} from "../building-packet";
import {
  makeAction,
  makeBuildingPacket,
  makeBuildingPacketV1,
  makeCellDep,
  makeCellInput,
  makeCellOutput,
  makeMessage,
  makeScript,
  makeScriptInfo,
} from "../factory";
import { Action, Message } from "../witness-layout";

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

test("makeCellDep", () => {
  const output = makeCellDep();
  const unpacked = CellDep.unpack(CellDep.pack(output));
  expect(output).toStrictEqual(unpacked);
  expect(unpacked.dep_type).toStrictEqual("code");
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

test("makeAction", () => {
  const output = makeAction();
  const unpacked = Action.unpack(Action.pack(output));
  expect(output).toStrictEqual(unpacked);
});

test("makeScriptInfo", () => {
  const output = makeScriptInfo();
  const unpacked = ScriptInfo.unpack(ScriptInfo.pack(output));
  expect(output).toStrictEqual(unpacked);
});
