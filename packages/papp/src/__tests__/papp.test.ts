import { PackParam, molecule, number, bytes } from "@ckb-lumos/codec";
import { recipes } from "@ckb-cobuild/cobuild";
import { definePapp } from "../papp";

test("example", () => {
  const ActionData = molecule.table(
    {
      value: number.Uint32,
    },
    ["value"],
  );
  function set(value: number): PackParam<typeof ActionData> {
    return { value };
  }

  function addAction(actionData: PackParam<typeof ActionData>) {
    return (buildingPacket: recipes.BuildingPacketDraft) => {
      buildingPacket.value.message.actions.push({
        scriptHash: "0x",
        scriptInfoHash: "0x",
        data: bytes.hexify(ActionData.pack(actionData)),
      });
    };
  }

  const Counter = definePapp({
    actionDataCodec: ActionData,
    actionCreators: { set },
    recipes: { addAction },
  });

  const actionData = Counter.actionCreators.set(1);
  expect(bytes.hexify(Counter.actionDataCodec.pack(actionData))).toEqual(
    "0x0c0000000800000001000000",
  );
});
