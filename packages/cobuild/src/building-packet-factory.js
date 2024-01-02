import { number } from "@ckb-lumos/codec";
import { BI } from "@ckb-lumos/bi";

import { Byte32 } from "./building-packet";

const { Uint256 } = number;

export const BI_ZERO = BI.from(0);

/**
 * Create an unpacked Byte32 by pack a 32-byte unsigned integer in little-endian.
 */
export function makeByte32(uint256) {
  return Byte32.unpack(Uint256.pack(uint256));
}

export const BYTE32_ZEROS = makeByte32(0);

export function makeMessage({ actions = [] } = {}) {
  return { actions };
}

export function makePayload({
  version = 0,
  inputs = [],
  outputs = [],
  outputsData = [],
  cellDeps = [],
  headerDeps = [],
  witnesses = [],
} = {}) {
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

export function makeResolvedInputs({ outputs = [], outputsData = [] } = {}) {
  return { outputs, outputsData };
}

export function makeBuildingPacketV1({
  message,
  payload,
  resolvedInputs,
  changeOutput,
  scriptInfos = [],
  lockActions = [],
} = {}) {
  return {
    message: makeMessage(message),
    payload: makePayload(payload),
    resolvedInputs: makeResolvedInputs(resolvedInputs),
    changeOutput,
    scriptInfos,
    lockActions,
  };
}

export function makeBuildingPacket(assignments) {
  return {
    type: "BuildingPacketV1",
    value: makeBuildingPacketV1(assignments),
  };
}

export function makeAction({
  scriptInfoHash = BYTE32_ZEROS,
  scriptHash = BYTE32_ZEROS,
  data = "0x",
} = {}) {
  return { scriptInfoHash, scriptHash, data };
}

export function makeScriptInfo({
  name = "0x",
  url = "0x",
  scriptHash = BYTE32_ZEROS,
  schema = "0x",
  messageType = "0x",
} = {}) {
  return { name, url, scriptHash, schema, messageType };
}

export function makeOutPoint({ txHash = BYTE32_ZEROS, index = 0 } = {}) {
  return { txHash, index };
}

export function makeCellInput({ previousOutput, since = BI_ZERO } = {}) {
  return {
    previousOutput: makeOutPoint(previousOutput),
    since,
  };
}

export function makeCellOutput({ capacity = BI_ZERO, lock, type } = {}) {
  return {
    capacity,
    lock: makeScript(lock),
    type: type === null || type === undefined ? undefined : makeScript(type),
  };
}

export function makeScript({
  codeHash = BYTE32_ZEROS,
  hashType = "data",
  args = "0x",
} = {}) {
  return { codeHash, hashType, args };
}

export function makeCellDep({ outPoint, depType = "code" } = {}) {
  return { outPoint: makeOutPoint(outPoint), depType };
}

export function makeWitnessArgs({ lock, inputType, outputType } = {}) {
  return { lock, inputType, outputType };
}

export function makeDefaultWitnessLayout() {
  return makeSighashAllWitnessLayout({});
}

export function makeSighashAllWitnessLayout({ message, seal = "0x" } = {}) {
  return {
    type: "SighashAll",
    value: {
      message: makeMessage(message),
      seal,
    },
  };
}

export function makeSighashAllOnlyWitnessLayout({ seal = "0x" } = {}) {
  return {
    type: "SighashAllOnly",
    value: { seal },
  };
}
