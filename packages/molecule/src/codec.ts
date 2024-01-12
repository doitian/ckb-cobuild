/* eslint-disable @typescript-eslint/no-explicit-any */
import BinaryWriter from "./binary-writer";
import {
  CodecError,
  SafeParseReturnType,
  createSafeParse,
  parseSuccessThen,
} from "./error";

export function identity<T>(input: T): T {
  return input;
}

export abstract class Codec<T, TParseInput = T> {
  /**
   * Name of this codec used to export .mol file.
   */
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Unpack the value from the molecule buffer.
   * @throws {@link CodecError}
   */
  abstract unpack(buffer: Uint8Array): T;

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
  abstract getSchema(): string;

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
  exportSchemaTo(exported: Map<string, string>): Map<string, string> {
    for (const dep of this.getDepedencies()) {
      dep.exportSchemaTo(exported);
    }
    if (!exported.has(this.name)) {
      const schema = this.getSchema();
      if (schema !== "") {
        exported.set(this.name, schema);
      }
    }

    return exported;
  }

  exportSchema(): Map<string, string> {
    const exported = new Map();
    return this.exportSchemaTo(exported);
  }

  toString(): string {
    return this.name;
  }

  /**
   * Create a new codec which shares the same underlying molecule type but with different JavaScript type.
   *
   * This is useful to create a different view wrapper.
   *
   * @param callbacks
   * @param callbacks.safeParse - Implements the `safeParse` for the new codec.
   * @param callbacks.willPack - Conversion callback before calling the inner `pack`.
   * @param callbacks.didUnpack - Conversion callback after calling the inner `unpack`.
   * @example
   * ```
   * import { mol } from "@ckb-cobuild/molecule";
   * const ByteOpt = mol.option("ByteOpt", mol.byte);
   * const BooleanOpt = ByteOpt.around({
   *   safeParse: (input: boolean | null) => mol.parseSuccess(input),
   *   willPack: (input: boolean | null) =>
   *     input !== null ? (input ? 1 : 0) : null,
   *   didUnpack: (value: number | null) => (value !== null ? value !== 0 : null),
   * });
   * ```
   */
  around<TOutter, TOutterParseInput>({
    safeParse,
    willPack,
    didUnpack,
  }: {
    safeParse: (input: TOutterParseInput) => SafeParseReturnType<TOutter>;
    willPack: (input: TOutter) => T;
    didUnpack: (value: T) => TOutter;
  }): Codec<TOutter, TOutterParseInput> {
    return new AroundCodec(this, safeParse, willPack, didUnpack);
  }

  /**
   * Chain a `parse` method before.
   * @example
   * ```ts
   * import { mol } from "@ckb-cobuild/molecule";
   * const ByteCoerce = mol.byte.beforeParse((input: any) => Number(input));
   * ```
   */
  beforeParse<TOutterParseInput>(
    parse: (input: TOutterParseInput) => TParseInput,
  ): Codec<T, TOutterParseInput> {
    return this.beforeSafeParse(createSafeParse(parse));
  }

  /**
   * Chain a `safeParse` method before.
   * @example
   * ```ts
   * import { mol } from "@ckb-cobuild/molecule";
   * const ByteCoerce = mol.byte.beforeSafeParse((input: any) => {
   *   const result = parseInt(input);
   *   if (!Number.isNaN(result)) {
   *     return mol.parseSuccess(result);
   *   }
   *   return mol.parseError("Not a number");
   * });
   * ```
   */
  beforeSafeParse<TOutterParseInput>(
    safeParse: (input: TOutterParseInput) => SafeParseReturnType<TParseInput>,
  ): Codec<T, TOutterParseInput> {
    return this.around({
      safeParse: (input) =>
        parseSuccessThen(safeParse(input), (data) => this.safeParse(data)),
      willPack: identity,
      didUnpack: identity,
    });
  }

  /** @internal */
  expectByteLength(byteLength: number, buffer: Uint8Array) {
    if (buffer.length !== byteLength) {
      throw CodecError.expectByteLength(byteLength, buffer.length);
    }
  }

  /** @internal */
  expectMinimalByteLength(minimalByteLength: number, buffer: Uint8Array) {
    if (buffer.length < minimalByteLength) {
      throw CodecError.expectMinimalByteLength(
        minimalByteLength,
        buffer.length,
      );
    }
  }
}

/**
 * The fixed size codec does not require length header when used inside other structures.
 * @see [Molecule Encoding Spec](https://github.com/nervosnetwork/molecule/blob/master/docs/encoding_spec.md)
 */
export abstract class FixedSizeCodec<T, TParseInput = T> extends Codec<
  T,
  TParseInput
> {
  readonly fixedByteLength: number;

  constructor(name: string, fixedByteLength: number) {
    super(name);
    this.fixedByteLength = fixedByteLength;
  }

  unpack(buffer: Uint8Array): T {
    this.expectFixedByteLength(buffer);
    return this._unpack(buffer);
  }

  /**
   * Fixed size codec should implement this function instead of `unpack`.
   * @throws {@link CodecError}
   */
  protected abstract _unpack(buffer: Uint8Array): T;

  around<TOutter, TOutterParseInput>({
    safeParse,
    willPack,
    didUnpack,
  }: {
    safeParse: (input: TOutterParseInput) => SafeParseReturnType<TOutter>;
    willPack: (input: TOutter) => T;
    didUnpack: (value: T) => TOutter;
  }): FixedSizeCodec<TOutter, TOutterParseInput> {
    return new FixedSizeAroundCodec(this, safeParse, willPack, didUnpack);
  }

  /** @internal */
  expectFixedByteLength(buffer: Uint8Array) {
    this.expectByteLength(this.fixedByteLength, buffer);
  }
}

export type UnknownCodec = Codec<unknown, unknown>;
export type AnyCodec = Codec<any, any>;
export type AnyFixedSizeCodec = FixedSizeCodec<any, any>;

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

export function isFixedSizeCodec(
  codec: AnyCodec | AnyFixedSizeCodec,
): codec is AnyFixedSizeCodec {
  return (codec as any).fixedByteLength !== undefined;
}

/** @internal */
export class AroundCodec<
  T,
  TParseInput,
  TInner,
  TInnerParseInput,
> extends Codec<T, TParseInput> {
  readonly inner: Codec<TInner, TInnerParseInput>;
  private readonly _safeParse: (input: TParseInput) => SafeParseReturnType<T>;
  private readonly _willPack: (input: T) => TInner;
  private readonly _didUnpack: (value: TInner) => T;

  constructor(
    inner: Codec<TInner, TInnerParseInput>,
    safeParse: (input: TParseInput) => SafeParseReturnType<T>,
    willPack: (input: T) => TInner,
    didUnpack: (value: TInner) => T,
  ) {
    super(inner.name);
    this.inner = inner;
    this._safeParse = safeParse;
    this._willPack = willPack;
    this._didUnpack = didUnpack;
  }

  safeParse(input: TParseInput): SafeParseReturnType<T> {
    return this._safeParse(input);
  }

  unpack(buffer: Uint8Array): T {
    return this._didUnpack(this.inner.unpack(buffer));
  }

  packTo(value: T, writer: BinaryWriter) {
    return this.inner.packTo(this._willPack(value), writer);
  }

  pack(value: T): Uint8Array {
    return this.inner.pack(this._willPack(value));
  }

  getSchema(): string {
    return this.inner.getSchema();
  }

  getDepedencies(): Iterable<UnknownCodec> {
    return this.inner.getDepedencies();
  }
}

/** @internal */
export class FixedSizeAroundCodec<
  T,
  TParseInput,
  TInner,
  TInnerParseInput,
> extends FixedSizeCodec<T, TParseInput> {
  readonly inner: FixedSizeCodec<TInner, TInnerParseInput>;
  private readonly _parseInner: AroundCodec<
    T,
    TParseInput,
    TInner,
    TInnerParseInput
  >;

  constructor(
    inner: FixedSizeCodec<TInner, TInnerParseInput>,
    safeParse: (input: TParseInput) => SafeParseReturnType<T>,
    willPack: (input: T) => TInner,
    didUnpack: (value: TInner) => T,
  ) {
    super(inner.name, inner.fixedByteLength);
    this.inner = inner;
    this._parseInner = new AroundCodec(inner, safeParse, willPack, didUnpack);
  }

  safeParse(input: TParseInput): SafeParseReturnType<T> {
    return this._parseInner.safeParse(input);
  }

  unpack(buffer: Uint8Array): T {
    return this._parseInner.unpack(buffer);
  }

  _unpack(): T {
    throw new Error("Unreachable");
  }

  packTo(value: T, writer: BinaryWriter) {
    return this._parseInner.packTo(value, writer);
  }

  pack(value: T): Uint8Array {
    return this._parseInner.pack(value);
  }

  getSchema(): string {
    return this.inner.getSchema();
  }

  getDepedencies(): Iterable<UnknownCodec> {
    return this.inner.getDepedencies();
  }
}
