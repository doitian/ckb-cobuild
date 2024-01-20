import { BinaryWriter } from "../binary-writer";
import { AnyFixedSizeCodec, FixedSizeCodec, UnknownCodec } from "../codec";
import {
  SafeParseReturnSuccess,
  SafeParseReturnType,
  parseError,
  parseSuccess,
} from "../error";
import {
  CodecShape,
  InferShape,
  InferShapeParseInput,
  InferShapeSafeParseReturnType,
  verifyShapeAndOrder,
} from "./shape";

export class StructCodec<
  TShape extends CodecShape<AnyFixedSizeCodec>,
> extends FixedSizeCodec<InferShape<TShape>, InferShapeParseInput<TShape>> {
  readonly inner: TShape;
  readonly order: (keyof TShape)[];

  constructor(name: string, inner: TShape, order: (keyof TShape)[]) {
    const length = order.reduce(
      (acc, key) => acc + inner[key]!.fixedByteLength,
      0,
    );
    super(name, length);
    this.inner = inner;
    this.order = order;
  }

  _unpack(buffer: Uint8Array): InferShape<TShape> {
    const result: Partial<InferShape<TShape>> = {};

    let offset = 0;
    for (const key of this.order) {
      const codec = this.inner[key]!;
      result[key] = codec.unpack(
        buffer.subarray(offset, offset + codec.fixedByteLength),
      );
      offset += codec.fixedByteLength;
    }
    return result as InferShape<TShape>;
  }

  packTo(value: InferShape<TShape>, writer: BinaryWriter) {
    for (const key of this.order) {
      const codec = this.inner[key]!;
      codec.packTo(value[key], writer);
    }
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
      const errorResult = parseError("Struct member parse failed");
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
    const lines = [`struct ${this.name} {`];
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
 * Codec for built-in type `struct` which fields are fixed-sized.
 *
 * @param order - A list of field keys to specifiy the field order. This is required because JavaScript object
 *                does not guarantee the order of fields in old versions.
 * @group Core Codecs
 * @example
 * ```ts
 * import { mol } from "@ckb-cobuild/molecule";
 * const Point = mol.struct(
 *   "Point",
 *   {
 *     x: mol.byte,
 *     y: mol.byte,
 *   },
 *   ["x", "y"],
 * );
 * ```
 */
export function struct<TShape extends CodecShape<AnyFixedSizeCodec>>(
  name: string,
  inner: TShape,
  order: (keyof TShape)[],
  options?: {
    skipVerification?: boolean;
  },
): StructCodec<TShape> {
  if (!(options && options.skipVerification !== true)) {
    verifyShapeAndOrder(inner, order);
  }
  return new StructCodec(name, inner, order);
}
