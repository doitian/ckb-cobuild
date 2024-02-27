import {
  BuildingPacket,
  StringCodec,
  getInputCell,
  getOutputCell,
} from "../building-packet";
import { makeByte32 } from "../factory";
import { toJson } from "@ckb-cobuild/molecule";

describe("BuildingPacket", () => {
  const sampleBuildingPacket: BuildingPacket = {
    type: "BuildingPacketV1",
    value: {
      message: {
        actions: [],
      },
      payload: {
        hash: new Uint8Array(32),
        version: 0,
        inputs: [
          {
            since: 0n,
            previous_output: {
              tx_hash: makeByte32(1),
              index: 2,
            },
          },
        ],
        outputs: [
          {
            capacity: 3n,
            lock: {
              code_hash: makeByte32(4),
              hash_type: "type",
              args: Uint8Array.of(5),
            },
            type: null,
          },
        ],
        outputs_data: [Uint8Array.of(6)],
        cell_deps: [],
        header_deps: [],
        witnesses: [],
      },
      resolved_inputs: {
        outputs: [
          {
            capacity: 7n,
            lock: {
              code_hash: makeByte32(8),
              hash_type: "type",
              args: Uint8Array.of(9),
            },
            type: null,
          },
        ],
        outputs_data: [Uint8Array.of(10)],
      },
      change_output: null,
      script_infos: [
        {
          name: "a",
          url: "b",
          script_hash: makeByte32(11),
          schema: "c",
          message_type: "d",
        },
      ],
      lock_actions: [],
    },
  };

  test(".unpack(.pack)", () => {
    const output = BuildingPacket.unpack(
      BuildingPacket.pack(sampleBuildingPacket),
    );
    output.value.payload.hash = sampleBuildingPacket.value.payload.hash;
    expect(toJson(output)).toEqual(toJson(sampleBuildingPacket));
  });

  test(".getInputCell", () => {
    const cell = getInputCell(sampleBuildingPacket, 0);
    expect(cell).toEqual({
      cellInput: sampleBuildingPacket.value.payload.inputs[0],
      cellOutput: sampleBuildingPacket.value.resolved_inputs.outputs[0],
      data: sampleBuildingPacket.value.resolved_inputs.outputs_data[0],
    });
  });

  test(".getOutputCell", () => {
    const cell = getOutputCell(sampleBuildingPacket, 0);
    expect(cell).toEqual({
      cellOutput: sampleBuildingPacket.value.payload.outputs[0],
      data: sampleBuildingPacket.value.payload.outputs_data[0],
    });
  });
});

describe("StringCodec", () => {
  test.each([
    [null, false],
    [undefined, false],
    [0, false],
    ["", true],
    ["。", true],
  ])(".safeParse(%s)", (input, success) => {
    const result = StringCodec.safeParse(input as string);
    expect(result.success).toEqual(success);
    if (result.success) {
      expect(result.data).toEqual(input);
    } else {
      expect(result.error.toString()).toMatch(
        `Expect string got ${typeof input}`,
      );
    }
  });
});
