import { freeze, produce } from "immer";
import { CellDep, WitnessArgs } from "@ckb-cobuild/ckb-molecule-codecs";
import {
  makeBuildingPacket,
  makeByte32,
  makeCellDep,
  makeDefaultWitnessLayout,
  makeInputCell,
  makeOutputCell,
  makeSighashAllOnlyWitnessLayout,
  makeSighashAllWitnessLayout,
  makeWitnessArgs,
} from "../factory";
import {
  addDistinctCellDep,
  addDistinctHeaderDep,
  addInputCell,
  addOutputCell,
  updateWitnessArgs,
  updateWitnessLayout,
  cellDepEqual,
} from "../recipes";
import { WitnessLayout } from "../witness-layout";

const emptyBuildingPacket = freeze(makeBuildingPacket());

describe("addInputCell", () => {
  const inputCell = makeInputCell({
    cellInput: { since: 1n },
    cellOutput: { capacity: 2n },
    data: Uint8Array.of(3),
  });

  test("same length", () => {
    const {
      value: {
        payload: { inputs },
        resolved_inputs: { outputs, outputs_data },
      },
    } = produce(addInputCell)(emptyBuildingPacket, inputCell);

    expect(inputs).toHaveLength(1);
    expect(outputs).toHaveLength(1);
    expect(outputs_data).toHaveLength(1);
    expect(inputs[0]).toEqual(inputCell.cellInput);
    expect(outputs[0]).toEqual(inputCell.cellOutput);
    expect(outputs_data[0]).toEqual(inputCell.data);
  });

  test("different length", () => {
    const buildingPacketWithOneInput = produce(emptyBuildingPacket, (draft) => {
      draft.value.resolved_inputs.outputs_data.push(Uint8Array.of(0));
    });

    const {
      value: {
        payload: { inputs },
        resolved_inputs: { outputs, outputs_data },
      },
    } = produce(addInputCell)(buildingPacketWithOneInput, inputCell);

    expect(inputs).toHaveLength(2);
    expect(outputs).toHaveLength(2);
    expect(outputs_data).toHaveLength(2);
    expect(inputs[1]).toEqual(inputCell.cellInput);
    expect(outputs[1]).toEqual(inputCell.cellOutput);
    expect(outputs_data[1]).toEqual(inputCell.data);
  });
});

describe("addOutputCell", () => {
  const outputCell = makeOutputCell({
    cellOutput: { capacity: 2n },
    data: Uint8Array.of(3),
  });

  test("same length", () => {
    const {
      value: {
        payload: { outputs, outputs_data },
      },
    } = produce(emptyBuildingPacket, (draft) => {
      addOutputCell(draft, outputCell);
    });

    expect(outputs).toHaveLength(1);
    expect(outputs_data).toHaveLength(1);
    expect(outputs[0]).toEqual(outputCell.cellOutput);
    expect(outputs_data[0]).toEqual(outputCell.data);
  });

  test("different length", () => {
    const buildingPacketWithOneInput = produce(emptyBuildingPacket, (draft) => {
      draft.value.payload.outputs_data.push(Uint8Array.of(0));
    });

    const {
      value: {
        payload: { outputs, outputs_data },
      },
    } = produce(buildingPacketWithOneInput, (draft) => {
      addOutputCell(draft, outputCell);
    });

    expect(outputs).toHaveLength(2);
    expect(outputs_data).toHaveLength(2);
    expect(outputs[1]).toEqual(outputCell.cellOutput);
    expect(outputs_data[1]).toEqual(outputCell.data);
  });
});

describe("updateWitnessArgs", () => {
  const defaultWitnessArgs = freeze(makeWitnessArgs());
  const exampleWitnessArgs = freeze(
    makeWitnessArgs({ lock: Uint8Array.of(1) }),
  );

  const witnessCases: {
    input: Uint8Array | null | undefined;
    unpacked: WitnessArgs;
  }[] = [
    { input: null, unpacked: defaultWitnessArgs },
    { input: undefined, unpacked: defaultWitnessArgs },
    { input: Uint8Array.of(), unpacked: defaultWitnessArgs },
    ...[defaultWitnessArgs, exampleWitnessArgs].map((unpacked) => ({
      input: WitnessArgs.pack(unpacked),
      unpacked,
    })),
  ];
  describe.each(witnessCases)("with witness $input", ({ input, unpacked }) => {
    const buildingPacket = produce(emptyBuildingPacket, (draft) => {
      draft.value.payload.witnesses.push(input as Uint8Array);
    });

    test.each([undefined, { lock: "0x01" }, { type: "0x02" }])(
      "with update %p",
      (attrs) => {
        const updateReturnValue =
          attrs !== undefined
            ? ({ ...unpacked, ...attrs } as WitnessArgs)
            : undefined;
        const expectedWitness = WitnessArgs.pack(updateReturnValue ?? unpacked);
        const update = jest.fn().mockReturnValueOnce(updateReturnValue);
        const {
          value: {
            payload: { witnesses },
          },
        } = produce(updateWitnessArgs)(buildingPacket, 0, update);
        expect(update).toHaveBeenCalledTimes(1);
        expect(update).toHaveBeenCalledWith(unpacked);
        expect(witnesses).toHaveLength(1);
        expect(witnesses[0]).toEqual(expectedWitness);
      },
    );
  });

  test("with witness 0x00", () => {
    const buildingPacket = produce(emptyBuildingPacket, (draft) => {
      draft.value.payload.witnesses.push(Uint8Array.of(0));
    });

    const update = jest.fn();
    expect(() => {
      produce(updateWitnessArgs)(buildingPacket, 0, update);
    }).toThrow("Expected bytes length at least 4, found 1");
    expect(update).not.toHaveBeenCalled();
  });
});

describe("updateWitnessLayout", () => {
  const defaultWitnessLayout = freeze(makeDefaultWitnessLayout());
  const exampleWitnessLayout = freeze(
    makeSighashAllWitnessLayout({ seal: Uint8Array.of(1) }),
  );

  describe.each([
    { input: null, unpacked: defaultWitnessLayout },
    { input: undefined, unpacked: defaultWitnessLayout },
    { input: new Uint8Array(), unpacked: defaultWitnessLayout },
    ...[defaultWitnessLayout, exampleWitnessLayout].map((unpacked) => ({
      input: WitnessLayout.pack(unpacked),
      unpacked,
    })),
  ])("with witness $input", ({ input, unpacked }) => {
    const buildingPacket = produce(emptyBuildingPacket, (draft) => {
      draft.value.payload.witnesses.push(input as Uint8Array);
    });

    test.each([
      undefined,
      makeSighashAllWitnessLayout({ seal: Uint8Array.of(2) }),
      makeSighashAllOnlyWitnessLayout({ seal: Uint8Array.of(3) }),
    ])("with update %p", (attrs) => {
      const updateReturnValue =
        attrs !== undefined
          ? ({ ...unpacked, ...attrs } as WitnessLayout)
          : undefined;
      const expectedWitness = WitnessLayout.pack(updateReturnValue ?? unpacked);
      const update = jest.fn().mockReturnValueOnce(updateReturnValue);
      const {
        value: {
          payload: { witnesses },
        },
      } = produce(updateWitnessLayout)(buildingPacket, 0, update);
      expect(update).toHaveBeenCalledTimes(1);
      expect(update).toHaveBeenCalledWith(unpacked);
      expect(witnesses).toHaveLength(1);
      expect(witnesses[0]).toEqual(expectedWitness);
    });
  });

  test("with witness 0x00", () => {
    const buildingPacket = produce(emptyBuildingPacket, (draft) => {
      draft.value.payload.witnesses.push(Uint8Array.of(0));
    });

    const update = jest.fn();
    expect(() => {
      produce(updateWitnessLayout)(buildingPacket, 0, update);
    }).toThrow("Expected bytes length at least 4, found 1");
    expect(update).not.toHaveBeenCalled();
  });
});

test("addDistinctHeaderDep", () => {
  const deps = [makeByte32(1), makeByte32(2), makeByte32(3)];
  const {
    value: {
      payload: { header_deps },
    },
  } = produce(emptyBuildingPacket, (draft) => {
    addDistinctHeaderDep(draft, deps[0]!);
    addDistinctHeaderDep(draft, deps[1]!);
    addDistinctHeaderDep(draft, deps[2]!);
    addDistinctHeaderDep(draft, deps[1]!);
  });
  expect(header_deps).toEqual(deps);
});

test("addDistinctCellDep", () => {
  const deps = [
    makeCellDep({ out_point: { index: 1 }, dep_type: "code" }),
    makeCellDep({ out_point: { index: 2 }, dep_type: "code" }),
    makeCellDep({ out_point: { index: 1 }, dep_type: "dep_group" }),
  ];
  const {
    value: {
      payload: { cell_deps },
    },
  } = produce(emptyBuildingPacket, (draft) => {
    addDistinctCellDep(draft, deps[0]!);
    addDistinctCellDep(draft, deps[1]!);
    addDistinctCellDep(draft, deps[2]!);
    addDistinctCellDep(draft, deps[1]!);
  });
  expect(cell_deps).toEqual(deps);
});

describe("cellDepEqual", () => {
  const cases: [CellDep, CellDep, boolean][] = [
    [makeCellDep(), makeCellDep(), true],
    [
      makeCellDep({
        out_point: { tx_hash: makeByte32(0), index: 1 },
        dep_type: "dep_group",
      }),
      makeCellDep(),
      false,
    ],
    [
      makeCellDep({
        out_point: { tx_hash: makeByte32(0), index: 1 },
        dep_type: "dep_group",
      }),
      makeCellDep({
        out_point: { tx_hash: makeByte32(0), index: 1 },
        dep_type: "dep_group",
      }),
      true,
    ],
  ];
  test.each(cases)("(%s, %s)", (a, b, expected) => {
    expect(cellDepEqual(a, b)).toBe(expected);
  });
  test.each(cases)("(%s)(%s)", (a, b, expected) => {
    expect(cellDepEqual(a)(b)).toBe(expected);
  });
});
