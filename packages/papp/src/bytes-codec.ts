/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBytesCodec } from "@ckb-lumos/codec";

/**
 * BytesCodec is not exported. Instead of depending on a internal path, get the type from the function `createBytesCodec`.
 * @internal
 */
export type BytesCodec<Unpacked = any, Packable = Unpacked> = ReturnType<
  typeof createBytesCodec<Unpacked, Packable>
>;

export type AnyBytesCodec = BytesCodec<any, any>;
