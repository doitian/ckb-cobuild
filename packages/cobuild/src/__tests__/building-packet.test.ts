import { BuildingPacket, BuildingPacketUnpackResult } from "../building-packet";

describe("BuildingPacket", () => {
  test("unpack(pack(default))", () => {
    const input: BuildingPacketUnpackResult = {
      type: "BuildingPacketV1",
      value: {
        message: {
          actions: [],
        },
        payload: {
          version: 0,
          inputs: [],
          outputs: [],
          outputsData: [],
          cellDeps: [],
          headerDeps: [],
          witnesses: [],
        },
        resolvedInputs: {
          outputs: [],
          outputsData: [],
        },
        changeOutput: undefined,
        scriptInfos: [],
        lockActions: [],
      },
    };

    const output = BuildingPacket.unpack(BuildingPacket.pack(input));
    expect(output).toEqual(input);
  });
});
