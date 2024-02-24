/**
 * Number Codecs of 64-bit integers using the native bigint.
 * @module
 * @example
 * ```ts
 * import { Uint64 } from "@ckb-lumos/molecule-bigint";
 * const buffer = Uint64.pack(1n);
 * console.log(buffer);
 * // => [1, 0, 0, 0, 0, 0, 0, 0],
 * console.log(Uint64.unpack(buffer));
 * // => 1n
 * ```
 */
import { NumberCodec } from "@ckb-cobuild/molecule";

export function createBigUint64Codec(
  name: string,
  littleEndian: boolean,
): NumberCodec<bigint> {
  return new NumberCodec(name, 8, {
    checkNumber(value) {
      return value >= 0n && value <= 0xffffffffffffffffn;
    },
    packNumberTo(value, buffer) {
      const view = new DataView(buffer.buffer, buffer.byteOffset);
      view.setBigUint64(0, value, littleEndian);
    },
    unpackNumber(buffer) {
      const view = new DataView(buffer.buffer, buffer.byteOffset);
      return view.getBigUint64(0, littleEndian);
    },
  });
}
export const Uint64 = createBigUint64Codec("Uint64", true);

export function createBigInt64Codec(
  name: string,
  littleEndian: boolean,
): NumberCodec<bigint> {
  return new NumberCodec(name, 8, {
    checkNumber(value) {
      return value >= -0x8000000000000000n && value <= 0x7fffffffffffffffn;
    },
    packNumberTo(value, buffer) {
      const view = new DataView(buffer.buffer, buffer.byteOffset);
      view.setBigInt64(0, value, littleEndian);
    },
    unpackNumber(buffer) {
      const view = new DataView(buffer.buffer, buffer.byteOffset);
      return view.getBigInt64(0, littleEndian);
    },
  });
}
export const Int64 = createBigInt64Codec("Int64", true);
