/* eslint-disable @typescript-eslint/no-explicit-any */
import { recipes } from "@ckb-cobuild/cobuild";
import { PackParam } from "@ckb-lumos/codec";
import { AnyBytesCodec } from "./bytes-codec";

type ActionCreator<TActionData, TArgs extends any[]> = (
  ...args: TArgs
) => TActionData;

type AnyArgsShape = Record<string, any[]>;
type ActionCreatorRecord<TActionData, TArgsShape extends AnyArgsShape> = {
  [K in keyof TArgsShape]: ActionCreator<TActionData, TArgsShape[K]>;
};

type RecipeRecord<TActionData, TArgsShape extends AnyArgsShape> = {
  addAction: recipes.BuildingPacketCurryRecipe<[TActionData]>;
} & {
  [K in keyof TArgsShape]: recipes.BuildingPacketCurryRecipe<TArgsShape[K]>;
};

/**
 * A papp provides various callbacks to handle the transaction building for a type script
 * or a lock script in different stages.
 *
 * @example
 * ```ts
 * import { PackParam, molecule, number, bytes } from "@ckb-lumos/codec";
 * import { recipes } from "@ckb-cobuild/cobuild";
 * import { definePapp } from "../papp";
 *
 * const ActionData = molecule.table(
 *   {
 *     value: number.Uint32,
 *   },
 *   ["value"],
 * );
 * function set(value: number): PackParam<typeof ActionData> {
 *   return { value };
 * }
 *
 * function addAction(actionData: PackParam<typeof ActionData>) {
 *   return (buildingPacket: recipes.BuildingPacketDraft) => {
 *     buildingPacket.value.message.actions.push({
 *       scriptHash: "0x",
 *       scriptInfoHash: "0x",
 *       data: bytes.hexify(ActionData.pack(actionData)),
 *     });
 *   };
 * }
 *
 * const Counter = definePapp({
 *   actionDataCodec: ActionData,
 *   actionCreators: { set },
 *   recipes: { addAction },
 * });
 *
 * const actionData = Counter.actionCreators.set(1);
 * const packed = Counter.actionDataCodec.pack(actionData);
 * console.log(packed);
 */
export interface Papp<
  TActionDataCodec extends AnyBytesCodec,
  TActionCreatorRecordArgsShape extends AnyArgsShape,
  TRecipeRecordArgsShape extends AnyArgsShape,
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

  /**
   * A dictionary of recipes to modify a BuildingPacket.
   *
   * The value of the dictionary is a function which returns a {@link recipes.BuildingPacketRecipe}
   * or a Promise of {@link recipes.BuildingPacketRecipe}.
   */
  recipes: RecipeRecord<PackParam<TActionDataCodec>, TRecipeRecordArgsShape>;
}

/**
 * This function does nothing. It's helpful to let typescript do the type check.
 *
 * @see {@link Papp}
 */
export function definePapp<
  TActionDataCodec extends AnyBytesCodec,
  TActionCreatorRecordArgsShape extends AnyArgsShape,
  TRecipeRecordArgsShape extends AnyArgsShape,
>(
  papp: Papp<
    TActionDataCodec,
    TActionCreatorRecordArgsShape,
    TRecipeRecordArgsShape
  >,
): Papp<
  TActionDataCodec,
  TActionCreatorRecordArgsShape,
  TRecipeRecordArgsShape
> {
  return papp;
}
