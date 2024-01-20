import { BI } from "@ckb-lumos/bi";
import { bytes } from "@ckb-lumos/codec";
import { freeze, produce } from "immer";
import { WitnessArgs } from "../builtins";
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
} from "../recipes";
import { WitnessLayout } from "../witness-layout";

const emptyBuildingPacket = freeze(makeBuildingPacket());

describe("addInputCell", () => {
  const inputCell = makeInputCell({
    cellInput: { since: BI.from(1) },
    cellOutput: { capacity: BI.from(2) },
    data: "0x3",
  });

  test("same length", () => {
    const {
      value: {
        payload: { inputs },
        resolvedInputs: { outputs, outputsData },
      },
    } = produce(addInputCell)(emptyBuildingPacket, inputCell);

    expect(inputs).toHaveLength(1);
    expect(outputs).toHaveLength(1);
    expect(outputsData).toHaveLength(1);
    expect(inputs[0]).toEqual(inputCell.cellInput);
    expect(outputs[0]).toEqual(inputCell.cellOutput);
    expect(outputsData[0]).toEqual(inputCell.data);
  });

  test("different length", () => {
    const buildingPacketWithOneInput = produce(emptyBuildingPacket, (draft) => {
      draft.value.resolvedInputs.outputsData.push("0x");
    });

    const {
      value: {
        payload: { inputs },
        resolvedInputs: { outputs, outputsData },
      },
    } = produce(addInputCell)(buildingPacketWithOneInput, inputCell);

    expect(inputs).toHaveLength(2);
    expect(outputs).toHaveLength(2);
    expect(outputsData).toHaveLength(2);
    expect(inputs[1]).toEqual(inputCell.cellInput);
    expect(outputs[1]).toEqual(inputCell.cellOutput);
    expect(outputsData[1]).toEqual(inputCell.data);
  });
});

describe("addOutputCell", () => {
  const outputCell = makeOutputCell({
    cellOutput: { capacity: BI.from(2) },
    data: "0x3",
  });

  test("same length", () => {
    const {
      value: {
        payload: { outputs, outputsData },
      },
    } = produce(emptyBuildingPacket, (draft) => {
      addOutputCell(draft, outputCell);
    });

    expect(outputs).toHaveLength(1);
    expect(outputsData).toHaveLength(1);
    expect(outputs[0]).toEqual(outputCell.cellOutput);
    expect(outputsData[0]).toEqual(outputCell.data);
  });

  test("different length", () => {
    const buildingPacketWithOneInput = produce(emptyBuildingPacket, (draft) => {
      draft.value.payload.outputsData.push("0x");
    });

    const {
      value: {
        payload: { outputs, outputsData },
      },
    } = produce(buildingPacketWithOneInput, (draft) => {
      addOutputCell(draft, outputCell);
    });

    expect(outputs).toHaveLength(2);
    expect(outputsData).toHaveLength(2);
    expect(outputs[1]).toEqual(outputCell.cellOutput);
    expect(outputsData[1]).toEqual(outputCell.data);
  });
});

describe("updateWitnessArgs", () => {
  const defaultWitnessArgs = freeze(makeWitnessArgs());
  const exampleWitnessArgs = freeze(makeWitnessArgs({ lock: "0x01" }));

  describe.each([
    { input: null, unpacked: defaultWitnessArgs },
    { input: undefined, unpacked: defaultWitnessArgs },
    { input: "0x", unpacked: defaultWitnessArgs },
    ...[defaultWitnessArgs, exampleWitnessArgs].map((unpacked) => ({
      input: bytes.hexify(WitnessArgs.pack(unpacked)),
      unpacked,
    })),
  ])("with witness $input", ({ input, unpacked }) => {
    const buildingPacket = produce(emptyBuildingPacket, (draft) => {
      draft.value.payload.witnesses.push(input as string);
    });

    test.each([undefined, { lock: "0x01" }, { type: "0x02" }])(
      "with update %p",
      (attrs) => {
        const updateReturnValue =
          attrs !== undefined ? { ...unpacked, ...attrs } : undefined;
        const expectedWitness = bytes.hexify(
          WitnessArgs.pack(updateReturnValue ?? unpacked),
        );
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
      draft.value.payload.witnesses.push("0x00");
    });

    const update = jest.fn();
    expect(() => {
      produce(updateWitnessArgs)(buildingPacket, 0, update);
    }).toThrow("Invalid buffer length");
    expect(update).not.toHaveBeenCalled();
  });
});

describe("updateWitnessLayout", () => {
  const defaultWitnessLayout = freeze(makeDefaultWitnessLayout());
  const exampleWitnessLayout = freeze(
    makeSighashAllWitnessLayout({ seal: "0x01" }),
  );

  describe.each([
    { input: null, unpacked: defaultWitnessLayout },
    { input: undefined, unpacked: defaultWitnessLayout },
    { input: "0x", unpacked: defaultWitnessLayout },
    ...[defaultWitnessLayout, exampleWitnessLayout].map((unpacked) => ({
      input: bytes.hexify(WitnessLayout.pack(unpacked)),
      unpacked,
    })),
  ])("with witness $input", ({ input, unpacked }) => {
    const buildingPacket = produce(emptyBuildingPacket, (draft) => {
      draft.value.payload.witnesses.push(input as string);
    });

    test.each([
      undefined,
      makeSighashAllWitnessLayout({ seal: "0x02" }),
      makeSighashAllOnlyWitnessLayout({ seal: "0x03" }),
    ])("with update %p", (attrs) => {
      const updateReturnValue =
        attrs !== undefined ? { ...unpacked, ...attrs } : undefined;
      const expectedWitness = bytes.hexify(
        WitnessLayout.pack(updateReturnValue ?? unpacked),
      );
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
      draft.value.payload.witnesses.push("0x00");
    });

    const update = jest.fn();
    expect(() => {
      produce(updateWitnessLayout)(buildingPacket, 0, update);
    }).toThrow("Invalid buffer length");
    expect(update).not.toHaveBeenCalled();
  });
});

test("addDistinctHeaderDep", () => {
  const deps = [makeByte32(1), makeByte32(2), makeByte32(3)];
  const {
    value: {
      payload: { headerDeps },
    },
  } = produce(emptyBuildingPacket, (draft) => {
    addDistinctHeaderDep(draft, deps[0]!);
    addDistinctHeaderDep(draft, deps[1]!);
    addDistinctHeaderDep(draft, deps[2]!);
    addDistinctHeaderDep(draft, deps[1]!);
  });
  expect(headerDeps).toEqual(deps);
});

test("addDistinctCellDep", () => {
  const deps = [
    makeCellDep({ outPoint: { index: 1 }, depType: "code" }),
    makeCellDep({ outPoint: { index: 2 }, depType: "code" }),
    makeCellDep({ outPoint: { index: 1 }, depType: "depGroup" }),
  ];
  const {
    value: {
      payload: { cellDeps },
    },
  } = produce(emptyBuildingPacket, (draft) => {
    addDistinctCellDep(draft, deps[0]!);
    addDistinctCellDep(draft, deps[1]!);
    addDistinctCellDep(draft, deps[2]!);
    addDistinctCellDep(draft, deps[1]!);
  });
  expect(cellDeps).toEqual(deps);
});
