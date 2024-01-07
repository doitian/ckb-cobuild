import { BI } from "@ckb-lumos/bi";
import {
  BuildingPacket,
  BuildingPacketUnpackResult,
  getInputCell,
  getOutputCell,
} from "../building-packet";

describe("BuildingPacket", () => {
  const sampleBuildingPacket: BuildingPacketUnpackResult = {
    type: "BuildingPacketV1",
    value: {
      message: {
        actions: [],
      },
      payload: {
        version: 0,
        inputs: [
          {
            since: BI.from(0),
            previousOutput: {
              txHash: `0x01${"0".repeat(62)}`,
              index: 2,
            },
          },
        ],
        outputs: [
          {
            capacity: BI.from(3),
            lock: {
              codeHash: `0x04${"0".repeat(62)}`,
              hashType: "type",
              args: "0x05",
            },
          },
        ],
        outputsData: ["0x06"],
        cellDeps: [],
        headerDeps: [],
        witnesses: [],
      },
      resolvedInputs: {
        outputs: [
          {
            capacity: BI.from(7),
            lock: {
              codeHash: `0x08${"0".repeat(62)}`,
              hashType: "type",
              args: "0x09",
            },
          },
        ],
        outputsData: ["0x10"],
      },
      changeOutput: undefined,
      scriptInfos: [
        {
          name: "a",
          url: "b",
          scriptHash: `0x11${"0".repeat(62)}`,
          schema: "c",
          messageType: "d",
        },
      ],
      lockActions: [],
    },
  };

  test(".unpack(.pack)", () => {
    const output = BuildingPacket.unpack(
      BuildingPacket.pack(sampleBuildingPacket),
    );
    expect(output).toEqual(sampleBuildingPacket);
  });

  test(".getInputCell", () => {
    const cell = getInputCell(sampleBuildingPacket, 0);
    expect(cell).toEqual({
      cellInput: sampleBuildingPacket.value.payload.inputs[0],
      cellOutput: sampleBuildingPacket.value.resolvedInputs.outputs[0],
      data: sampleBuildingPacket.value.resolvedInputs.outputsData[0],
    });
  });

  test(".getOutputCell", () => {
    const cell = getOutputCell(sampleBuildingPacket, 0);
    expect(cell).toEqual({
      cellOutput: sampleBuildingPacket.value.payload.outputs[0],
      data: sampleBuildingPacket.value.payload.outputsData[0],
    });
  });
});
