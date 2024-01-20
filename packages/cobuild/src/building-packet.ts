import { blockchain } from "@ckb-lumos/base";
import {
  PackParam,
  PackResult,
  UnpackResult,
  createBytesCodec,
  molecule,
} from "@ckb-lumos/codec";
import { ActionVec, Message } from "./witness-layout";
import {
  Byte32,
  BytesVec,
  CellInput,
  CellOutput,
  CellOutputVec,
  Uint32LE,
} from "./builtins";

const { option, table, vector, union } = molecule;

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
 * @alpha The fields are not finalized in this structure
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
export type Transaction = UnpackResult<typeof blockchain.Transaction>;
type TransactionPackParam =
  | PackParam<typeof blockchain.Transaction>
  | Transaction;

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
export type Uint32Opt = UnpackResult<typeof Uint32Opt>;
/** @group Molecule Unpack Result */
export type ScriptInfo = UnpackResult<typeof ScriptInfo>;
/** @group Molecule Unpack Result */
export type ScriptInfoVec = UnpackResult<typeof ScriptInfoVec>;
/** @group Molecule Unpack Result */
export type ResolvedInputs = UnpackResult<typeof ResolvedInputs>;
/** @group Molecule Unpack Result */
export type BuildingPacketV1 = UnpackResult<typeof BuildingPacketV1>;
/** @group Molecule Unpack Result */
export type BuildingPacket = UnpackResult<typeof BuildingPacket>;

/** Bundle fields for a transaction input */
export interface InputCell {
  cellInput: CellInput;
  cellOutput: CellOutput;
  data: string;
}
/** Bundle fields for a transaction output */
export interface OutputCell {
  cellOutput: CellOutput;
  data: string;
}
export type Cell = InputCell | OutputCell;

/** Get transaction input from three parallel lists. */
export function getInputCell(
  buildingPacket: BuildingPacket,
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
  buildingPacket: BuildingPacket,
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
