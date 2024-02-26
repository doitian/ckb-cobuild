import { bech32m } from "bech32";

enum HashTypeEnum {
  data = 0,
  type = 1,
  data1 = 2,
  data2 = 4,
}

/**
 * Script type which is compatible with `@ckb-cobuild/ckb-molecule-codecs` Script.
 */
export interface Script {
  code_hash: Uint8Array;
  hash_type: "data" | "type" | "data1" | "data2";
  args: Uint8Array;
}

/**
 * Address prefix to ditinguish the mainnet network.
 * - `ckb`: mainnet
 * - `ckt`: other
 */
export type CkbAddressPrefix = "ckb" | "ckt";

const BYTE32_BYTE_LENGTH = 32;
const BECH32_LIMIT = 1023;
const ADDRESS_FORMAT_FULL = 0x00;

export function encodeCkbAddress(
  script: Script,
  prefix: CkbAddressPrefix,
): string {
  if (prefix !== "ckb" && prefix !== "ckt") {
    throw new TypeError(`Invalid prefix ${prefix}`);
  }
  if (script.code_hash.length !== BYTE32_BYTE_LENGTH) {
    throw new TypeError(`Invalid code hash length ${script.code_hash.length}`);
  }
  if (
    typeof script.hash_type !== "string" ||
    !(script.hash_type in HashTypeEnum)
  ) {
    throw new TypeError(`Invalid hash type ${script.hash_type}`);
  }

  const buf = new Uint8Array(script.args.length + BYTE32_BYTE_LENGTH + 2);
  buf[0] = ADDRESS_FORMAT_FULL;
  buf.set(script.code_hash, 1);
  buf[BYTE32_BYTE_LENGTH + 1] = HashTypeEnum[script.hash_type];
  buf.set(script.args, BYTE32_BYTE_LENGTH + 2);

  return bech32m.encode(prefix, bech32m.toWords(buf), BECH32_LIMIT);
}

export function decodeCkbAddress(address: string): Script {
  // https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki#bech32m
  const { words, prefix } = bech32m.decode(address, BECH32_LIMIT);
  if (prefix !== "ckb" && prefix !== "ckt") {
    throw new TypeError(`Invalid prefix ${prefix}`);
  }

  const buf = bech32m.fromWords(words);
  if (buf.length < BYTE32_BYTE_LENGTH + 2) {
    throw new TypeError("Invalid payload length, too short!");
  }
  if (buf[0] !== ADDRESS_FORMAT_FULL) {
    throw new TypeError("Invalid address format type");
  }

  const hashTypeNumber = buf[BYTE32_BYTE_LENGTH + 1]!;
  if (!(hashTypeNumber in HashTypeEnum)) {
    throw new TypeError(`Invalid hash type ${hashTypeNumber}`);
  }

  return {
    code_hash: Uint8Array.from(buf.slice(1, BYTE32_BYTE_LENGTH + 1)),
    hash_type: HashTypeEnum[hashTypeNumber]! as Script["hash_type"],
    args: Uint8Array.from(buf.slice(BYTE32_BYTE_LENGTH + 2)),
  };
}
