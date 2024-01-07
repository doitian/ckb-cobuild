import { blockchain } from "@ckb-lumos/base";
import {
  PackParam,
  PackResult,
  UnpackResult,
  createBytesCodec,
  molecule,
  number,
} from "@ckb-lumos/codec";

import { ActionVec, Message } from "./witness-layout";

const { Uint32LE } = number;
const { option, table, vector, union } = molecule;
const {
  Byte32,
  BytesVec,
  CellOutputVec,
  OutPoint,
  CellInput,
  Script,
  CellOutput,
  CellDep,
} = blockchain;

export const Uint32Opt = option(Uint32LE);

/**
 * A codec which packs JavaScript string as utf-8 buffer into molecule `vector<byte>`.
 */
export const StringCodec = createBytesCodec<string>({
  pack: (str) => new TextEncoder().encode(str),
  unpack: (bytes) => new TextDecoder().decode(bytes),
});
/**
 * An alias of {@link StringCodec}.
 *
 * Use StringCodec to avoid name conflict with the builtin String class.
 * @experimental
 */
export const String = StringCodec;

/** @alpha the fields are not finalized in this strcutre */
export const ScriptInfo = table(
  {
    name: StringCodec,
    url: StringCodec,
    scriptHash: Byte32,
    schema: StringCodec,
    messageType: StringCodec,
  },
  ["name", "url", "scriptHash", "schema", "messageType"],
);

export const ScriptInfoVec = vector(ScriptInfo);

export const ResolvedInputs = table(
  {
    outputs: CellOutputVec,
    outputsData: BytesVec,
  },
  ["outputs", "outputsData"],
);

export type TransactionUnpackResult = UnpackResult<
  typeof blockchain.Transaction
>;
export type TransactionPackParam =
  | PackParam<typeof blockchain.Transaction>
  | TransactionUnpackResult;

type TransactionPackFunction = (
  unpacked: TransactionPackParam,
) => PackResult<typeof blockchain.Transaction>;

// Make life easier by allowing packing the unpack result.
export const Transaction = createBytesCodec({
  pack: blockchain.Transaction.pack as unknown as TransactionPackFunction,
  unpack: blockchain.Transaction.unpack,
});

export const BuildingPacketV1 = table(
  {
    message: Message,
    payload: Transaction,
    resolvedInputs: ResolvedInputs,
    changeOutput: Uint32Opt,
    scriptInfos: ScriptInfoVec,
    lockActions: ActionVec,
  },
  [
    "message",
    "payload",
    "resolvedInputs",
    "changeOutput",
    "scriptInfos",
    "lockActions",
  ],
);

export const BuildingPacket = union({ BuildingPacketV1 }, ["BuildingPacketV1"]);

export type ScriptInfoUnpackResult = UnpackResult<typeof ScriptInfo>;
export type ResolvedInputsUnpackResult = UnpackResult<typeof ResolvedInputs>;
export type BuildingPacketV1UnpackResult = UnpackResult<
  typeof BuildingPacketV1
>;
export type BuildingPacketUnpackResult = UnpackResult<typeof BuildingPacket>;
export type OutPointUnpackResult = UnpackResult<typeof OutPoint>;
export type CellInputUnpackResult = UnpackResult<typeof CellInput>;
export type ScriptUnpackResult = UnpackResult<typeof Script>;
export type CellOutputUnpackResult = UnpackResult<typeof CellOutput>;
export type CellDepUnpackResult = UnpackResult<typeof CellDep>;

/** Bundle fields for a transaction input */
export interface InputCell {
  cellInput: CellInputUnpackResult;
  cellOutput: CellOutputUnpackResult;
  data: string;
}
/** Bundle fields for a transaction output */
export interface OutputCell {
  cellOutput: CellOutputUnpackResult;
  data: string;
}
export type Cell = InputCell | OutputCell;

export function getInputCell(
  buildingPacket: BuildingPacketUnpackResult,
  index: number,
): InputCell | undefined {
  const result = {
    cellInput: buildingPacket.value.payload.inputs[index],
    cellOutput: buildingPacket.value.resolvedInputs.outputs[index],
    data: buildingPacket.value.resolvedInputs.outputsData[index],
  };
  if (
    result.cellInput !== undefined &&
    result.cellOutput !== undefined &&
    result.data !== undefined
  ) {
    return result as InputCell;
  }
}

export function getOutputCell(
  buildingPacket: BuildingPacketUnpackResult,
  index: number,
): OutputCell | undefined {
  const result = {
    cellOutput: buildingPacket.value.payload.outputs[index],
    data: buildingPacket.value.payload.outputsData[index],
  };
  if (result.cellOutput !== undefined && result.data !== undefined) {
    return result as OutputCell;
  }
}

export default BuildingPacket;
