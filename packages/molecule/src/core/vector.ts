import { AnyCodec, AnyFixedSizeCodec, isFixedSizeCodec } from "../codec";
import { DynvecCodec, dynvec } from "./dynvec";
import { FixvecCodec, byteFixvec, fixvec } from "./fixvec";

/**
 * High performance `vector <byte>` which stores bytes in Uint8Array.
 * @group Core Codecs
 */
export const byteVector = byteFixvec;

export function vector<TCodec extends AnyCodec>(
  name: string,
  inner: TCodec,
): DynvecCodec<TCodec>;
export function vector<TCodec extends AnyFixedSizeCodec>(
  name: string,
  inner: TCodec,
): FixvecCodec<TCodec>;

/**
 * Creates a vector codec.
 *
 * It chooses the right vector codec based on the inner codec.
 * @group Core Codecs
 * @see {@link fixvec}
 * @see {@link dynvec}
 */
export function vector<TCodec extends AnyCodec>(
  name: string,
  inner: TCodec,
): AnyCodec {
  if (isFixedSizeCodec(inner)) {
    return fixvec(name, inner);
  }
  return dynvec(name, inner);
}
