import { PackParam, molecule, number, bytes } from "@ckb-lumos/codec";
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

  const Counter = definePapp({
    actionDataCodec: ActionData,
    actionCreators: { set },
  });

  const actionData = Counter.actionCreators.set(1);
  expect(bytes.hexify(Counter.actionDataCodec.pack(actionData))).toEqual(
    "0x0c0000000800000001000000",
  );
});
