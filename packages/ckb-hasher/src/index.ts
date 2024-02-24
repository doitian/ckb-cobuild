import blake2b, { Blake2b } from "blake2b";

export { blake2b };
export type { Blake2b };

export const CKB_HASHER_LENGTH = 32;
// new TextEncoder().encode("ckb-default-hash")
export const CKB_HASHER_PERSONAL = Uint8Array.of(
  99,
  107,
  98,
  45,
  100,
  101,
  102,
  97,
  117,
  108,
  116,
  45,
  104,
  97,
  115,
  104,
);

/**
 * Create a CKB Hasker.
 * @example
 * ```ts
 * import { ckbHasher } from "@ckb-cobuild/ckb-hasher";
 * const hasher = ckbHasher().update(Uint8Array.of(0x12, 0x34));
 * hasher.digest();
 * // => Uint8Array(32) [
 * //   130, 245,  74, 244,  20, 136,   1, 184,
 * //   232, 132, 137,  17, 187, 108, 182, 187,
 * //   242, 111,   0, 171,  38, 231,  81,  92,
 * //   250, 174,  43,  48,   9, 110, 144, 126
 * // ]
 * hasher.digest("hex");
 * // => 82f54af4148801b8e8848911bb6cb6bbf26f00ab26e7515cfaae2b30096e907e
 * ```
 */
export function ckbHasher(): Blake2b {
  return blake2b(CKB_HASHER_LENGTH, undefined, undefined, CKB_HASHER_PERSONAL);
}

export const ckbhasher = ckbHasher;

export default ckbHasher;
