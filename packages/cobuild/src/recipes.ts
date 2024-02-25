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
 *   recipes.addInputCell(draft, factory.makeInputCell());
 *   draft.value.witnesses.push("0x");
 * });
 * ```
 */
import { CellDep, WitnessArgs } from "@ckb-cobuild/ckb-molecule-codecs";
import { BuildingPacket, InputCell, OutputCell } from "./building-packet";
import { makeDefaultWitnessLayout, makeWitnessArgs } from "./factory";
import { WitnessLayout } from "./witness-layout";

/** Make functions compatible with Immer */
export type WritableDraft<T> = { -readonly [K in keyof T]: Draft<T[K]> };
export type Draft<T> = T extends number | string | boolean | bigint
  ? T
  : WritableDraft<T>;

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
  buildingPacket: WritableDraft<BuildingPacket>,
  cell: InputCell,
): WritableDraft<BuildingPacket> {
  const {
    payload: { inputs },
    resolved_inputs: { outputs, outputs_data },
  } = buildingPacket.value;

  const index = Math.max(inputs.length, outputs.length, outputs_data.length);
  inputs[index] = cell.cellInput;
  outputs[index] = cell.cellOutput;
  outputs_data[index] = cell.data;

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
  buildingPacket: WritableDraft<BuildingPacket>,
  cell: OutputCell,
): WritableDraft<BuildingPacket> {
  const {
    payload: { outputs, outputs_data },
  } = buildingPacket.value;

  const index = Math.max(outputs.length, outputs_data.length);
  outputs[index] = cell.cellOutput;
  outputs_data[index] = cell.data;

  return buildingPacket;
}

/**
 * Update the witness as a {@link WitnessArgs}.

 * Empty witness is considered as a empty WitnessArgs.

 * @param update - callback to update the unpacked WitnessArgs. It can modify in place or return a new WitnessArgs.
 * @throws Error if the witness is present but is not a valid WitnessArgs.
 */
export function updateWitnessArgs(
  buildingPacket: WritableDraft<BuildingPacket>,
  index: number,
  update: (args: WitnessArgs) => WitnessArgs | undefined,
) {
  const witnesses = buildingPacket.value.payload.witnesses;
  const witness = witnesses[index];
  const unpacked =
    witness !== undefined && witness !== null && witness.length > 0
      ? WitnessArgs.unpack(witness as Uint8Array)
      : makeWitnessArgs();

  witnesses[index] = WitnessArgs.pack(update(unpacked) ?? unpacked);

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
  buildingPacket: WritableDraft<BuildingPacket>,
  index: number,
  update: (args: WitnessLayout) => WitnessLayout | undefined,
) {
  const witnesses = buildingPacket.value.payload.witnesses;
  const witness = witnesses[index];
  const unpacked =
    witness !== undefined && witness !== null && witness.length > 0
      ? WitnessLayout.unpack(witness as Uint8Array)
      : makeDefaultWitnessLayout();

  witnesses[index] = WitnessLayout.pack(update(unpacked) ?? unpacked);

  return buildingPacket;
}

type CellDepPredicate = (cellDep: CellDep | WritableDraft<CellDep>) => boolean;

export function uint8ArrayEqual(
  a: Uint8Array | WritableDraft<Uint8Array>,
  b: Uint8Array | WritableDraft<Uint8Array>,
) {
  if (a.byteLength === b.byteLength) {
    for (let i = 0; i < a.byteLength; ++i) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  return false;
}

function cellDepEqualWithoutCurry(
  a: CellDep | WritableDraft<CellDep>,
  b: CellDep | WritableDraft<CellDep>,
) {
  return (
    uint8ArrayEqual(a.out_point.tx_hash, b.out_point.tx_hash) &&
    a.out_point.index === b.out_point.index &&
    a.dep_type === b.dep_type
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
export function cellDepEqual(
  a: CellDep | WritableDraft<CellDep>,
): CellDepPredicate;
export function cellDepEqual(
  a: CellDep | WritableDraft<CellDep>,
  b: CellDep | WritableDraft<CellDep>,
): boolean;
export function cellDepEqual(
  a: CellDep | WritableDraft<CellDep>,
  ...rest: (CellDep | WritableDraft<CellDep>)[]
) {
  if (rest.length > 0) {
    return cellDepEqualWithoutCurry(a, rest[0]!);
  }
  return (b: CellDep) => cellDepEqualWithoutCurry(a, b);
}

/**
 * Add distinct cell dep using deep `===` equality check.
 * @see {@link cellDepEqual}
 */
export function addDistinctCellDep(
  buildingPacket: WritableDraft<BuildingPacket>,
  cellDep: CellDep,
): WritableDraft<BuildingPacket> {
  const cellDeps = buildingPacket.value.payload.cell_deps;

  if (cellDeps.findIndex(cellDepEqual(cellDep)) === -1) {
    cellDeps.push(cellDep);
  }

  return buildingPacket;
}

export function addDistinctHeaderDep(
  buildingPacket: WritableDraft<BuildingPacket>,
  blockHash: Uint8Array,
): WritableDraft<BuildingPacket> {
  const headerDeps = buildingPacket.value.payload.header_deps;

  if (headerDeps.indexOf(blockHash) === -1) {
    headerDeps.push(blockHash);
  }

  return buildingPacket;
}
