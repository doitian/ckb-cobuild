import { Codec } from "../codec";
import BinaryWriter from "../binary-writer";
import { CodecError, SafeParseReturnType } from "../error";

/**
 * @internal
 */
export class ByteCodec extends Codec<number> {
  constructor() {
    super("byte", 1);
  }

  unpack(buffer: Uint8Array): number {
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
      return {
        success: true,
        data: input,
      };
    }

    return {
      success: false,
      error: CodecError.create(
        `Expected integer from 0 to 255, found ${input}`,
      ),
    };
  }
}

/**
 * Codec for the molecule primitive type `byte`.
 * @group Core Codecs
 */
export const byte = new ByteCodec();
