import { BinaryWriter } from "../binary-writer";
import {
  AnyDynamicSizeCodec,
  DynamicSizeCodec,
  Infer,
  InferParseInput,
  UnknownCodec,
  isFixedSizeCodec,
} from "../codec";
import {
  CodecError,
  SafeParseReturnSuccess,
  SafeParseReturnType,
  parseError,
  parseSuccess,
  unpackError,
} from "../error";
import { UINT32_BYTE_LENGTH } from "./constants";

export class DynvecCodec<
  TCodec extends AnyDynamicSizeCodec,
> extends DynamicSizeCodec<Infer<TCodec>[], InferParseInput<TCodec>[]> {
  readonly inner: TCodec;

  constructor(name: string, inner: TCodec) {
    super(name);
    this.inner = inner;
  }

  unpack(buffer: Uint8Array, strict?: boolean): Infer<TCodec>[] {
    this.expectMinimalByteLength(UINT32_BYTE_LENGTH, buffer);
    const view = new DataView(buffer.buffer, buffer.byteOffset);
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
        try {
          result[i] = this.inner.unpack(
            buffer.subarray(offsets[i]!, offsets[i + 1]!),
            strict,
          );
        } catch (err) {
          throw unpackError(`Invalid dynvec item at index ${i}: ${err}`, {
            cause: err,
          });
        }
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

/**
 * Dynvec codec for the molecule built-in type `vector` when the inner type has a dynamic size.
 *
 * **Attention** that it is invalid to create dynvec on fixed size inner type.
 *
 * @group Core Codecs
 * @internal
 * @example
 * ```ts
 * import { mol } from "@ckb-cobuild/molecule";
 * const ByteOpt = mol.option("ByteOpt", mol.byte);
 * const ByteOptVec = mol.dynvec("ByteOptVec", ByteOpt);
 * ```
 */
export function dynvec<TCodec extends AnyDynamicSizeCodec>(
  name: string,
  inner: TCodec,
): DynvecCodec<TCodec> {
  const innerName = inner.name;
  if (isFixedSizeCodec(inner)) {
    throw new CodecError("schema", `dynvec<${innerName}> is invalid`);
  }
  return new DynvecCodec(name, inner);
}
