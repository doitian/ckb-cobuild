/**
 * Codec for CKB [blockchain.mol](https://github.com/nervosnetwork/ckb/blob/develop/util/gen-types/schemas/blockchain.mol).
 *
 * Pay attention to the field case convention. It uses snake case as in the mol files and the Rust SDK.
 * @module
 */

import mol from "@ckb-cobuild/molecule";
import * as JSBICodecs from "@ckb-cobuild/molecule-jsbi";
import {
  createNumberJsonCodec,
  createUint8ArrayJsonCodec,
  createJSBIJsonCodec,
} from "@ckb-cobuild/molecule-json";

export const Uint32 = createNumberJsonCodec(mol.Uint32);
export const Uint64 = createJSBIJsonCodec(JSBICodecs.Uint64);
export const Uint128 = createJSBIJsonCodec(JSBICodecs.Uint128);
export const Byte32 = createUint8ArrayJsonCodec(mol.byteArray("Byte32", 32));
export const Uint256 = createJSBIJsonCodec(JSBICodecs.Uint256);

export const Bytes = createUint8ArrayJsonCodec(mol.byteFixvec("Bytes"));
export const BytesOpt = mol.option("BytesOpt", Bytes);
export const BytesOptVec = mol.vector("BytesOptVec", BytesOpt);
export const BytesVec = mol.vector("BytesVec", Bytes);
export const Byte32Vec = mol.vector("Byte32Vec", Byte32);

export enum HashTypeEnum {
  data = 0,
  type = 1,
  data1 = 2,
  data2 = 4,
}
export type HashType = keyof typeof HashTypeEnum;
export const HashTypeCodec = mol.byte.around({
  safeParse: (input: HashType | HashTypeEnum) => {
    if (input in HashTypeEnum) {
      return mol.parseSuccess(
        (typeof input === "string" ? input : HashTypeEnum[input]) as HashType,
      );
    }
    return mol.parseError(`Invalid HashType enum variant: ${input}`);
  },
  willPack: (input: HashType) => HashTypeEnum[input] as number,
  didUnpack: (value: number) => HashTypeEnum[value] as HashType,
});

export const Script = mol.table(
  "Script",
  {
    code_hash: Byte32,
    hash_type: HashTypeCodec,
    args: Bytes,
  },
  ["code_hash", "hash_type", "args"],
);
export const ScriptOpt = mol.option("ScriptOpt", Script);

export const ProposalShortId = createUint8ArrayJsonCodec(
  mol.byteArray("ProposalShortId", 10),
);
export const ProposalShortIdVec = mol.vector(
  "ProposalShortIdVec",
  ProposalShortId,
);

export const OutPoint = mol.struct(
  "OutPoint",
  {
    tx_hash: Byte32,
    index: Uint32,
  },
  ["tx_hash", "index"],
);

export const CellInput = mol.struct(
  "CellInput",
  {
    since: Uint64,
    previous_output: OutPoint,
  },
  ["since", "previous_output"],
);
export const CellInputVec = mol.vector("CellInputVec", CellInput);

export const CellOutput = mol.table(
  "CellOutput",
  {
    capacity: Uint64,
    lock: Script,
    type: ScriptOpt,
  },
  ["capacity", "lock", "type"],
);
export const CellOutputVec = mol.vector("CellOutputVec", CellOutput);

export enum DepTypeEnum {
  code = 0,
  dep_group = 1,
}
export type DepType = keyof typeof DepTypeEnum;
export const DepTypeCodec = mol.byte.around({
  safeParse: (input: DepType | DepTypeEnum) => {
    if (input in DepTypeEnum) {
      return mol.parseSuccess(
        (typeof input === "string" ? input : DepTypeEnum[input]) as DepType,
      );
    }
    return mol.parseError(`Invalid DepType enum variant: ${input}`);
  },
  willPack: (input: DepType) => DepTypeEnum[input] as number,
  didUnpack: (value: number) => DepTypeEnum[value] as DepType,
});

export const CellDep = mol.struct(
  "CellDep",
  {
    out_point: OutPoint,
    dep_type: DepTypeCodec,
  },
  ["out_point", "dep_type"],
);
export const CellDepVec = mol.vector("CellDepVec", CellDep);

export const RawTransaction = mol.table(
  "RawTransaction",
  {
    version: Uint32,
    cell_deps: CellDepVec,
    header_deps: Byte32Vec,
    inputs: CellInputVec,
    outputs: CellOutputVec,
    outputs_data: BytesVec,
  },
  ["version", "cell_deps", "header_deps", "inputs", "outputs", "outputs_data"],
);

export const Transaction = mol.table(
  "Transaction",
  {
    raw: RawTransaction,
    witnesses: BytesVec,
  },
  ["raw", "witnesses"],
);

export const TransactionVec = mol.vector("TransactionVec", Transaction);

export const RawHeader = mol.struct(
  "RawHeader",
  {
    version: Uint32,
    compact_target: Uint32,
    timestamp: Uint64,
    number: Uint64,
    epoch: Uint64,
    parent_hash: Byte32,
    transactions_root: Byte32,
    proposals_hash: Byte32,
    extra_hash: Byte32,
    dao: Byte32,
  },
  [
    "version",
    "compact_target",
    "timestamp",
    "number",
    "epoch",
    "parent_hash",
    "transactions_root",
    "proposals_hash",
    "extra_hash",
    "dao",
  ],
);

export const Header = mol.struct(
  "Header",
  {
    raw: RawHeader,
    nonce: Uint128,
  },
  ["raw", "nonce"],
);

export const UncleBlock = mol.table(
  "UncleBlock",
  {
    header: Header,
    proposals: ProposalShortIdVec,
  },
  ["header", "proposals"],
);
export const UncleBlockVec = mol.vector("UncleBlockVec", UncleBlock);

export const Block = mol.table(
  "Block",
  {
    header: Header,
    uncles: UncleBlockVec,
    transactions: TransactionVec,
    proposals: ProposalShortIdVec,
  },
  ["header", "uncles", "transactions", "proposals"],
);

export const BlockV1 = mol.table(
  "BlockV1",
  {
    header: Header,
    uncles: UncleBlockVec,
    transactions: TransactionVec,
    proposals: ProposalShortIdVec,
    extension: Bytes,
  },
  ["header", "uncles", "transactions", "proposals", "extension"],
);

export const WitnessArgs = mol.table(
  "WitnessArgs",
  {
    lock: BytesOpt,
    input_type: BytesOpt,
    output_type: BytesOpt,
  },
  ["lock", "input_type", "output_type"],
);
