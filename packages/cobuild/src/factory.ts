/**
 * Functions to ease creating various data structures.
 * @module
 */

import { blockchain } from "@ckb-lumos/base";
import { BI, BIish } from "@ckb-lumos/bi";
import { number } from "@ckb-lumos/codec";

import {
  BuildingPacket,
  BuildingPacketV1,
  InputCell,
  OutputCell,
  ResolvedInputs,
  ScriptInfo,
  Transaction,
} from "./building-packet";
import {
  CellDep,
  CellInput,
  CellOutput,
  OutPoint,
  Script,
  WitnessArgs,
} from "./builtins";
import {
  Action,
  Message,
  SighashAll,
  SighashAllOnly,
  WitnessLayout,
} from "./witness-layout";

const { Uint256 } = number;
const { Byte32 } = blockchain;

export const BI_ZERO = BI.from(0);

/**
 * Create an unpacked Byte32 by pack a 32-byte unsigned integer in little-endian.
 */
export function makeByte32(uint256: BIish): string {
  return Byte32.unpack(Uint256.pack(uint256));
}

export const BYTE32_ZEROS = makeByte32(0);

export type FactoryParam<T> = { [P in keyof T]?: FactoryParamAny<T[P]> };
type FactoryParamArray<T> = Array<FactoryParamAny<T>>;
type FactoryParamAny<T> = T extends number | string | boolean | BI
  ? T
  : T extends Array<infer Item>
    ? FactoryParamArray<Item>
    : FactoryParam<T>;

/** @param attrs */
export function makeAction({
  scriptInfoHash = BYTE32_ZEROS,
  scriptHash = BYTE32_ZEROS,
  data = "0x",
}: FactoryParam<Action> = {}): Action {
  return { scriptInfoHash, scriptHash, data };
}

/** @param attrs */
export function makeMessage({
  actions = [],
}: FactoryParam<Message> = {}): Message {
  return { actions: actions.map(makeAction) };
}

/** @param attrs */
export function makePayload({
  version = 0,
  inputs = [],
  outputs = [],
  outputsData = [],
  cellDeps = [],
  headerDeps = [],
  witnesses = [],
}: FactoryParam<Transaction> = {}): Transaction {
  return {
    version,
    outputsData,
    headerDeps,
    witnesses,
    inputs: inputs.map(makeCellInput),
    outputs: outputs.map(makeCellOutput),
    cellDeps: cellDeps.map(makeCellDep),
  };
}

/** @param attrs */
export function makeResolvedInputs({
  outputs = [],
  outputsData = [],
}: FactoryParam<ResolvedInputs> = {}): ResolvedInputs {
  return { outputsData, outputs: outputs.map(makeCellOutput) };
}

/** @param attrs */
export function makeBuildingPacketV1({
  message,
  payload,
  resolvedInputs,
  changeOutput,
  scriptInfos = [],
  lockActions = [],
}: FactoryParam<BuildingPacketV1> = {}): BuildingPacketV1 {
  return {
    changeOutput,
    message: makeMessage(message),
    payload: makePayload(payload),
    resolvedInputs: makeResolvedInputs(resolvedInputs),
    scriptInfos: scriptInfos.map(makeScriptInfo),
    lockActions: lockActions.map(makeAction),
  };
}

export function makeBuildingPacket(
  attrs: FactoryParam<BuildingPacketV1> = {},
): BuildingPacket {
  return {
    type: "BuildingPacketV1",
    value: makeBuildingPacketV1(attrs),
  };
}

/** @param attrs */
export function makeScriptInfo({
  name = "0x",
  url = "0x",
  scriptHash = BYTE32_ZEROS,
  schema = "0x",
  messageType = "0x",
}: FactoryParam<ScriptInfo> = {}): ScriptInfo {
  return { name, url, scriptHash, schema, messageType };
}

/** @param attrs */
export function makeOutPoint({
  txHash = BYTE32_ZEROS,
  index = 0,
}: FactoryParam<OutPoint> = {}): OutPoint {
  return { txHash, index };
}

/** @param attrs */
export function makeCellInput({
  previousOutput,
  since = BI_ZERO,
}: FactoryParam<CellInput> = {}): CellInput {
  return {
    previousOutput: makeOutPoint(previousOutput),
    since,
  };
}

/** @param attrs */
export function makeScript({
  codeHash = BYTE32_ZEROS,
  hashType = "data",
  args = "0x",
}: FactoryParam<Script> = {}): Script {
  return { codeHash, hashType, args };
}

/** @param attrs */
export function makeCellOutput({
  capacity = BI_ZERO,
  lock,
  type,
}: FactoryParam<CellOutput> = {}): CellOutput {
  return {
    capacity,
    lock: makeScript(lock),
    type: type === null || type === undefined ? undefined : makeScript(type),
  };
}

export function makeInputCell({
  cellInput,
  cellOutput,
  data = "0x",
}: FactoryParam<InputCell> = {}): InputCell {
  return {
    cellInput: makeCellInput(cellInput),
    cellOutput: makeCellOutput(cellOutput),
    data,
  };
}

export function makeOutputCell({
  cellOutput,
  data = "0x",
}: FactoryParam<OutputCell> = {}): OutputCell {
  return {
    cellOutput: makeCellOutput(cellOutput),
    data,
  };
}

/** @param attrs */
export function makeCellDep({
  outPoint,
  depType = "code",
}: FactoryParam<CellDep> = {}): CellDep {
  return { outPoint: makeOutPoint(outPoint), depType };
}

/** @param attrs */
export function makeWitnessArgs({
  lock,
  inputType,
  outputType,
}: FactoryParam<WitnessArgs> = {}): WitnessArgs {
  return { lock, inputType, outputType };
}

/** @param attrs */
export function makeSighashAllWitnessLayout({
  message,
  seal = "0x",
}: FactoryParam<SighashAll> = {}): WitnessLayout {
  return {
    type: "SighashAll",
    value: {
      message: makeMessage(message),
      seal,
    },
  };
}

/** @param attrs */
export function makeSighashAllOnlyWitnessLayout({
  seal = "0x",
}: FactoryParam<SighashAllOnly> = {}): WitnessLayout {
  return {
    type: "SighashAllOnly",
    value: { seal },
  };
}

export function makeDefaultWitnessLayout(): WitnessLayout {
  return makeSighashAllWitnessLayout({});
}
