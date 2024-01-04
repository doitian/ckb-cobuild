import { BuildingPacket } from "../building-packet";

describe("BuildingPacket", () => {
  test("unpack(pack(default))", () => {
    const input = {
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

    const output = BuildingPacket.unpack(BuildingPacket.pack(input as any));
    expect(output).toEqual(input);
  });
});
