import BinaryWriter from "../binary-writer";
import { FixedSizeCodec } from "../codec";
import { SafeParseReturnType, parseError, parseSuccess } from "../error";

/**
 * @internal
 */
export class ByteCodec extends FixedSizeCodec<number> {
  constructor() {
    super("byte", 1);
  }

  _unpack(buffer: Uint8Array): number {
    return buffer[0]!;
  }

  packTo(value: number, writer: BinaryWriter) {
    writer.push(this.pack(value));
  }

  pack(value: number): Uint8Array {
    return new Uint8Array([value]);
  }

  safeParse(input: number): SafeParseReturnType<number> {
    if (Number.isInteger(input) && input >= 0 && input <= 255) {
      return parseSuccess(input);
    }

    return parseError(`Expected integer from 0 to 255, found ${input}`);
  }

  /**
   * No need to define schema fo builtin types.
   */
  getSchema(): string {
    return "";
  }
}

/**
 * Codec for the molecule primitive type `byte`.
 * @group Core Codecs
 */
export const byte = new ByteCodec();
