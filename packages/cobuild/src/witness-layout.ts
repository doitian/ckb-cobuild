import { Byte32, Bytes, WitnessArgs } from "@ckb-cobuild/ckb-molecule-codecs";
import mol from "@ckb-cobuild/molecule";

/** @group Molecule Codecs */
export const Action = mol.table(
  "Action",
  {
    script_info_hash: Byte32,
    script_hash: Byte32,
    data: Bytes,
  },
  ["script_info_hash", "script_hash", "data"],
);

/** @group Molecule Codecs */
export const ActionVec = mol.vector("ActionVec", Action);

/** @group Molecule Codecs */
export const Message = mol.table("Message", { actions: ActionVec }, [
  "actions",
]);

/** @group Molecule Codecs */
export const SighashAll = mol.table(
  "SighashAll",
  { seal: Bytes, message: Message },
  ["seal", "message"],
);

/** @group Molecule Codecs */
export const SighashAllOnly = mol.table("SighashAllOnly", { seal: Bytes }, [
  "seal",
]);

/**
 * Schema TBD
 * @group Molecule Codecs
 * @experimental
 */
export const OtxStart = mol.table("OtxStart", {}, []);

/**
 * Schema TBD
 * @group Molecule Codecs
 * @experimental
 */
export const Otx = mol.table("Otx", {}, []);

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
export const WitnessLayout = mol.union(
  "WitnessLayout",
  { SighashAll, SighashAllOnly, Otx, OtxStart },
  WitnessLayoutTags,
);

export type Action = mol.Infer<typeof Action>;
export type ActionVec = mol.Infer<typeof ActionVec>;
export type Message = mol.Infer<typeof Message>;
export type SighashAll = mol.Infer<typeof SighashAll>;
export type SighashAllOnly = mol.Infer<typeof SighashAllOnly>;
export type OtxStart = mol.Infer<typeof OtxStart>;
export type Otx = mol.Infer<typeof Otx>;
export type WitnessLayout = mol.Infer<typeof WitnessLayout>;

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
  witness: Uint8Array | null | undefined,
): "WitnessArgs" | WitnessLayoutTagNames {
  if (witness !== null && witness !== undefined && witness.length > 4) {
    const view = new DataView(witness.buffer, witness.byteOffset);
    const tagNumber = view.getUint32(0, true);
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
  | WitnessLayout
  | { type: "WitnessArgs"; value: WitnessArgs };
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
  witness: Uint8Array | null | undefined,
): ParseWitnessResult {
  if (witness !== null && witness !== undefined && witness.length > 4) {
    const view = new DataView(witness.buffer, witness.byteOffset);
    const typeIndex = view.getUint32(0, true);
    try {
      if (typeIndex >= MinWitnessLayoutTag) {
        return WitnessLayout.unpack(witness);
      } else {
        return {
          type: "WitnessArgs",
          value: WitnessArgs.unpack(witness),
        };
      }
    } catch (_err) {
      // passthrough
    }
  }

  throw new Error("Unknown witness format");
}

export default WitnessLayout;
