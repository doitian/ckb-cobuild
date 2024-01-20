import { CodecError, SafeParseReturnType } from "../error";
import { AnyCodec, Infer, InferParseInput } from "../codec";

export type CodecShape<TCodec extends AnyCodec> = Record<string, TCodec>;

export type InferShape<TShape extends CodecShape<AnyCodec>> = {
  [TProperty in keyof TShape]: Infer<TShape[TProperty]>;
};

export type InferShapeParseInput<TShape extends CodecShape<AnyCodec>> = {
  [TProperty in keyof TShape]: InferParseInput<TShape[TProperty]>;
};

export type InferShapeSafeParseReturnType<TShape extends CodecShape<AnyCodec>> =
  {
    [TProperty in keyof TShape]: SafeParseReturnType<Infer<TShape[TProperty]>>;
  };

export function verifyShapeAndOrder<TShape extends CodecShape<AnyCodec>>(
  inner: TShape,
  order: (keyof TShape)[],
) {
  const allKeys = new Set(Object.keys(inner));
  for (const key of order) {
    if (!allKeys.has(key as string)) {
      throw new CodecError("schema", `Unknown key found: ${key as string}`);
    }
  }
  for (const key of order) {
    if (allKeys.delete(key as string) === false) {
      throw new CodecError("schema", `Duplicate key found: ${key as string}`);
    }
  }
  if (allKeys.size > 0) {
    throw new CodecError(
      "schema",
      `Missing keys found: ${Array.from(allKeys.values())}`,
    );
  }
}
