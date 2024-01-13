import { BinaryWriter } from "../binary-writer";
import { AnyCodec, DynamicSizeCodec, UnknownCodec } from "../codec";
import {
  SafeParseReturnSuccess,
  SafeParseReturnType,
  parseError,
  parseSuccess,
  unpackError,
} from "../error";
import { UINT32_BYTE_LENGTH } from "./constants";
import {
  CodecShape,
  InferShape,
  InferShapeParseInput,
  InferShapeSafeParseReturnType,
  verifyShapeAndOrder,
} from "./shape";

export class TableCodec<
  TShape extends CodecShape<AnyCodec>,
> extends DynamicSizeCodec<InferShape<TShape>, InferShapeParseInput<TShape>> {
  readonly inner: TShape;
  readonly order: (keyof TShape)[];

  constructor(name: string, inner: TShape, order: (keyof TShape)[]) {
    super(name);
    this.inner = inner;
    this.order = order;
  }

  /**
   * @param strict - whehter to allow unknown fields in the buffer.
   *                 True to enable. It is off by default.
   */
  unpack(buffer: Uint8Array, strict?: boolean): InferShape<TShape> {
    this.expectMinimalByteLength(UINT32_BYTE_LENGTH, buffer);
    const view = new DataView(buffer.buffer);
    const byteLength = view.getUint32(0, true);
    this.expectByteLength(byteLength, buffer);

    if (byteLength === 4 && this.order.length === 0) {
      // empty
      return {} as InferShape<TShape>;
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
          `Invalid table header parsed so far: ${byteLength},${offsets[0]}`,
        );
      }
      const length = offsets[0]! / 4 - 1;
      const headerByteLength = UINT32_BYTE_LENGTH * (length + 1);
      this.expectMinimalByteLength(headerByteLength, buffer);

      const knownLength = Math.min(this.order.length, length);
      for (let i = 1; i < knownLength; i++) {
        offsets[i] = view.getUint32((i + 1) * UINT32_BYTE_LENGTH, true);
        if (offsets[i]! > byteLength || offsets[i]! < offsets[i - 1]!) {
          throw unpackError(
            `Invalid table header parsed so far: ${byteLength},${offsets}`,
          );
        }
      }
      // If there are unknown fields, use the next offset as the sentinel
      const sentinel =
        knownLength === length
          ? byteLength
          : view.getUint32((knownLength + 1) * UINT32_BYTE_LENGTH, true);

      // strict checking, it's allowed that all the unknown fields are nones.
      if (strict === true && knownLength < length && sentinel < byteLength) {
        throw unpackError(
          `Table strict mode is on, found ${
            length - knownLength
          } extra fields and ${byteLength - sentinel} bytes`,
        );
      }

      // missing offsets are considered as nones
      for (let i = knownLength; i < this.order.length; i++) {
        offsets.push(sentinel);
      }
      // loop sentinel
      offsets.push(sentinel);

      const result: Partial<InferShape<TShape>> = {};
      for (const [i, key] of this.order.entries()) {
        const codec = this.inner[key]!;
        result[key] = codec.unpack(
          buffer.subarray(offsets[i]!, offsets[i + 1]!),
        );
      }
      return result as InferShape<TShape>;
    }

    throw unpackError(`Invalid table bytes length: ${byteLength}`);
  }

  packTo(value: InferShape<TShape>, writer: BinaryWriter) {
    // bytes written so far
    const headerByteLength = UINT32_BYTE_LENGTH * (1 + this.order.length);
    const header = new Uint8Array(headerByteLength);
    const headerView = new DataView(header.buffer);
    const startLength = writer.length;
    // push first, set later
    writer.push(header);

    for (const [i, key] of this.order.entries()) {
      const offset = writer.length - startLength;
      headerView.setUint32((i + 1) * UINT32_BYTE_LENGTH, offset, true);
      const codec = this.inner[key]!;
      codec.packTo(value[key], writer);
    }

    const byteLength = writer.length - startLength;
    headerView.setUint32(0, byteLength, true);
  }

  safeParse(
    input: InferShapeParseInput<TShape>,
  ): SafeParseReturnType<InferShape<TShape>> {
    if (
      input !== null &&
      input !== undefined &&
      typeof input === "object" &&
      !Array.isArray(input)
    ) {
      const results: Partial<InferShapeSafeParseReturnType<TShape>> = {};
      for (const key of this.order) {
        results[key] = this.inner[key]!.safeParse(input[key]);
      }

      if (Object.values(results).every((r) => r.success)) {
        const returnValue: Partial<InferShape<TShape>> = {};
        for (const key of this.order) {
          returnValue[key] = (
            results[key]! as SafeParseReturnSuccess<
              InferShape<TShape>[typeof key]
            >
          ).data;
        }

        return parseSuccess(returnValue as InferShape<TShape>);
      }
      const errorResult = parseError("Table member parse failed");
      for (const key of this.order) {
        const childResult = results[key]!;
        if (!childResult.success) {
          errorResult.error.addChild(key as string, childResult.error.issue);
        }
      }
      return errorResult;
    }

    return parseError(`Expected object, found ${input}`);
  }

  getSchema(): string {
    const lines = [`table ${this.name} {`];
    for (const key of this.order) {
      const codec = this.inner[key]!;
      lines.push(`    ${key as string}: ${codec.name},`);
    }
    lines.push("}");
    return lines.join("\n");
  }

  getDepedencies(): Iterable<UnknownCodec> {
    return this.order.map((key) => this.inner[key]!);
  }
}

/**
 * Codec for built-in type `table` which fields are fixed-sized.
 *
 * @param order - A list of field keys to specifiy the field order. This is required because JavaScript object
 *                does not guarantee the order of fields in old versions.
 * @group Core Codecs
 * @example
 * ```ts
 * import { mol } from "@ckb-cobuild/molecule";
 * const Point = mol.table(
 *   "Point",
 *   {
 *     x: mol.byte,
 *     y: mol.byte,
 *   },
 *   ["x", "y"],
 * );
 * ```
 */
export function table<TShape extends CodecShape<AnyCodec>>(
  name: string,
  inner: TShape,
  order: (keyof TShape)[],
  options?: {
    skipVerification?: boolean;
  },
): TableCodec<TShape> {
  if (!(options && options.skipVerification !== true)) {
    verifyShapeAndOrder(inner, order);
  }
  return new TableCodec(name, inner, order);
}

/**
 * An alternative syntax to create table codec to workaround the fields order problem.
 *
 * @group Core Codecs
 * @example
 * ```ts
 * import { mol } from "@ckb-cobuild/molecule";
 * const Point = mol.tableFromEntries(
 *   "Point",
 *   [
 *     ["x", mol.byte],
 *     ["y", mol.byte],
 *   ],
 * );
 * ```
 */
export function tableFromEntries<TShape extends CodecShape<AnyCodec>>(
  name: string,
  entries: [keyof TShape, TShape[keyof TShape]][],
): TableCodec<TShape> {
  const order = entries.map(([key]) => key);
  const inner: Partial<TShape> = {};
  for (const [key, codec] of entries) {
    inner[key] = codec;
  }
  return new TableCodec(name, inner as TShape, order);
}
