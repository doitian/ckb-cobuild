/**
 * Codec for CKB [blockchain.mol](https://github.com/nervosnetwork/ckb/blob/develop/util/gen-types/schemas/blockchain.mol).
 *
 * Pay attention to the field case convention. It uses snake case as in the mol files and the Rust SDK.
 * @module
 */

import mol from "@ckb-cobuild/molecule";
import ckbHasher from "@ckb-cobuild/ckb-hasher";

export const Uint32 = mol.createNumberJsonCodec(mol.Uint32);
export const Uint64 = mol.createBigIntJsonCodec(mol.Uint64);
export const Uint128 = mol.createBigIntJsonCodec(mol.Uint128);
export const Uint256 = mol.createBigIntJsonCodec(mol.Uint256);

export const Byte32 = mol.createUint8ArrayJsonCodec(mol.Byte32);

export const Bytes = mol.createUint8ArrayJsonCodec(mol.Bytes);
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

export const ProposalShortId = mol.createUint8ArrayJsonCodec(
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

export type Transaction = mol.Infer<typeof RawTransaction> & {
  hash: mol.Infer<typeof Byte32>;
  witnesses: mol.Infer<typeof BytesVec>;
};
type TransactionParseInput = mol.InferParseInput<typeof RawTransaction> & {
  hash: mol.InferParseInput<typeof Byte32>;
  witnesses: mol.InferParseInput<typeof BytesVec>;
};

function transactionRawSubarray(buffer: Uint8Array) {
  const view = new DataView(buffer.buffer, buffer.byteOffset);
  const beginPos = view.getUint32(4, true);
  const endPos = view.getUint32(8, true);
  return buffer.subarray(beginPos, endPos);
}

export const Transaction = mol
  .table(
    "Transaction",
    {
      raw: RawTransaction,
      witnesses: BytesVec,
    },
    ["raw", "witnesses"],
  )
  .around({
    safeParse: (input: TransactionParseInput) => {
      const { hash, witnesses, ...raw } = input;
      return mol.parseSuccessThen(RawTransaction.safeParse(raw), (raw) =>
        mol.parseSuccessThen(BytesVec.safeParse(witnesses), (witnesses) =>
          mol.parseSuccessThen(Byte32.safeParse(hash), (hash) =>
            mol.parseSuccess({ hash, witnesses, ...raw } as Transaction),
          ),
        ),
      );
    },
    willPack: (input: Transaction) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hash, witnesses, ...raw } = input;
      return {
        raw,
        witnesses,
      };
    },
    didUnpack: (value, buffer) => {
      const { raw, witnesses } = value;
      return {
        ...raw,
        witnesses,
        hash: ckbHasher().update(transactionRawSubarray(buffer)).digest(),
      };
    },
  });

export function getRawTransaction(
  input: Transaction,
): mol.Infer<typeof RawTransaction> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hash, witnesses, ...raw } = input;
  return raw;
}

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

export type Header = mol.Infer<typeof RawHeader> & {
  hash: mol.Infer<typeof Byte32>;
  nonce: mol.Infer<typeof Uint128>;
};
type HeaderParseInput = mol.InferParseInput<typeof RawHeader> & {
  hash: mol.InferParseInput<typeof Byte32>;
  nonce: mol.InferParseInput<typeof Uint128>;
};

export const Header = mol
  .struct(
    "Header",
    {
      raw: RawHeader,
      nonce: Uint128,
    },
    ["raw", "nonce"],
  )
  .around({
    safeParse: (input: HeaderParseInput) => {
      const { hash, nonce, ...raw } = input;
      return mol.parseSuccessThen(RawHeader.safeParse(raw), (raw) =>
        mol.parseSuccessThen(Uint128.safeParse(nonce), (nonce) =>
          mol.parseSuccessThen(Byte32.safeParse(hash), (hash) =>
            mol.parseSuccess({ hash, nonce, ...raw } as Header),
          ),
        ),
      );
    },
    willPack: (input: Header) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hash, nonce, ...raw } = input;
      return {
        raw,
        nonce,
      };
    },
    didUnpack: (value, buffer) => {
      const { raw, nonce } = value;
      return {
        ...raw,
        nonce,
        hash: ckbHasher().update(buffer).digest(),
      };
    },
  });

export function getRawHeader(input: Header): mol.Infer<typeof RawHeader> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hash, nonce, ...raw } = input;
  return raw;
}

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

export type Uint32 = mol.Infer<typeof Uint32>;
export type Uint64 = mol.Infer<typeof Uint64>;
export type Uint128 = mol.Infer<typeof Uint128>;
export type Byte32 = mol.Infer<typeof Byte32>;
export type Uint256 = mol.Infer<typeof Uint256>;
export type Bytes = mol.Infer<typeof Bytes>;
export type BytesOpt = mol.Infer<typeof BytesOpt>;
export type BytesOptVec = mol.Infer<typeof BytesOptVec>;
export type BytesVec = mol.Infer<typeof BytesVec>;
export type Byte32Vec = mol.Infer<typeof Byte32Vec>;
export type HashTypeCodec = mol.Infer<typeof HashTypeCodec>;
export type Script = mol.Infer<typeof Script>;
export type ScriptOpt = mol.Infer<typeof ScriptOpt>;
export type ProposalShortId = mol.Infer<typeof ProposalShortId>;
export type ProposalShortIdVec = mol.Infer<typeof ProposalShortIdVec>;
export type OutPoint = mol.Infer<typeof OutPoint>;
export type CellInput = mol.Infer<typeof CellInput>;
export type CellInputVec = mol.Infer<typeof CellInputVec>;
export type CellOutput = mol.Infer<typeof CellOutput>;
export type CellOutputVec = mol.Infer<typeof CellOutputVec>;
export type DepTypeCodec = mol.Infer<typeof DepTypeCodec>;
export type CellDep = mol.Infer<typeof CellDep>;
export type CellDepVec = mol.Infer<typeof CellDepVec>;
export type RawTransaction = mol.Infer<typeof RawTransaction>;
export type TransactionVec = mol.Infer<typeof TransactionVec>;
export type RawHeader = mol.Infer<typeof RawHeader>;
export type UncleBlock = mol.Infer<typeof UncleBlock>;
export type UncleBlockVec = mol.Infer<typeof UncleBlockVec>;
export type Block = mol.Infer<typeof Block>;
export type BlockV1 = mol.Infer<typeof BlockV1>;
export type WitnessArgs = mol.Infer<typeof WitnessArgs>;
