/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyBytesCodec } from "./bytes-codec";
import { PackParam } from "@ckb-lumos/codec";

type ActionCreator<TActionData, TArgs extends any[]> = (
  ...args: TArgs
) => TActionData;

type AnyArgsShape = Record<string, any[]>;
type ActionCreatorRecord<TActionData, TArgsShape extends AnyArgsShape> = {
  [K in keyof TArgsShape]: ActionCreator<TActionData, TArgsShape[K]>;
};

/**
 * A papp provides various callbacks to handle the transaction building for a type script
 * or a lock script in different stages.
 *
 * @example
 * ```ts
 * import { PackParam, molecule, number, bytes } from "@ckb-lumos/codec";
 * import { definePapp } from "@ckb-cobuild/papp";
 *
 * const ActionData = molecule.table(
 *   {
 *     value: number.Uint32,
 *   },
 *   ["value"],
 * );
 *
 * function set(value: number): PackParam<typeof ActionData> {
 *   return { value };
 * }
 *
 * const Counter = definePapp({
 *   actionDataCodec: ActionData,
 *   actionCreators: { set },
 * });
 *
 * const actionData = Counter.actionCreators.set(1);
 * const packed = Counter.actionDataCodec.pack(actionData);
 */
export interface Papp<
  TActionDataCodec extends AnyBytesCodec,
  TActionCreatorRecordArgsShape extends AnyArgsShape,
> {
  /**
   * The codec used to pack and unpack action data for this Papp.
   */
  actionDataCodec: TActionDataCodec;

  /**
   * A dictionary of action creators.
   *
   * An action creator is a function which takes some arguments and returns the action data for packing.
   */
  actionCreators: ActionCreatorRecord<
    PackParam<TActionDataCodec>,
    TActionCreatorRecordArgsShape
  >;
}

/**
 * This function does nothing. It's helpful to let typescript do the type check.
 *
 * @see {@link Papp}
 */
export function definePapp<
  TActionDataCodec extends AnyBytesCodec,
  TActionCreatorMapArgsShape extends AnyArgsShape,
>(
  papp: Papp<TActionDataCodec, TActionCreatorMapArgsShape>,
): Papp<TActionDataCodec, TActionCreatorMapArgsShape> {
  return papp;
}
