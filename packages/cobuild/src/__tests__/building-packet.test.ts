import { BI } from "@ckb-lumos/bi";
import {
  BuildingPacket,
  getInputCell,
  getOutputCell,
} from "../building-packet";
import { makeByte32 } from "../factory";

describe("BuildingPacket", () => {
  const sampleBuildingPacket: BuildingPacket = {
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
              txHash: makeByte32(1),
              index: 2,
            },
          },
        ],
        outputs: [
          {
            capacity: BI.from(3),
            lock: {
              codeHash: makeByte32(4),
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
              codeHash: makeByte32(8),
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
          scriptHash: makeByte32(11),
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
