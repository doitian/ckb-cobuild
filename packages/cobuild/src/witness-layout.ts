import { blockchain } from "@ckb-lumos/base";
import {
  BytesLike,
  UnpackResult,
  bytes,
  molecule,
  number,
} from "@ckb-lumos/codec";

const { Uint32LE } = number;
const { table, union, vector } = molecule;
const {
  /** @group Molecule Codecs */
  WitnessArgs,
  Bytes,
  Byte32,
} = blockchain;

export { WitnessArgs };

/** @group Molecule Codecs */
export const Action = table(
  {
    scriptInfoHash: Byte32,
    scriptHash: Byte32,
    data: Bytes,
  },
  ["scriptInfoHash", "scriptHash", "data"],
);

/** @group Molecule Codecs */
export const ActionVec = vector(Action);

/** @group Molecule Codecs */
export const Message = table({ actions: ActionVec }, ["actions"]);

/** @group Molecule Codecs */
export const SighashAll = table({ seal: Bytes, message: Message }, [
  "seal",
  "message",
]);

/** @group Molecule Codecs */
export const SighashAllOnly = table({ seal: Bytes }, ["seal"]);

/**
 * Schema TBD
 * @group Molecule Codecs
 * @experimental
 */
export const OtxStart = table({}, []);

/**
 * Schema TBD
 * @group Molecule Codecs
 * @experimental
 */
export const Otx = table({}, []);

export const WitnessLayoutTags = {
  SighashAll: 4278190081,
  SighashAllOnly: 4278190082,
  Otx: 4278190083,
  OtxStart: 4278190084,
};
export type WitnessLayoutTagNames = keyof typeof WitnessLayoutTags;
/** Minimal union tag for {@link WitnessLayout}. */
export const MinWitnessLayoutTag = WitnessLayoutTags.SighashAll;
/** @group Molecule Codecs */
export const WitnessLayout = union(
  { SighashAll, SighashAllOnly, Otx, OtxStart },
  WitnessLayoutTags,
);

/** @group Molecule Unpack Result */
export type ActionUnpackResult = UnpackResult<typeof Action>;
/** @group Molecule Unpack Result */
export type MessageUnpackResult = UnpackResult<typeof Message>;
/** @group Molecule Unpack Result */
export type SighashAllUnpackResult = UnpackResult<typeof SighashAll>;
/** @group Molecule Unpack Result */
export type SighashAllOnlyUnpackResult = UnpackResult<typeof SighashAllOnly>;
/** @group Molecule Unpack Result */
export type WitnessLayoutUnpackResult = UnpackResult<typeof WitnessLayout>;
/** @group Molecule Unpack Result */
export type WitnessArgsUnpackResult = UnpackResult<typeof WitnessArgs>;

/**
 * Parse the witness type from the first 4 bytes.
 *
 * If the first 4 bytes as a little-endian uint32 is greater than or equal to
 * {@link MinWitnessLayoutTag}, it will be parsed as WitnessLayout. Otherwise it is considered as
 * WitnessArgs.
 *
 * @returns "WitnessArgs" for WitnessArgs, or a variant name of WitnessLayout.
 * @throws Error if the witness is neither WitnessArgs nor WitnessLayout buffer.
 * @see {@link tryParseWitness}
 */
export function parseWitnessType(
  witness: BytesLike | null | undefined,
): "WitnessArgs" | WitnessLayoutTagNames {
  const buf = bytes.bytify(witness ?? []);
  if (buf.length > 4) {
    const tagNumber = Uint32LE.unpack(buf.slice(0, 4));
    if (tagNumber >= MinWitnessLayoutTag) {
      for (const [name, number] of Object.entries(WitnessLayoutTags)) {
        if (tagNumber == number) {
          return name as WitnessLayoutTagNames;
        }
      }
    } else {
      return "WitnessArgs";
    }
  }

  throw new Error("Unknown witness format");
}

export type ParseWitnessResult =
  | WitnessLayoutUnpackResult
  | { type: "WitnessArgs"; value: WitnessArgsUnpackResult };

/**
 * Try to parse the witness as WitnessLayout or WitnessArgs.
 *
 * If the first 4 bytes as a little-endian uint32 is greater than or equal to
 * {@link MinWitnessLayoutTag}, it will be parsed as WitnessLayout. Otherwise it is considered as
 * WitnessArgs.
 *
 * @param witness - The witness bytes
 * @returns Unpacked WitnessArgs or WitnessLayout
 * @throws Error if the witness is neither WitnessArgs nor WitnessLayout buffer.
 * @see {@link parseWitnessType}
 */
export function tryParseWitness(
  witness: BytesLike | null | undefined,
): ParseWitnessResult {
  const buf = bytes.bytify(witness ?? []);
  if (buf.length > 4) {
    const typeIndex = Uint32LE.unpack(buf.slice(0, 4));
    try {
      if (typeIndex >= MinWitnessLayoutTag) {
        return WitnessLayout.unpack(buf);
      } else {
        return {
          type: "WitnessArgs",
          value: WitnessArgs.unpack(buf),
        };
      }
    } catch (_err) {
      // passthrough
    }
  }

  throw new Error("Unknown witness format");
}

export default WitnessLayout;
