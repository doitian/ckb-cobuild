/**
 * Builtin molecule codecs from `@ckb-lumos/codec`.
 * @module
 */
import { blockchain } from "@ckb-lumos/base";
import { number, UnpackResult } from "@ckb-lumos/codec";

/** @group Molecule Codecs */
export const Uint32LE = number.Uint32LE;
/** @group Molecule Codecs */
export const Byte32 = blockchain.Byte32;
/** @group Molecule Codecs */
export const Bytes = blockchain.Bytes;
/** @group Molecule Codecs */
export const BytesVec = blockchain.BytesVec;
/** @group Molecule Codecs */
export const CellOutputVec = blockchain.CellOutputVec;
/** @group Molecule Codecs */
export const OutPoint = blockchain.OutPoint;
/** @group Molecule Codecs */
export const CellInput = blockchain.CellInput;
/** @group Molecule Codecs */
export const Script = blockchain.Script;
/** @group Molecule Codecs */
export const CellOutput = blockchain.CellOutput;
/** @group Molecule Codecs */
export const CellDep = blockchain.CellDep;
/** @group Molecule Codecs */
export const WitnessArgs = blockchain.WitnessArgs;

/** @group Molecule Unpack Result */
export type Uint32LE = UnpackResult<typeof Uint32LE>;
/** @group Molecule Unpack Result */
export type Byte32 = UnpackResult<typeof Byte32>;
/** @group Molecule Unpack Result */
export type Bytes = UnpackResult<typeof Bytes>;
/** @group Molecule Unpack Result */
export type BytesVec = UnpackResult<typeof BytesVec>;
/** @group Molecule Unpack Result */
export type CellOutputVec = UnpackResult<typeof CellOutputVec>;
/** @group Molecule Unpack Result */
export type OutPoint = UnpackResult<typeof OutPoint>;
/** @group Molecule Unpack Result */
export type CellInput = UnpackResult<typeof CellInput>;
/** @group Molecule Unpack Result */
export type Script = UnpackResult<typeof Script>;
/** @group Molecule Unpack Result */
export type CellOutput = UnpackResult<typeof CellOutput>;
/** @group Molecule Unpack Result */
export type CellDep = UnpackResult<typeof CellDep>;
/** @group Molecule Unpack Result */
export type WitnessArgs = UnpackResult<typeof WitnessArgs>;
