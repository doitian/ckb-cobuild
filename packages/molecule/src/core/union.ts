import { BinaryWriter } from "../binary-writer";
import {
  AnyCodec,
  DynamicSizeCodec,
  Infer,
  InferParseInput,
  UnknownCodec,
} from "../codec";
import {
  CodecError,
  SafeParseReturnType,
  parseError,
  parseSuccess,
  unpackError,
} from "../error";
import { UINT32_BYTE_LENGTH } from "./constants";
import { CodecShape, verifyShapeAndOrder } from "./shape";

export type InferUnion<TShape extends CodecShape<AnyCodec>> = {
  [K in keyof TShape]: {
    type: K;
    value: Infer<TShape[K]>;
  };
}[keyof TShape];
export type InferUnionParseInput<TShape extends CodecShape<AnyCodec>> = {
  [K in keyof TShape]: {
    type: K;
    value: InferParseInput<TShape[K]>;
  };
}[keyof TShape];

export class UnionCodec<
  TShape extends CodecShape<AnyCodec>,
> extends DynamicSizeCodec<InferUnion<TShape>, InferUnionParseInput<TShape>> {
  readonly inner: TShape;
  readonly tagNameById: Map<number, keyof TShape> = new Map();
  readonly tagIdByName: Record<string, number> = {};

  constructor(
    name: string,
    inner: TShape,
    tags: (keyof TShape)[] | Record<keyof TShape, number>,
  ) {
    super(name);
    this.inner = inner;
    if (Array.isArray(tags)) {
      for (const [id, tagName] of tags.entries()) {
        this.tagNameById.set(id, tagName);
        this.tagIdByName[tagName as string] = id;
      }
    } else {
      for (const [tagName, id] of Array.from(Object.entries(tags)).sort(
        (a, b) => a[1] - b[1],
      )) {
        this.tagNameById.set(id, tagName);
      }
      this.tagIdByName = tags;
    }
  }

  /**
   * @param strict - whehter to allow unknown fields in the buffer.
   *                 True to enable. It is off by default.
   */
  unpack(buffer: Uint8Array, strict?: boolean): InferUnion<TShape> {
    this.expectMinimalByteLength(UINT32_BYTE_LENGTH, buffer);
    const view = new DataView(buffer.buffer, buffer.byteOffset);
    const tagId = view.getUint32(0, true);
    const tagName = this.tagNameById.get(tagId);
    if (tagName !== undefined) {
      const codec = this.inner[tagName]!;
      return {
        type: tagName,
        value: codec.unpack(buffer.subarray(UINT32_BYTE_LENGTH), strict),
      };
    }
    throw unpackError(
      `Expected tag ids ${Array.from(this.tagNameById.keys())}, found ${tagId}`,
    );
  }

  packTo(value: InferUnion<TShape>, writer: BinaryWriter) {
    const codec = this.inner[value.type]!;
    const tagId = this.tagIdByName[value.type as string]!;

    const header = new Uint8Array(UINT32_BYTE_LENGTH);
    const headerView = new DataView(header.buffer);
    headerView.setUint32(0, tagId, true);
    writer.push(header);

    codec.packTo(value.value, writer);
  }

  safeParse(
    input: InferUnionParseInput<TShape>,
  ): SafeParseReturnType<InferUnion<TShape>> {
    if (
      input !== null &&
      input !== undefined &&
      typeof input === "object" &&
      !Array.isArray(input)
    ) {
      const codec = this.inner[input.type];
      if (codec !== undefined) {
        const innerResult = codec.safeParse(input.value);
        if (innerResult.success) {
          return parseSuccess({ type: input.type, value: innerResult.data });
        }
        const errorResult = parseError("Union variant parse failed");
        errorResult.error.addChild(
          input.type as string,
          innerResult.error.issue,
        );
        return errorResult;
      } else {
        return parseError(
          `Expected a valid union type, found ${input.type as string}`,
        );
      }
    }

    return parseError(`Expected object, found ${input}`);
  }

  getSchema(): string {
    const lines = [`union ${this.name} {`];
    for (const [tagId, tagName] of this.tagNameById.entries()) {
      lines.push(`    ${tagName as string}: ${tagId},`);
    }
    lines.push("}");
    return lines.join("\n");
  }

  getDepedencies(): Iterable<UnknownCodec> {
    return Object.values(this.inner);
  }
}

/**
 * Codec for built-in type `union`.
 *
 * @group Core Codecs
 * @example
 * ```ts
 * const Byte2 = mol.array("Byte2", mol.byte, 2);
 * const Byte2x2 = mol.array("Byte2x2", Byte2, 2);
 * const Byte4 = mol.array("Byte4", mol.byte, 4);
 * const Word = mol.union(
 *   "Word",
 *   {
 *     Byte4,
 *     Byte2x2,
 *   },
 *   ["Byte4", "Byte2x2"],
 * );
 * const WordCustomTag = mol.union(
 *   "WordCustomTag",
 *   {
 *     Byte4,
 *     Byte2x2,
 *   },
 *   {
 *     Byte4: 4,
 *     Byte2x2: 2,
 *   },
 * );
 * ```
 */
export function union<TShape extends CodecShape<AnyCodec>>(
  name: string,
  inner: TShape,
  tags: (keyof TShape)[] | Record<keyof TShape, number>,
  options?: {
    skipVerification?: boolean;
  },
): UnionCodec<TShape> {
  if (!(options && options.skipVerification !== true)) {
    const keys = Array.isArray(tags) ? tags : Array.from(Object.keys(tags));
    verifyShapeAndOrder(inner, keys);
    for (const [tagName, codec] of Object.entries(inner)) {
      if (tagName !== codec.name) {
        throw new CodecError(
          "schema",
          `Codec name ${codec.name} does not match the union tag name ${tagName}`,
        );
      }
    }
  }
  return new UnionCodec(name, inner, tags);
}
