/* eslint-disable @typescript-eslint/no-explicit-any */
import BinaryWriter from "./binary-writer";
import { CodecError, SafeParseReturnType } from "./error";

export abstract class Codec<T, TParseInput = T> {
  /**
   * Name of this codec used to export .mol file.
   */
  readonly name: string;

  /**
   * The byte length of a fixed size molecule type.
   * @see [Molecule Encoding Spec](https://github.com/nervosnetwork/molecule/blob/master/docs/encoding_spec.md)
   */
  readonly fixedByteLength?: number;

  constructor(name: string, fixedByteLength?: number) {
    this.name = name;
    this.fixedByteLength = fixedByteLength;
  }

  /**
   * Unpack the value from the molecule buffer.
   * @throws {@link CodecError}
   */
  abstract unpack(buffer: Uint8Array): T;

  /** @internal */
  checkFixedByteLength(buffer: Uint8Array) {
    if (
      this.fixedByteLength !== undefined &&
      this.fixedByteLength !== null &&
      buffer.length < this.fixedByteLength
    ) {
      throw CodecError.expectFixedByteLength(
        this.fixedByteLength,
        buffer.length,
      );
    }
  }

  /**
   * Pack the value and append the buffer to the provided writer.
   *
   * Take the advantage of writer and append the buffer as blocks. The writer can concatenate all blocks into one buffer for the final result.
   */
  abstract packTo(value: T, writer: BinaryWriter): void;

  /**
   * Parse a compatible input. Return a result instead of throwing.
   * @see {@link parse}
   */
  abstract safeParse(input: TParseInput): SafeParseReturnType<T>;

  /**
   * Get the schema specification of this codec as in the `.mol` file.
   */
  getSchema(): string {
    return "";
  }

  /**
   * Direct dependencies of this codec.
   */
  getDepedencies(): Iterable<UnknownCodec> {
    return [];
  }

  /**
   * Export the schema of this codec and all the dependencies into the map.
   *
   * The order of the map is guaranteed that the dependency is always exported before the dependent.
   */
  exportSchema(exported: Map<string, string>) {
    for (const dep of this.getDepedencies()) {
      dep.exportSchema(exported);
    }
    if (!exported.has(this.name)) {
      const schema = this.getSchema();
      if (schema !== "") {
        exported.set(this.name, schema);
      }
    }
  }

  /**
   * Pack value into a molecule buffer.
   *
   * @see {@link packTo}
   */
  pack(value: T): Uint8Array {
    const writer = new BinaryWriter();
    this.packTo(value, writer);
    return writer.getResultBuffer();
  }

  /**
   * Parse a compatible input.
   * @throws {@link CodecError}
   */
  parse(input: TParseInput): T {
    const result = this.safeParse(input);
    if (result.success) {
      return result.data;
    }
    throw result.error;
  }

  /**
   * Create a new codec which `parse` will call the preprocess function first.
   */
  preprocess<TOutterParseInput>(
    preprocess: (input: TOutterParseInput) => SafeParseReturnType<TParseInput>,
  ) {
    return new ParseCodec(this, preprocess);
  }
}

export type UnknownCodec = Codec<unknown, unknown>;
export type AnyCodec = Codec<any, any>;

/**
 * Given a codec type, infer the JavaScript type.
 *
 * @example
 * ```ts
 * import { mol } from "@ckb-cobuild/molecule";
 * const flag: mol.Infer<typeof mol.byte> = mol.byte.parse(1);
 * ```
 */
export type Infer<TCodec> = TCodec extends Codec<infer T, any> ? T : never;
export type InferParseInput<TCodec> = TCodec extends Codec<
  any,
  infer TParseInput
>
  ? TParseInput
  : never;

export class ParseCodec<T, TParseInput, TInnerParseInput> extends Codec<
  T,
  TParseInput
> {
  private _inner: Codec<T, TInnerParseInput>;
  private _preprocess: (
    input: TParseInput,
  ) => SafeParseReturnType<TInnerParseInput>;

  constructor(
    inner: Codec<T, TInnerParseInput>,
    preprocess: (input: TParseInput) => SafeParseReturnType<TInnerParseInput>,
  ) {
    super(inner.name, inner.fixedByteLength);
    this._inner = inner;
    this._preprocess = preprocess;
  }

  safeParse(input: TParseInput): SafeParseReturnType<T> {
    const result = this._preprocess(input);
    if (result.success) {
      return this._inner.safeParse(result.data);
    }
    return result;
  }

  unpack(buffer: Uint8Array): T {
    return this._inner.unpack(buffer);
  }

  packTo(value: T, writer: BinaryWriter) {
    return this._inner.packTo(value, writer);
  }

  getSchema(): string {
    return this._inner.getSchema();
  }

  getDepedencies(): Iterable<UnknownCodec> {
    return this._inner.getDepedencies();
  }
}
