import { blockchain } from "@ckb-lumos/base";
import { bytes, molecule, number } from "@ckb-lumos/codec";
const { Uint32LE, Uint32 } = number;
const { option, table, vector, union } = molecule;
const { WitnessArgs, Bytes, Byte32, BytesVec, CellOutputVec, Transaction } =
  blockchain;

export { Uint32, Bytes, Byte32, BytesVec, CellOutputVec, Transaction };

export const Uint32Opt = option(Uint32);

export const String = Bytes;

export const Action = table(
  {
    scriptInfoHash: Byte32,
    scriptHash: Byte32,
    data: Bytes,
  },
  ["scriptInfoHash", "scriptHash", "data"],
);

export const ActionVec = vector(Action);

export const Message = table({ actions: ActionVec }, ["actions"]);

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

export const SighashAll = table({ seal: Bytes, message: Message }, [
  "seal",
  "message",
]);

export const SighashAllOnly = table({ seal: Bytes }, ["seal"]);

// TODO: TBD
export const OtxStart = table({}, []);

// TODO: TBD
export const Otx = table({}, []);

export const WitnessLayoutFieldTags = {
  SighashAll: 4278190081,
  SighashAllOnly: 4278190082,
  Otx: 4278190083,
  OtxStart: 4278190084,
};
export const MinWitnessLayoutFieldTag = WitnessLayoutFieldTags.SighashAll;
export const WitnessLayout = union(
  { SighashAll, SighashAllOnly, Otx, OtxStart },
  WitnessLayoutFieldTags,
);

/**
 * Parse the witness type from the first 4 bytes.
 *
 * Return "WitnessArgs" for WitnessArgs, or a variant name of WitnessLayout.
 *
 * Throw error if the witness is neither WitnessArgs nor WitnessLayout buffer.
 */
export function parseWitnessType(witness) {
  const buf = bytes.bytify(witness ?? []);
  if (buf.length > 4) {
    const typeIndex = Uint32LE.unpack(buf.slice(0, 4));
    if (typeIndex >= MinWitnessLayoutFieldTag) {
      for (const [name, index] of Object.entries(WitnessLayoutFieldTags)) {
        if (index === typeIndex) {
          return name;
        }
      }
    } else {
      return "WitnessArgs";
    }
  }

  throw new Error("Unknown witness format");
}

/**
 * Try to parse the witness as WitnessLayout or WitnessArgs.
 *
 * Return WitnessLayout or {type: "WitnessArgs", value: WitnessArgs}
 */
export function tryParseWitness(witness) {
  const buf = bytes.bytify(witness ?? []);
  if (buf.length > 4) {
    const typeIndex = Uint32LE.unpack(buf.slice(0, 4));
    try {
      if (typeIndex >= MinWitnessLayoutFieldTag) {
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
