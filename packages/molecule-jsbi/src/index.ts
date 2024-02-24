/**
 * Number Codecs of integers using JSBI.
 * @module
 * @example
 * ```ts
 * import { Uint64 } from "@ckb-cobuild/molecule-jsbi";
 * import JSBI from "jsbi";
 * const buffer = Uint64.pack(JSBI.BigInt(1));
 * console.log(buffer);
 * // => [1, 0, 0, 0, 0, 0, 0, 0],
 * console.log(JSBI.toNumber(Uint64.unpack(buffer)));
 * // => 1
 * ```
 */
import JSBI from "jsbi";
import { NumberCodec, NumberCodecSpec } from "@ckb-cobuild/molecule";

export { JSBI };

/**
 * A wrapper of JSBI.BigInt to support negative hex string.
 */
export function makeJSBI(arg: number | string | boolean | object): JSBI {
  if (typeof arg === "string" && arg.startsWith("-")) {
    return JSBI.unaryMinus(JSBI.BigInt(arg.slice(1)));
  }
  return JSBI.BigInt(arg);
}

const ZERO = JSBI.BigInt(0);
const MIN_BIG_UINT64 = ZERO;
const MAX_BIG_UINT64 = JSBI.BigInt("0xffffffffffffffff");

export function createBigUint64Codec(
  name: string,
  littleEndian: boolean,
): NumberCodec<JSBI> {
  return new NumberCodec(name, 8, {
    checkNumber(value) {
      return (
        value instanceof JSBI &&
        JSBI.greaterThanOrEqual(value, MIN_BIG_UINT64) &&
        JSBI.lessThanOrEqual(value, MAX_BIG_UINT64)
      );
    },
    packNumberTo(value, buffer) {
      const view = new DataView(buffer.buffer, buffer.byteOffset);
      JSBI.DataViewSetBigUint64(view, 0, value, littleEndian);
    },
    unpackNumber(buffer) {
      const view = new DataView(buffer.buffer, buffer.byteOffset);
      return JSBI.DataViewGetBigUint64(view, 0, littleEndian);
    },
  });
}
export const Uint64 = createBigUint64Codec("Uint64", true);

const MIN_BIG_INT64 = JSBI.unaryMinus(JSBI.BigInt("0x8000000000000000"));
const MAX_BIG_INT64 = JSBI.BigInt("0x7fffffffffffffff");

export function createBigInt64Codec(
  name: string,
  littleEndian: boolean,
): NumberCodec<JSBI> {
  return new NumberCodec(name, 8, {
    checkNumber(value) {
      return (
        value instanceof JSBI &&
        JSBI.greaterThanOrEqual(value, MIN_BIG_INT64) &&
        JSBI.lessThanOrEqual(value, MAX_BIG_INT64)
      );
    },
    packNumberTo(value, buffer) {
      const view = new DataView(buffer.buffer, buffer.byteOffset);
      JSBI.DataViewSetBigInt64(view, 0, value, littleEndian);
    },
    unpackNumber(buffer) {
      const view = new DataView(buffer.buffer, buffer.byteOffset);
      return JSBI.DataViewGetBigInt64(view, 0, littleEndian);
    },
  });
}
export const Int64 = createBigInt64Codec("Int64", true);

const UINT32_MASK = JSBI.BigInt(0xffffffff);
const UINT32_SHIFT = JSBI.BigInt(32);
const UINT8_MASK = JSBI.BigInt(0xff);
const UINT8_SHIFT = JSBI.BigInt(8);

export function packUintN(
  byteLength: number,
  value: JSBI,
  buffer: Uint8Array,
  littleEndian: boolean,
) {
  const view = new DataView(buffer.buffer, buffer.byteOffset);

  let remainingBytes = byteLength;
  let remainingValue = JSBI.asUintN(byteLength << 3, value);
  let [offset, step] = littleEndian ? [0, 4] : [byteLength - 4, -4];

  while (remainingBytes >= 4) {
    view.setUint32(
      offset,
      JSBI.toNumber(JSBI.bitwiseAnd(remainingValue, UINT32_MASK)),
      littleEndian,
    );

    offset += step;
    remainingBytes -= 4;
    remainingValue = JSBI.signedRightShift(remainingValue, UINT32_SHIFT);
  }

  step = littleEndian ? 1 : -1;
  if (!littleEndian) {
    offset += 3;
  }

  while (remainingBytes > 0) {
    view.setUint8(
      offset,
      JSBI.toNumber(JSBI.bitwiseAnd(remainingValue, UINT8_MASK)),
    );

    offset += step;
    remainingBytes -= 1;
    remainingValue = JSBI.signedRightShift(remainingValue, UINT8_SHIFT);
  }
}

export function unpackUintN(
  byteLength: number,
  buffer: Uint8Array,
  littleEndian: boolean,
): JSBI {
  const view = new DataView(buffer.buffer, buffer.byteOffset);

  let remainingBytes = byteLength;
  let value = ZERO;
  let [offset, step] = littleEndian ? [byteLength - 4, -4] : [0, 4];

  while (remainingBytes >= 4) {
    if (JSBI.notEqual(value, ZERO)) {
      value = JSBI.leftShift(value, UINT32_SHIFT);
    }
    value = JSBI.add(value, JSBI.BigInt(view.getUint32(offset, littleEndian)));

    offset += step;
    remainingBytes -= 4;
  }

  step = littleEndian ? -1 : 1;
  if (littleEndian) {
    offset += 3;
  }

  while (remainingBytes > 0) {
    value = JSBI.leftShift(value, UINT8_SHIFT);
    value = JSBI.add(value, JSBI.BigInt(view.getUint8(offset)));

    offset += step;
    remainingBytes -= 1;
  }

  return value;
}

export function createBigUintNCodecSpec(
  fixedByteLength: number,
  littleEndian: boolean,
): NumberCodecSpec<JSBI> {
  return {
    checkNumber(value) {
      return JSBI.asUintN(fixedByteLength << 3, value) === value;
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
): NumberCodec<JSBI> {
  return new NumberCodec<JSBI>(
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
): NumberCodec<JSBI> {
  const spec = createBigUintNCodecSpec(fixedByteLength, littleEndian);
  const bitLength = fixedByteLength << 3;
  return new NumberCodec<JSBI>(name, fixedByteLength, {
    checkNumber(value) {
      return JSBI.asIntN(bitLength, value) === value;
    },
    packNumberTo(value, buffer) {
      return spec.packNumberTo(JSBI.asUintN(bitLength, value), buffer);
    },
    unpackNumber(buffer) {
      return JSBI.asIntN(bitLength, spec.unpackNumber(buffer));
    },
  });
}
export const Int128 = createBigIntNCodec("Int128", 16, true);
export const Int256 = createBigIntNCodec("Int256", 32, true);
