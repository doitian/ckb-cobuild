import BinaryWriter from "./binary-writer";
import { FixedSizeCodec } from "./codec";
import { SafeParseReturnType, parseError, parseSuccess } from "./error";

export interface NumberCodecSpec<T = number> {
  /** Whether the number must be an integer. */
  checkNumber(value: T): boolean;

  /** Write number to the buffer. The buffer is guranteed to have enough space. */
  packNumberTo(value: T, buffer: Uint8Array): void;

  /** Write number to the buffer. The buffer is guranteed to have enough space. */
  unpackNumber(buffer: Uint8Array): T;
}

/**
 * Codec for JavaScript numbers
 */
export class NumberCodec<T = number> extends FixedSizeCodec<T> {
  readonly spec: NumberCodecSpec<T>;

  constructor(name: string, fixedByteLength: number, spec: NumberCodecSpec<T>) {
    super(name, fixedByteLength);
    this.spec = spec;
  }

  _unpack(buffer: Uint8Array): T {
    return this.spec.unpackNumber(buffer);
  }

  packTo(value: T, writer: BinaryWriter) {
    const buffer = new Uint8Array(this.fixedByteLength);
    this.spec.packNumberTo(value, buffer);
    writer.push(buffer);
  }

  safeParse(input: T): SafeParseReturnType<T> {
    if (this.spec.checkNumber(input)) {
      return parseSuccess(input);
    }

    return parseError(`Expected a valid number for ${this.name}, got ${input}`);
  }

  getSchema(): string {
    return `array ${this.name} [byte; ${this.fixedByteLength}];`;
  }
}

export function createUint32Codec(
  name: string,
  littleEndian: boolean,
): NumberCodec {
  return new NumberCodec(name, 4, {
    checkNumber(value) {
      return Number.isInteger(value) && value >= 0 && value <= 0xffffffff;
    },
    packNumberTo(value, buffer) {
      const view = new DataView(buffer.buffer, buffer.byteOffset);
      view.setUint32(0, value, littleEndian);
    },
    unpackNumber(buffer) {
      const view = new DataView(buffer.buffer, buffer.byteOffset);
      return view.getUint32(0, littleEndian);
    },
  });
}
export const Uint32 = createUint32Codec("Uint32", true);

export function createInt32Codec(
  name: string,
  littleEndian: boolean,
): NumberCodec {
  return new NumberCodec(name, 4, {
    checkNumber(value) {
      return (
        Number.isInteger(value) && value >= -0x80000000 && value <= 0x7fffffff
      );
    },
    packNumberTo(value, buffer) {
      const view = new DataView(buffer.buffer, buffer.byteOffset);
      view.setInt32(0, value, littleEndian);
    },
    unpackNumber(buffer) {
      const view = new DataView(buffer.buffer, buffer.byteOffset);
      return view.getInt32(0, littleEndian);
    },
  });
}
export const Int32 = createInt32Codec("Int32", true);

export function createUint16Codec(
  name: string,
  littleEndian: boolean,
): NumberCodec {
  return new NumberCodec(name, 2, {
    checkNumber(value) {
      return Number.isInteger(value) && value >= 0 && value <= 0xffff;
    },
    packNumberTo(value, buffer) {
      const view = new DataView(buffer.buffer, buffer.byteOffset);
      view.setUint16(0, value, littleEndian);
    },
    unpackNumber(buffer) {
      const view = new DataView(buffer.buffer, buffer.byteOffset);
      return view.getUint16(0, littleEndian);
    },
  });
}
export const Uint16 = createUint16Codec("Uint16", true);

export function createInt16Codec(
  name: string,
  littleEndian: boolean,
): NumberCodec {
  return new NumberCodec(name, 2, {
    checkNumber(value) {
      return Number.isInteger(value) && value >= -0x8000 && value <= 0x7fff;
    },
    packNumberTo(value, buffer) {
      const view = new DataView(buffer.buffer, buffer.byteOffset);
      view.setInt16(0, value, littleEndian);
    },
    unpackNumber(buffer) {
      const view = new DataView(buffer.buffer, buffer.byteOffset);
      return view.getInt16(0, littleEndian);
    },
  });
}
export const Int16 = createInt16Codec("Int16", true);
