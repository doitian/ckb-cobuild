/**
 * Number Codecs of integers using JSBI.
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
import { NumberCodec, NumberCodecSpec } from "@ckb-cobuild/molecule";

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

export function packUintN(
  byteLength: number,
  value: bigint,
  buffer: Uint8Array,
  littleEndian: boolean,
) {
  const view = new DataView(buffer.buffer, buffer.byteOffset);

  let remainingBytes = byteLength;
  let remainingValue = BigInt.asUintN(byteLength << 3, value);
  let [offset, step] = littleEndian ? [0, 4] : [byteLength - 4, -4];

  while (remainingBytes >= 4) {
    view.setUint32(offset, Number(remainingValue & 0xffffffffn), littleEndian);

    offset += step;
    remainingBytes -= 4;
    remainingValue = remainingValue >> 32n;
  }

  step = littleEndian ? 1 : -1;
  if (!littleEndian) {
    offset += 3;
  }

  while (remainingBytes > 0) {
    view.setUint8(offset, Number(remainingValue & 0xffn));

    offset += step;
    remainingBytes -= 1;
    remainingValue = remainingValue >> 8n;
  }
}

export function unpackUintN(
  byteLength: number,
  buffer: Uint8Array,
  littleEndian: boolean,
): bigint {
  const view = new DataView(buffer.buffer, buffer.byteOffset);

  let remainingBytes = byteLength;
  let value = 0n;
  let [offset, step] = littleEndian ? [byteLength - 4, -4] : [0, 4];

  while (remainingBytes >= 4) {
    if (value !== 0n) {
      value = value << 32n;
    }
    value += BigInt(view.getUint32(offset, littleEndian));

    offset += step;
    remainingBytes -= 4;
  }

  step = littleEndian ? -1 : 1;
  if (littleEndian) {
    offset += 3;
  }

  while (remainingBytes > 0) {
    value = value << 8n;
    value += BigInt(view.getUint8(offset));

    offset += step;
    remainingBytes -= 1;
  }

  return value;
}

export function createBigUintNCodecSpec(
  fixedByteLength: number,
  littleEndian: boolean,
): NumberCodecSpec<bigint> {
  return {
    checkNumber(value) {
      return BigInt.asUintN(fixedByteLength << 3, value) === value;
    },
    packNumberTo(value, buffer) {
      return packUintN(fixedByteLength, value, buffer, littleEndian);
    },
    unpackNumber(buffer) {
      return unpackUintN(fixedByteLength, buffer, littleEndian);
    },
  };
}

export function createBigUintNCodec(
  name: string,
  fixedByteLength: number,
  littleEndian: boolean,
): NumberCodec<bigint> {
  return new NumberCodec<bigint>(
    name,
    fixedByteLength,
    createBigUintNCodecSpec(fixedByteLength, littleEndian),
  );
}
export const Uint128 = createBigUintNCodec("Uint128", 16, true);
export const Uint256 = createBigUintNCodec("Uint256", 32, true);

export function createBigIntNCodec(
  name: string,
  fixedByteLength: number,
  littleEndian: boolean,
): NumberCodec<bigint> {
  const spec = createBigUintNCodecSpec(fixedByteLength, littleEndian);
  const bitLength = fixedByteLength << 3;
  return new NumberCodec<bigint>(name, fixedByteLength, {
    checkNumber(value) {
      return BigInt.asIntN(bitLength, value) === value;
    },
    packNumberTo(value, buffer) {
      return spec.packNumberTo(BigInt.asUintN(bitLength, value), buffer);
    },
    unpackNumber(buffer) {
      return BigInt.asIntN(bitLength, spec.unpackNumber(buffer));
    },
  });
}
export const Int128 = createBigIntNCodec("Int128", 16, true);
export const Int256 = createBigIntNCodec("Int256", 32, true);
