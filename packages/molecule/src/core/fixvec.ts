import { BinaryWriter } from "../binary-writer";
import {
  AnyFixedSizeCodec,
  DynamicSizeCodec,
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
import { UINT32_BYTE_LENGTH } from "./constants";

/** @internal */
export class FixvecCodec<
  TCodec extends AnyFixedSizeCodec,
> extends DynamicSizeCodec<Infer<TCodec>[], InferParseInput<TCodec>[]> {
  readonly inner: TCodec;

  constructor(name: string, inner: TCodec) {
    super(name);
    this.inner = inner;
  }

  unpack(buffer: Uint8Array): Infer<TCodec>[] {
    this.expectMinimalByteLength(UINT32_BYTE_LENGTH, buffer);
    const view = new DataView(buffer.buffer);
    const length = view.getUint32(0, true);
    this.expectByteLength(
      UINT32_BYTE_LENGTH + length * this.inner.fixedByteLength,
      buffer,
    );

    const elementsBuffer = buffer.subarray(UINT32_BYTE_LENGTH);
    const result = new Array(length);
    for (let i = 0; i < length; i++) {
      result[i] = this.inner.unpack(
        elementsBuffer.subarray(
          i * this.inner.fixedByteLength,
          (i + 1) * this.inner.fixedByteLength,
        ),
      );
    }
    return result;
  }

  packTo(value: Infer<TCodec>[], writer: BinaryWriter) {
    const header = new Uint8Array(UINT32_BYTE_LENGTH);
    const headerView = new DataView(header.buffer);
    headerView.setUint32(0, value.length, true);
    writer.push(header);

    for (const v of value) {
      this.inner.packTo(v, writer);
    }
  }

  safeParse(
    input: InferParseInput<TCodec>[],
  ): SafeParseReturnType<Infer<TCodec>[]> {
    if (Array.isArray(input)) {
      const results = input.map((e) => this.inner.safeParse(e));
      if (results.every((r) => r.success)) {
        return parseSuccess(
          results.map((r) => (r as SafeParseReturnSuccess<Infer<TCodec>>).data),
        );
      }
      const errorResult = parseError("Array member parse failed");
      for (const [i, r] of results.entries()) {
        if (!r.success) {
          errorResult.error.addChild(i, r.error.issue);
        }
      }
      return errorResult;
    }

    return parseError(`Expected array, found ${input}`);
  }

  getSchema(): string {
    return `vector ${this.name} <${this.inner.name}>;`;
  }

  getDepedencies(): Iterable<UnknownCodec> {
    return [this.inner];
  }
}

/** @internal */
export class Uint8ArrayFixvecCodec extends DynamicSizeCodec<Uint8Array> {
  constructor(name: string) {
    super(name);
  }

  unpack(buffer: Uint8Array): Uint8Array {
    this.expectMinimalByteLength(UINT32_BYTE_LENGTH, buffer);
    const view = new DataView(buffer.buffer);
    const length = view.getUint32(0, true);
    this.expectByteLength(UINT32_BYTE_LENGTH + length, buffer);

    // Create a copy to prevent accidental changes.
    return new Uint8Array(buffer.subarray(UINT32_BYTE_LENGTH));
  }

  packTo(value: Uint8Array, writer: BinaryWriter) {
    const header = new Uint8Array(UINT32_BYTE_LENGTH);
    const headerView = new DataView(header.buffer);
    headerView.setUint32(0, value.length, true);
    writer.push(header);
    writer.push(value);
  }

  safeParse(input: Uint8Array): SafeParseReturnType<Uint8Array> {
    if (ArrayBuffer.isView(input) && input.byteLength === input.length) {
      return parseSuccess(input);
    }
    return parseError(`Expected Uint8Array, found ${input}`);
  }

  getSchema(): string {
    return `vector ${this.name} <byte>;`;
  }
}

/**
 * Fixvec codec for the molecule built-in type `vector` when the inner type has a fixed size.
 * @group Core Codecs
 * @see {@link byteFixvec} for byte fixvec which has a better performance.
 * @internal
 * @example
 * ```ts
 * import { mol } from "@ckb-cobuild/molecule";
 * const Bytes = mol.fixvec("Bytes", mol.byte);
 * ```
 */
export function fixvec<TCodec extends AnyFixedSizeCodec>(
  name: string,
  inner: TCodec,
): FixvecCodec<TCodec> {
  return new FixvecCodec(name, inner);
}

/**
 * Fixvec codec for the molecule built-in type `vector <byte>`.
 * @group Core Codecs
 * @see {@link fixvec} for general purpuse fixvec.
 * @example
 * ```ts
 * import { mol } from "@ckb-cobuild/molecule";
 * const Bytes = mol.byteFixvec("Bytes", mol.byte);
 * ```
 */
export function byteFixvec(name: string): Uint8ArrayFixvecCodec {
  return new Uint8ArrayFixvecCodec(name);
}
