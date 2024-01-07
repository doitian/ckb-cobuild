/**
 * Functions to manipulate {@link BuildingPacket} and {@link WitnessLayout}.
 *
 * @module
 * @example
 * The functions in this module will modify the data in place. It's recommend to use these functions
 * with [Immer](https://immerjs.github.io/immer/)
 * ```ts
 * import { produce } from "immer";
 * import { recipes, factory } from "@ckb-cobuild/cobuild";
 * const input = factory.makeBuildingPacket();
 * const output = produce(input, (draft) => {
 *   recipes.addInputCell(draft, makeInputCell());
 *   draft.value.witnesses.push("0x");
 * });
 * ```
 */

import { bytes } from "@ckb-lumos/codec";
import {
  BuildingPacketUnpackResult,
  CellDepUnpackResult,
  InputCell,
  OutputCell,
} from "./building-packet";
import { makeDefaultWitnessLayout, makeWitnessArgs } from "./factory";
import {
  WitnessArgs,
  WitnessArgsUnpackResult,
  WitnessLayout,
  WitnessLayoutUnpackResult,
} from "./witness-layout";

/** Make functions compatible with Immer */
export type WritableDraft<T> = { -readonly [K in keyof T]: Draft<T[K]> };
type Draft<T> = T extends number | string | boolean ? T : WritableDraft<T>;

/**
 * Add the transaction input, its resolved cell output and data.
 *
 * This function will set the properties into the following three lists at the same position.
 * The position is the maxium length of these lists before adding this input.
 *
 * - `value.payload.inputs`
 * - `value.resolvedInputs.outputs`
 * - `value.resolvedInputs.outputsData`
 */
export function addInputCell(
  buildingPacket: WritableDraft<BuildingPacketUnpackResult>,
  cell: InputCell,
): WritableDraft<BuildingPacketUnpackResult> {
  const {
    payload: { inputs },
    resolvedInputs: { outputs, outputsData },
  } = buildingPacket.value;

  const index = Math.max(inputs.length, outputs.length, outputsData.length);
  inputs[index] = cell.cellInput;
  outputs[index] = cell.cellOutput;
  outputsData[index] = cell.data;

  return buildingPacket;
}

/**
 * Add the transaction output and its data.
 *
 * This function will set the properties into the following two lists at the same position.
 * The position is the maxium length of these lists before adding this output.
 *
 * - `value.payload.outputs`
 * - `value.payload.outputsData`
 */
export function addOutputCell(
  buildingPacket: WritableDraft<BuildingPacketUnpackResult>,
  cell: OutputCell,
): WritableDraft<BuildingPacketUnpackResult> {
  const {
    payload: { outputs, outputsData },
  } = buildingPacket.value;

  const index = Math.max(outputs.length, outputsData.length);
  outputs[index] = cell.cellOutput;
  outputsData[index] = cell.data;

  return buildingPacket;
}

/**
 * Update the witness as a {@link WitnessArgs}.

 * Empty witness is considered as a empty WitnessArgs.

 * @param update - callback to update the unpacked WitnessArgs. It can modify in place or return a new WitnessArgs.
 * @throws Error if the witness is present but is not a valid WitnessArgs.
 */
export function updateWitnessArgs(
  buildingPacket: WritableDraft<BuildingPacketUnpackResult>,
  index: number,
  update: (
    args: WitnessArgsUnpackResult,
  ) => WitnessArgsUnpackResult | undefined,
) {
  const witnesses = buildingPacket.value.payload.witnesses;
  const witness = witnesses[index];
  const unpacked =
    witness !== "0x" && witness !== undefined && witness !== null
      ? WitnessArgs.unpack(witness)
      : makeWitnessArgs();

  witnesses[index] = bytes.hexify(
    WitnessArgs.pack(update(unpacked) ?? unpacked),
  );

  return buildingPacket;
}

/**
 * Update the witness as a {@link WitnessLayout}.
 *
 * Empty witness is considered as a default {@link SighashAll}.
 *
 * @param update - callback to update the unpacked WitnessLayout. It can modify in place or return a new WitnessLayout.
 * @throws Error if the witness is present but is not a valid WitnessLayout.
 */
export function updateWitnessLayout(
  buildingPacket: WritableDraft<BuildingPacketUnpackResult>,
  index: number,
  update: (
    args: WitnessLayoutUnpackResult,
  ) => WitnessLayoutUnpackResult | undefined,
) {
  const witnesses = buildingPacket.value.payload.witnesses;
  const witness = witnesses[index];
  const unpacked =
    witness !== "0x" && witness !== undefined && witness !== null
      ? WitnessLayout.unpack(witness)
      : makeDefaultWitnessLayout();

  witnesses[index] = bytes.hexify(
    WitnessLayout.pack(update(unpacked) ?? unpacked),
  );

  return buildingPacket;
}

type CellDepPredicate = (cellDep: CellDepUnpackResult) => boolean;

function cellDepEqualWithoutCurry(
  a: CellDepUnpackResult,
  b: CellDepUnpackResult,
) {
  return (
    a.outPoint.txHash === b.outPoint.txHash &&
    a.outPoint.index === b.outPoint.index &&
    a.depType === b.depType
  );
}

/**
 * Check whether two cell deps equal using deep `===` equality check.
 *
 * @example
 * This function is curried when only one argument is passed. This is useful to find a CellDep in an array.
 *
 * ```ts
 * cellDeps.findIndex(cellDepEqual(cellDepToFind));
 * ```
 */
export function cellDepEqual(a: CellDepUnpackResult): CellDepPredicate;
export function cellDepEqual(
  a: CellDepUnpackResult,
  b: CellDepUnpackResult,
): boolean;
export function cellDepEqual(
  a: CellDepUnpackResult,
  ...rest: CellDepUnpackResult[]
) {
  if (rest.length > 0) {
    return cellDepEqualWithoutCurry(a, rest[0]!);
  }
  return (b: CellDepUnpackResult) => cellDepEqualWithoutCurry(a, b);
}

/**
 * Add distinct cell dep using deep `===` equality check.
 * @see {@link cellDepEqual}
 */
export function addDistinctCellDep(
  buildingPacket: WritableDraft<BuildingPacketUnpackResult>,
  cellDep: CellDepUnpackResult,
): WritableDraft<BuildingPacketUnpackResult> {
  const cellDeps = buildingPacket.value.payload.cellDeps;

  if (cellDeps.findIndex(cellDepEqual(cellDep)) === -1) {
    cellDeps.push(cellDep);
  }

  return buildingPacket;
}

export function addDistinctHeaderDep(
  buildingPacket: WritableDraft<BuildingPacketUnpackResult>,
  blockHash: string,
): WritableDraft<BuildingPacketUnpackResult> {
  const headerDeps = buildingPacket.value.payload.headerDeps;

  if (headerDeps.indexOf(blockHash) === -1) {
    headerDeps.push(blockHash);
  }

  return buildingPacket;
}
