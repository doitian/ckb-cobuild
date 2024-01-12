import { BinaryWriter } from "../binary-writer";
import {
  AnyFixedSizeCodec,
  FixedSizeCodec,
  Infer,
  InferParseInput,
  UnknownCodec,
} from "../codec";
import {
  SafeParseReturnSuccess,
  SafeParseReturnType,
  parseError,
  parseSuccess,
} from "../error";

/** @internal */
export class ArrayCodec<
  TCodec extends AnyFixedSizeCodec,
> extends FixedSizeCodec<Infer<TCodec>[], InferParseInput<TCodec>[]> {
  readonly inner: TCodec;
  readonly length: number;

  constructor(name: string, inner: TCodec, length: number) {
    super(name, inner.fixedByteLength * length);
    this.inner = inner;
    this.length = length;
  }

  _unpack(buffer: Uint8Array): Infer<TCodec>[] {
    const result = new Array(this.length);
    for (let i = 0; i < this.length; i++) {
      result[i] = this.inner.unpack(
        buffer.subarray(
          i * this.inner.fixedByteLength,
          (i + 1) * this.inner.fixedByteLength,
        ),
      );
    }
    return result;
  }

  packTo(value: Infer<TCodec>[], writer: BinaryWriter) {
    for (let i = 0; i < this.length; i++) {
      this.inner.packTo(value[i]!, writer);
    }
  }

  safeParse(
    input: InferParseInput<TCodec>[],
  ): SafeParseReturnType<Infer<TCodec>[]> {
    if (input.length === this.length) {
      const results = input.map((e) => this.inner.safeParse(e));
      if (results.every((r) => r.success)) {
        return parseSuccess(
          results.map((r) => (r as SafeParseReturnSuccess<Infer<TCodec>>).data),
        );
      }
      const result = parseError("Array member parse failed");
      for (const [i, r] of results.entries()) {
        if (!r.success) {
          result.error.addChild(i, r.error.issue);
        }
      }
      return result;
    }

    return parseError(
      `Expected array length ${this.length}, found ${input.length}`,
    );
  }

  getSchema(): string {
    return `array ${this.name} [${this.inner.name}; ${this.length}];`;
  }

  getDepedencies(): Iterable<UnknownCodec> {
    return [this.inner];
  }
}

/** @internal */
export class Uint8ArrayCodec extends FixedSizeCodec<Uint8Array> {
  readonly length: number;

  constructor(name: string, length: number) {
    super(name, length);
    this.length = length;
  }

  _unpack(buffer: Uint8Array): Uint8Array {
    // Create a copy to prevent accidental changes.
    return new Uint8Array(buffer);
  }

  packTo(value: Uint8Array, writer: BinaryWriter) {
    writer.push(value);
  }

  safeParse(input: Uint8Array): SafeParseReturnType<Uint8Array> {
    if (input.length === this.length) {
      return parseSuccess(input);
    }

    return parseError(
      `Expected array length ${this.length}, found ${input.length}`,
    );
  }

  getSchema(): string {
    return `array ${this.name} [byte; ${this.length}];`;
  }
}

/**
 * Codec for the molecule primitive type `array`.
 * @group Core Codecs
 * @see {@link byteArray} for byte array which has a better performance.
 * @example
 * ```ts
 * import { mol } from "@ckb-cobuild/molecule";
 * const Byte32 = mol.array("Byte32", mol.byte, 32);
 * ```
 */
export function array<TCodec extends AnyFixedSizeCodec>(
  name: string,
  inner: TCodec,
  length: number,
): ArrayCodec<TCodec> {
  return new ArrayCodec(name, inner, length);
}

/**
 * High performance `array [byte; n]` which stores bytes in Uint8Array.
 * @group Core Codecs
 * @see {@link array} for general purpuse array.
 * @example
 * ```ts
 * import { mol } from "@ckb-cobuild/molecule";
 * const Byte32 = mol.byteArray("Byte32", 32);
 * ```
 */
export function byteArray(name: string, length: number): Uint8ArrayCodec {
  return new Uint8ArrayCodec(name, length);
}
