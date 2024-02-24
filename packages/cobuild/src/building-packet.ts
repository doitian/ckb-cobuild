import mol from "@ckb-cobuild/molecule";
import {
  Byte32,
  Bytes,
  BytesVec,
  CellInput,
  CellOutput,
  CellOutputVec,
  Transaction,
  Uint32,
} from "@ckb-cobuild/ckb-molecule-codecs";
import { ActionVec, Message } from "./witness-layout";

/** @group Molecule Codecs */
export const Uint32Opt = mol.option("Uint32Opt", Uint32);

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
/**
 * A codec which packs JavaScript string as utf-8 buffer into molecule `vector<byte>`.
 *
 * Note that this codec uses the TextEncoder/TextDecoder API which [is available in most browsers](https://caniuse.com/textencoder).
 * To support older browsers, consider a polyfill like [fast-text-encoding](https://github.com/samthor/fast-text-encoding)
 * @group Molecule Codecs
 */
export const StringCodec = mol.byteFixvec("String").around({
  safeParse: (input: string) => mol.parseSuccess(input),
  willPack: (input: string) => textEncoder.encode(input),
  didUnpack: (value: Uint8Array) => textDecoder.decode(value),
});

/**
 * An alias of {@link StringCodec}.
 *
 * Use StringCodec to avoid name conflict with the builtin String class.
 * @group Molecule Codecs
 * @experimental
 */
export const String = StringCodec;

/**
 * @alpha The fields are not finalized in this structure
 * @group Molecule Codecs
 */
export const ScriptInfo = mol.table(
  "ScriptInfo",
  {
    name: StringCodec,
    url: StringCodec,
    script_hash: Byte32,
    schema: StringCodec,
    message_type: StringCodec,
  },
  ["name", "url", "script_hash", "schema", "message_type"],
);

/** @group Molecule Codecs */
export const ScriptInfoVec = mol.vector("ScriptInfoVec", ScriptInfo);

/** @group Molecule Codecs */
export const ResolvedInputs = mol.table(
  "ResolvedInputs",
  {
    outputs: CellOutputVec,
    outputs_data: BytesVec,
  },
  ["outputs", "outputs_data"],
);

/** @group Molecule Codecs */
export const BuildingPacketV1 = mol.table(
  "BuildingPacketV1",
  {
    message: Message,
    payload: Transaction,
    resolved_inputs: ResolvedInputs,
    change_output: Uint32Opt,
    script_infos: ScriptInfoVec,
    lock_actions: ActionVec,
  },
  [
    "message",
    "payload",
    "resolved_inputs",
    "change_output",
    "script_infos",
    "lock_actions",
  ],
);

/** @group Molecule Codecs */
export const BuildingPacket = mol.union(
  "BuildingPacket",
  { BuildingPacketV1 },
  ["BuildingPacketV1"],
);

export type Uint32Opt = mol.Infer<typeof Uint32Opt>;
export type ScriptInfo = mol.Infer<typeof ScriptInfo>;
export type ScriptInfoVec = mol.Infer<typeof ScriptInfoVec>;
export type ResolvedInputs = mol.Infer<typeof ResolvedInputs>;
export type BuildingPacketV1 = mol.Infer<typeof BuildingPacketV1>;
export type BuildingPacket = mol.Infer<typeof BuildingPacket>;

/** Bundle fields for a transaction input */
export interface InputCell {
  cellInput: CellInput;
  cellOutput: CellOutput;
  data: Bytes;
}
/** Bundle fields for a transaction output */
export interface OutputCell {
  cellOutput: CellOutput;
  data: Bytes;
}
export type Cell = InputCell | OutputCell;

/** Get transaction input from three parallel lists. */
export function getInputCell(
  buildingPacket: BuildingPacket,
  index: number,
): InputCell | undefined {
  const result = {
    cellInput: buildingPacket.value.payload.inputs[index],
    cellOutput: buildingPacket.value.resolved_inputs.outputs[index],
    data: buildingPacket.value.resolved_inputs.outputs_data[index],
  };
  if (
    result.cellInput !== undefined &&
    result.cellOutput !== undefined &&
    result.data !== undefined
  ) {
    return result as InputCell;
  }
}

/** Get transaction output from three parallel lists. */
export function getOutputCell(
  buildingPacket: BuildingPacket,
  index: number,
): OutputCell | undefined {
  const result = {
    cellOutput: buildingPacket.value.payload.outputs[index],
    data: buildingPacket.value.payload.outputs_data[index],
  };
  if (result.cellOutput !== undefined && result.data !== undefined) {
    return result as OutputCell;
  }
}

export default BuildingPacket;
