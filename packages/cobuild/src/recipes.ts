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

import {
  BuildingPacketUnpackResult,
  InputCell,
  OutputCell,
} from "./building-packet";

export type WritableDraft<T> = { -readonly [K in keyof T]: Draft<T[K]> };
export type Draft<T> = T extends number | string | boolean
  ? T
  : WritableDraft<T>;

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
