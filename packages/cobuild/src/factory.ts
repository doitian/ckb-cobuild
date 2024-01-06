/**
 * Functions to ease creating various data structures.
 * @module
 */

import { blockchain } from "@ckb-lumos/base";
import { BI, BIish } from "@ckb-lumos/bi";
import { number } from "@ckb-lumos/codec";

import {
  BuildingPacketUnpackResult,
  BuildingPacketV1UnpackResult,
  CellDepUnpackResult,
  CellInputUnpackResult,
  CellOutputUnpackResult,
  OutPointUnpackResult,
  ResolvedInputsUnpackResult,
  ScriptInfoUnpackResult,
  ScriptUnpackResult,
  TransactionUnpackResult,
} from "./building-packet";
import {
  ActionUnpackResult,
  MessageUnpackResult,
  SighashAllOnlyUnpackResult,
  SighashAllUnpackResult,
  WitnessArgsUnpackResult,
  WitnessLayoutUnpackResult,
} from "./witness-layout";

const { Uint256 } = number;
const { Byte32 } = blockchain;

export const BI_ZERO = BI.from(0);

/**
 * Create an unpacked Byte32 by pack a 32-byte unsigned integer in little-endian.
 */
export function makeByte32(uint256: BIish) {
  return Byte32.unpack(Uint256.pack(uint256));
}

export const BYTE32_ZEROS = makeByte32(0);

/** @param attrs */
export function makeAction({
  scriptInfoHash = BYTE32_ZEROS,
  scriptHash = BYTE32_ZEROS,
  data = "0x",
}: Partial<ActionUnpackResult> = {}): ActionUnpackResult {
  return { scriptInfoHash, scriptHash, data };
}

/** @param attrs */
export function makeMessage({
  actions = [],
}: Partial<MessageUnpackResult> = {}): MessageUnpackResult {
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
}: Partial<TransactionUnpackResult> = {}): TransactionUnpackResult {
  return {
    version,
    inputs,
    outputs,
    outputsData,
    cellDeps,
    headerDeps,
    witnesses,
  };
}

/** @param attrs */
export function makeResolvedInputs({
  outputs = [],
  outputsData = [],
}: Partial<ResolvedInputsUnpackResult> = {}): ResolvedInputsUnpackResult {
  return { outputs, outputsData };
}

/** @param attrs */
export function makeBuildingPacketV1({
  message,
  payload,
  resolvedInputs,
  changeOutput,
  scriptInfos = [],
  lockActions = [],
}: Partial<BuildingPacketV1UnpackResult> = {}): BuildingPacketV1UnpackResult {
  return {
    message: makeMessage(message),
    payload: makePayload(payload),
    resolvedInputs: makeResolvedInputs(resolvedInputs),
    changeOutput,
    scriptInfos,
    lockActions,
  };
}

export function makeBuildingPacket(
  attrs: Partial<BuildingPacketV1UnpackResult> = {},
): BuildingPacketUnpackResult {
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
}: Partial<ScriptInfoUnpackResult> = {}): ScriptInfoUnpackResult {
  return { name, url, scriptHash, schema, messageType };
}

/** @param attrs */
export function makeOutPoint({
  txHash = BYTE32_ZEROS,
  index = 0,
}: Partial<OutPointUnpackResult> = {}): OutPointUnpackResult {
  return { txHash, index };
}

/** @param attrs */
export function makeCellInput({
  previousOutput,
  since = BI_ZERO,
}: Partial<CellInputUnpackResult> = {}): CellInputUnpackResult {
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
}: Partial<ScriptUnpackResult> = {}): ScriptUnpackResult {
  return { codeHash, hashType, args };
}

/** @param attrs */
export function makeCellOutput({
  capacity = BI_ZERO,
  lock,
  type,
}: Partial<CellOutputUnpackResult> = {}): CellOutputUnpackResult {
  return {
    capacity,
    lock: makeScript(lock),
    type: type === null || type === undefined ? undefined : makeScript(type),
  };
}

/** @param attrs */
export function makeCellDep({
  outPoint,
  depType = "code",
}: Partial<CellDepUnpackResult> = {}): CellDepUnpackResult {
  return { outPoint: makeOutPoint(outPoint), depType };
}

/** @param attrs */
export function makeWitnessArgs({
  lock,
  inputType,
  outputType,
}: Partial<WitnessArgsUnpackResult> = {}): WitnessArgsUnpackResult {
  return { lock, inputType, outputType };
}

/** @param attrs */
export function makeSighashAllWitnessLayout({
  message,
  seal = "0x",
}: Partial<SighashAllUnpackResult> = {}): WitnessLayoutUnpackResult {
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
}: Partial<SighashAllOnlyUnpackResult> = {}): WitnessLayoutUnpackResult {
  return {
    type: "SighashAllOnly",
    value: { seal },
  };
}

export function makeDefaultWitnessLayout(): WitnessLayoutUnpackResult {
  return makeSighashAllWitnessLayout({});
}
