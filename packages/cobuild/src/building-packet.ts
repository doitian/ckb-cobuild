import { blockchain } from "@ckb-lumos/base";
import {
  UnpackResult,
  createBytesCodec,
  molecule,
  number,
} from "@ckb-lumos/codec";

import { Message, ActionVec } from "./witness-layout";

const { Uint32LE } = number;
const { option, table, vector, union } = molecule;
const { Bytes, Byte32, BytesVec, CellOutputVec } = blockchain;

export { Uint32LE, Bytes, Byte32, BytesVec, CellOutputVec };

export const Uint32Opt = option(Uint32LE);

export const String = Bytes;

export const ScriptInfo = table(
  {
    name: String,
    url: String,
    scriptHash: Byte32,
    schema: String,
    messageType: String,
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
// Make life easier by using the same type for the pack parameter and the unpack result.
export const Transaction = createBytesCodec({
  pack: (unpacked: TransactionUnpackResult) =>
    blockchain.Transaction.pack(unpacked as any),
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

export default BuildingPacket;
