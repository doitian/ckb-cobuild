import { produce, freeze } from "immer";
import { makeBuildingPacket, makeInputCell, makeCellInput } from "../factory";
import { BI } from "@ckb-lumos/bi";
import { addInputCell } from "../recipes";

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
    } = produce(emptyBuildingPacket, (draft) => {
      addInputCell(draft, inputCell);
    });

    expect(inputs).toHaveLength(1);
    expect(outputs).toHaveLength(1);
    expect(outputsData).toHaveLength(1);
    expect(inputs[0]).toEqual(inputCell.cellInput);
    expect(outputs[0]).toEqual(inputCell.cellOutput);
    expect(outputsData[0]).toEqual(inputCell.data);
  });

  test("different length", () => {
    const buildingPacketWithOneInput = produce(emptyBuildingPacket, (draft) => {
      draft.value.payload.inputs.push(makeCellInput());
    });

    const {
      value: {
        payload: { inputs },
        resolvedInputs: { outputs, outputsData },
      },
    } = produce(buildingPacketWithOneInput, (draft) => {
      addInputCell(draft, inputCell);
    });

    expect(inputs).toHaveLength(2);
    expect(outputs).toHaveLength(2);
    expect(outputsData).toHaveLength(2);
    expect(inputs[1]).toEqual(inputCell.cellInput);
    expect(outputs[1]).toEqual(inputCell.cellOutput);
    expect(outputsData[1]).toEqual(inputCell.data);
  });
});
