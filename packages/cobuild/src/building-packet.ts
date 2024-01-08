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

/** @group Molecule Codecs */
export const Uint32Opt = option(Uint32LE);

/**
 * A codec which packs JavaScript string as utf-8 buffer into molecule `vector<byte>`.
 *
 * Note that this codec uses the TextEncoder/TextDecoder API which [is available in most browsers](https://caniuse.com/textencoder).
 * To support older browsers, consider a polyfill like [fast-text-encoding](https://github.com/samthor/fast-text-encoding)
 * @group Molecule Codecs
 */
export const StringCodec = createBytesCodec<string>({
  pack: (str) => new TextEncoder().encode(str),
  unpack: (bytes) => new TextDecoder().decode(bytes),
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
 * @alpha The fields are not finalized in this strcutre
 * @group Molecule Codecs
 */
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

/** @group Molecule Codecs */
export const ScriptInfoVec = vector(ScriptInfo);

/** @group Molecule Codecs */
export const ResolvedInputs = table(
  {
    outputs: CellOutputVec,
    outputsData: BytesVec,
  },
  ["outputs", "outputsData"],
);

/** @group Molecule Unpack Result */
export type TransactionUnpackResult = UnpackResult<
  typeof blockchain.Transaction
>;
type TransactionPackParam =
  | PackParam<typeof blockchain.Transaction>
  | TransactionUnpackResult;

type TransactionPackFunction = (
  unpacked: TransactionPackParam,
) => PackResult<typeof blockchain.Transaction>;

/**
 * @group Molecule Codecs
 * @privateRemarks
 * Make life easier by allowing packing the unpack result.
 */
export const Transaction = createBytesCodec({
  pack: blockchain.Transaction.pack as unknown as TransactionPackFunction,
  unpack: blockchain.Transaction.unpack,
});

/** @group Molecule Codecs */
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

/** @group Molecule Codecs */
export const BuildingPacket = union({ BuildingPacketV1 }, ["BuildingPacketV1"]);

/** @group Molecule Unpack Result */
export type ScriptInfoUnpackResult = UnpackResult<typeof ScriptInfo>;
/** @group Molecule Unpack Result */
export type ResolvedInputsUnpackResult = UnpackResult<typeof ResolvedInputs>;
/** @group Molecule Unpack Result */
export type BuildingPacketV1UnpackResult = UnpackResult<
  typeof BuildingPacketV1
>;
/** @group Molecule Unpack Result */
export type BuildingPacketUnpackResult = UnpackResult<typeof BuildingPacket>;
/** @group Molecule Unpack Result */
export type OutPointUnpackResult = UnpackResult<typeof OutPoint>;
/** @group Molecule Unpack Result */
export type CellInputUnpackResult = UnpackResult<typeof CellInput>;
/** @group Molecule Unpack Result */
export type ScriptUnpackResult = UnpackResult<typeof Script>;
/** @group Molecule Unpack Result */
export type CellOutputUnpackResult = UnpackResult<typeof CellOutput>;
/** @group Molecule Unpack Result */
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

/** Get transaction input from three parallel lists. */
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

/** Get transaction output from three parallel lists. */
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
