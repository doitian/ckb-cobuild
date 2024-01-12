import { BinaryWriter } from "../binary-writer";
import { AnyCodec, Codec, Infer, InferParseInput } from "../codec";
import {
  SafeParseReturnSuccess,
  SafeParseReturnType,
  parseError,
  parseSuccess,
  unpackError,
} from "../error";
import { UINT32_BYTE_LENGTH } from "./constants";

export class DynvecCodec<TCodec extends AnyCodec> extends Codec<
  Infer<TCodec>[],
  InferParseInput<TCodec>[]
> {
  readonly inner: TCodec;

  constructor(name: string, inner: TCodec) {
    super(name);
    this.inner = inner;
  }

  unpack(buffer: Uint8Array): Infer<TCodec>[] {
    this.expectMinimalByteLength(UINT32_BYTE_LENGTH, buffer);
    const view = new DataView(buffer.buffer);
    const byteLength = view.getUint32(0, true);
    this.expectByteLength(byteLength, buffer);

    if (byteLength === 4) {
      // empty
      return [];
    }
    if (byteLength >= 8) {
      // at least 1, the first offset determins the length
      const offsets = [];
      offsets.push(view.getUint32(UINT32_BYTE_LENGTH, true));
      if (
        offsets[0]! < UINT32_BYTE_LENGTH + UINT32_BYTE_LENGTH ||
        offsets[0]! % UINT32_BYTE_LENGTH !== 0
      ) {
        throw unpackError(
          `Invalid dynvec header parsed so far: ${byteLength},${offsets[0]}`,
        );
      }
      const length = offsets[0]! / 4 - 1;
      const headerByteLength = UINT32_BYTE_LENGTH * (length + 1);
      this.expectMinimalByteLength(headerByteLength, buffer);
      for (let i = 1; i < length; i++) {
        offsets[i] = view.getUint32((i + 1) * UINT32_BYTE_LENGTH, true);
        if (offsets[i]! > byteLength || offsets[i]! < offsets[i - 1]!) {
          throw unpackError(
            `Invalid dynvec header parsed so far: ${byteLength},${offsets}`,
          );
        }
      }
      // loop sentinel
      offsets.push(byteLength);

      const result = new Array(length);
      for (let i = 0; i < length; i++) {
        result[i] = this.inner.unpack(
          buffer.subarray(offsets[i]!, offsets[i + 1]!),
        );
      }
      return result;
    }

    throw unpackError(`Invalid dynvec bytes length: ${byteLength}`);
  }

  packTo(value: Infer<TCodec>[], writer: BinaryWriter) {
    // bytes written so far
    const headerByteLength = UINT32_BYTE_LENGTH * (1 + value.length);
    const header = new Uint8Array(headerByteLength);
    const headerView = new DataView(header.buffer);
    const startLength = writer.length;
    // push first, set later
    writer.push(header);

    for (const [i, v] of value.entries()) {
      const offset = writer.length - startLength;
      headerView.setUint32((i + 1) * UINT32_BYTE_LENGTH, offset, true);
      this.inner.packTo(v, writer);
    }

    const byteLength = writer.length - startLength;
    headerView.setUint32(0, byteLength, true);
  }

  safeParse(
    input: InferParseInput<TCodec>[],
  ): SafeParseReturnType<Infer<TCodec>[]> {
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

  getSchema(): string {
    return `vector ${this.name} <${this.inner.name}>;`;
  }
}

/**
 * Dynvec codec for the molecule primitive type `vector` when the inner type has a dynamic size.
 * @group Core Codecs
 * @internal
 * @example
 * ```ts
 * import { mol } from "@ckb-cobuild/molecule";
 * const ByteOpt = mol.option("ByteOpt", mol.byte);
 * const ByteOptVec = mol.dynvec("ByteOptVec", ByteOpt);
 * ```
 */
export function dynvec<TCodec extends AnyCodec>(
  name: string,
  inner: TCodec,
): DynvecCodec<TCodec> {
  return new DynvecCodec(name, inner);
}
