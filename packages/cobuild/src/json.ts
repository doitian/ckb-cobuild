import { BI } from "@ckb-lumos/bi";
import { bytes, AnyCodec, PackParam, UnpackResult } from "@ckb-lumos/codec";

/* eslint-disable @typescript-eslint/no-explicit-any */

type CompatibleType = string | boolean | null;
type HexStringType = number | BI | Uint8Array;

export type JsonValue<T> = T extends CompatibleType
  ? T
  : T extends undefined
    ? null
    : T extends HexStringType
      ? string
      : T extends Array<infer U>
        ? JsonArray<U>
        : JsonMap<T>;
type JsonArray<T> = Array<JsonValue<T>>;
type JsonMap<T> = {
  [K in keyof T]: JsonValue<T[K]>;
};

export type BytesLike = string;

/**
 * Convert to Json which is consistent with the CKB JSONRPC.
 *
 * CKB JSONRPC presents number, {@link BI}, Uint8Array as hex string.
 */
export function toJson<T = any>(value: T): JsonValue<T> {
  // Narrowing does not work here
  if (
    typeof value === "string" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return value as JsonValue<T>;
  }
  if (typeof value === "number") {
    return BI.from(value).toHexString() as JsonValue<T>;
  }
  if (typeof value === "object") {
    if (value instanceof BI) {
      return value.toHexString() as JsonValue<T>;
    }
    if (value instanceof Uint8Array) {
      return bytes.hexify(value) as JsonValue<T>;
    }
    if (Array.isArray(value)) {
      return value.map(toJson) as JsonValue<T>;
    }

    const result: Record<string, any> = {};
    for (const [propertyName, propertyValue] of Object.entries(value)) {
      result[propertyName] = toJson(propertyValue);
    }
    return result as JsonValue<T>;
  }

  return (value !== undefined ? value : null) as JsonValue<T>;
}

/**
 * Convert a json value to the codec unpacked result.
 */
export function fromJson(
  codec: AnyCodec,
  jsonValue: PackParam<AnyCodec>,
): UnpackResult<AnyCodec> {
  return codec.unpack(codec.pack(jsonValue));
}
