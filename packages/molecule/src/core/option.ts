import { Codec, AnyCodec, Infer, InferParseInput } from "../codec";
import { BinaryWriter, EMPTY_BUFFER } from "../binary-writer";
import { SafeParseReturnType } from "../error";

/**
 * @internal
 */
export class OptionCodec<TCodec extends AnyCodec> extends Codec<
  Infer<TCodec> | null,
  InferParseInput<TCodec>
> {
  inner: TCodec;

  constructor(name: string, inner: TCodec) {
    super(name, undefined);
    this.inner = inner;
  }

  unpack(buffer: Uint8Array): Infer<TCodec> | null {
    if (buffer.length > 0) {
      return this.inner.unpack(buffer);
    }
    return null;
  }

  packTo(value: Infer<TCodec> | null, writer: BinaryWriter) {
    if (value !== null && value !== undefined) {
      this.inner.packTo(value, writer);
    }
  }

  pack(value: Infer<TCodec> | null): Uint8Array {
    if (value !== null && value !== undefined) {
      return this.inner.pack(value);
    }
    return EMPTY_BUFFER;
  }

  safeParse(
    input: InferParseInput<TCodec> | null,
  ): SafeParseReturnType<Infer<TCodec> | null> {
    if (input !== null && input !== undefined) {
      return this.inner.safeParse(input);
    }
    return {
      success: true,
      data: null,
    };
  }

  getSchema(): string {
    return `option ${this.name} (${this.inner.name});`;
  }
}

/**
 * Codec for the molecule primitive type `option`.
 * @group Core Codecs
 * @example
 * ```ts
 * import { mol } from "@ckb-cobuild/molecule";
 * const ByteOpt = mol.option("ByteOpt", mol.byte);
 * ```
 */
export function option<TCodec extends AnyCodec>(
  name: string,
  inner: TCodec,
): OptionCodec<TCodec> {
  return new OptionCodec(name, inner);
}
