import { blockchain } from "@ckb-lumos/base";
import { number } from "@ckb-lumos/codec";

export * from "./building-packet";
export * from "./witness-layout";
export * as factory from "./factory";

const { Uint32LE } = number;
const { Bytes, Byte32, BytesVec, CellOutputVec } = blockchain;
export { Uint32LE, Bytes, Byte32, BytesVec, CellOutputVec };
