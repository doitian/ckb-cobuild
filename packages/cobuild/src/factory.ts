/**
 * Functions to ease creating various data structures.
 * @module
 */

import mol from "@ckb-cobuild/molecule";
import {
  CellDep,
  CellInput,
  CellOutput,
  OutPoint,
  Script,
  Transaction,
  WitnessArgs,
} from "@ckb-cobuild/ckb-molecule-codecs";
import {
  BuildingPacket,
  BuildingPacketV1,
  InputCell,
  OutputCell,
  ResolvedInputs,
  ScriptInfo,
} from "./building-packet";
import {
  Action,
  Message,
  SighashAll,
  SighashAllOnly,
  WitnessLayout,
} from "./witness-layout";

/**
 * Create an unpacked Byte32 by pack a 32-byte unsigned integer in little-endian.
 */
export function makeByte32(arg: number): Uint8Array {
  const buf = new Uint8Array(32);
  const view = new DataView(buf.buffer);
  view.setUint32(0, arg, true);
  return buf;
}

export const EMPTY_BYTES = new Uint8Array();
export const BYTE32_ZEROS = new Uint8Array(32);

export type FactoryParam<T> = { [P in keyof T]?: FactoryParamAny<T[P]> };
type FactoryParamArray<T> = Array<FactoryParamAny<T>>;
type FactoryParamAny<T> = T extends
  | number
  | string
  | boolean
  | bigint
  | Uint8Array
  ? T
  : T extends Array<infer Item>
    ? FactoryParamArray<Item>
    : FactoryParam<T>;

/** @param attrs */
export function makeAction({
  script_info_hash = BYTE32_ZEROS,
  script_hash = BYTE32_ZEROS,
  data = EMPTY_BYTES,
}: FactoryParam<Action> = {}): Action {
  return { script_info_hash, script_hash, data };
}

/** @param attrs */
export function makeMessage({
  actions = [],
}: FactoryParam<mol.Infer<typeof Message>> = {}): mol.Infer<typeof Message> {
  return { actions: actions.map(makeAction) };
}

/** @param attrs */
export function makePayload({
  hash = BYTE32_ZEROS,
  version = 0,
  inputs = [],
  outputs = [],
  outputs_data = [],
  cell_deps = [],
  header_deps = [],
  witnesses = [],
}: FactoryParam<mol.Infer<typeof Transaction>> = {}): mol.Infer<
  typeof Transaction
> {
  return {
    hash,
    version,
    outputs_data,
    header_deps,
    witnesses,
    inputs: inputs.map(makeCellInput),
    outputs: outputs.map(makeCellOutput),
    cell_deps: cell_deps.map(makeCellDep),
  };
}

/** @param attrs */
export function makeResolvedInputs({
  outputs = [],
  outputs_data = [],
}: FactoryParam<ResolvedInputs> = {}): ResolvedInputs {
  return { outputs_data, outputs: outputs.map(makeCellOutput) };
}

/** @param attrs */
export function makeBuildingPacketV1({
  message,
  payload,
  resolved_inputs,
  change_output = null,
  script_infos = [],
  lock_actions = [],
}: FactoryParam<BuildingPacketV1> = {}): BuildingPacketV1 {
  return {
    change_output,
    message: makeMessage(message),
    payload: makePayload(payload),
    resolved_inputs: makeResolvedInputs(resolved_inputs),
    script_infos: script_infos.map(makeScriptInfo),
    lock_actions: lock_actions.map(makeAction),
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
  name = "",
  url = "",
  script_hash = BYTE32_ZEROS,
  schema = "",
  message_type = "",
}: FactoryParam<ScriptInfo> = {}): ScriptInfo {
  return { name, url, script_hash, schema, message_type };
}

/** @param attrs */
export function makeOutPoint({
  tx_hash = BYTE32_ZEROS,
  index = 0,
}: FactoryParam<OutPoint> = {}): OutPoint {
  return { tx_hash, index };
}

/** @param attrs */
export function makeCellInput({
  previous_output,
  since = 0n,
}: FactoryParam<CellInput> = {}): CellInput {
  return {
    previous_output: makeOutPoint(previous_output),
    since,
  };
}

/** @param attrs */
export function makeScript({
  code_hash = BYTE32_ZEROS,
  hash_type = "data",
  args = EMPTY_BYTES,
}: FactoryParam<Script> = {}): Script {
  return { code_hash, hash_type, args };
}

/** @param attrs */
export function makeCellOutput({
  capacity = 0n,
  lock,
  type,
}: FactoryParam<CellOutput> = {}): CellOutput {
  return {
    capacity,
    lock: makeScript(lock),
    type: type === null || type === undefined ? null : makeScript(type),
  };
}

export function makeInputCell({
  cellInput,
  cellOutput,
  data = EMPTY_BYTES,
}: FactoryParam<InputCell> = {}): InputCell {
  return {
    cellInput: makeCellInput(cellInput),
    cellOutput: makeCellOutput(cellOutput),
    data,
  };
}

export function makeOutputCell({
  cellOutput,
  data = EMPTY_BYTES,
}: FactoryParam<OutputCell> = {}): OutputCell {
  return {
    cellOutput: makeCellOutput(cellOutput),
    data,
  };
}

/** @param attrs */
export function makeCellDep({
  out_point,
  dep_type = "code",
}: FactoryParam<CellDep> = {}): CellDep {
  return { out_point: makeOutPoint(out_point), dep_type };
}

/** @param attrs */
export function makeWitnessArgs({
  lock = null,
  input_type = null,
  output_type = null,
}: FactoryParam<WitnessArgs> = {}): WitnessArgs {
  return { lock, input_type, output_type };
}

/** @param attrs */
export function makeSighashAllWitnessLayout({
  message,
  seal = EMPTY_BYTES,
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
  seal = EMPTY_BYTES,
}: FactoryParam<SighashAllOnly> = {}): WitnessLayout {
  return {
    type: "SighashAllOnly",
    value: { seal },
  };
}

export function makeDefaultWitnessLayout(): WitnessLayout {
  return makeSighashAllWitnessLayout({});
}
