import { blockchain } from "@ckb-lumos/base";
import { bytes } from "@ckb-lumos/codec";

import {
  chainTransformers,
  combineTransformers,
  combineTransactionTransformers,
  addLockAction,
  filterLockActions,
  addMessageAction,
  filterMessageActions,
  setChangeOutput,
  addScriptInfo,
  filterScriptInfos,
  setTransactionVersion,
  addInput,
  filterInputs,
  addOutput,
  filterOutputs,
  addWitness,
  filterWitnesses,
  addCellDep,
  addDistinctCellDep,
  filterCellDeps,
  addHeaderDep,
  addDistinctHeaderDep,
  filterHeaderDeps,
  updateMessageActionAt,
  updateLockActionAt,
  updateScriptInfoAt,
  updateInputAt,
  updateOutputAt,
  updateWitnessArgsAt,
  updateWitnessLayoutAt,
} from "../transformers";
import {
  makeByte32,
  makeAction,
  makeScriptInfo,
  makeCellInput,
  makeCellOutput,
  makeCellDep,
  makeBuildingPacket,
  makeWitnessArgs,
  makeSighashAllWitnessLayout,
} from "../building-packet-factory";
import { WitnessLayout } from "../building-packet";

const { WitnessArgs } = blockchain;

const BYTE32_ONE = makeByte32(1);

test("addLockAction", () => {
  const input = makeBuildingPacket();
  const action = makeAction({});
  const output = addLockAction(action)(input);
  expect(output).not.toBe(input);

  input.value.lockActions.push(action);
  expect(output).toStrictEqual(input);
});

test("filterLockActions", () => {
  const input = makeBuildingPacket();
  const actions = [makeAction({ data: "0x01" }), makeAction({ data: "0x02" })];
  const output = chainTransformers([
    ...actions.map(addLockAction),
    filterLockActions((e) => e.data === "0x01"),
  ])(input);
  expect(output).not.toBe(input);

  input.value.lockActions = actions.slice(0, 1);
  expect(output).toStrictEqual(input);
});

test("addMessageAction", () => {
  const input = makeBuildingPacket();
  const action = makeAction({});
  const output = addMessageAction(action)(input);
  expect(output).not.toBe(input);

  input.value.message.actions.push(action);
  expect(output).toStrictEqual(input);
});

test("filterLockActions", () => {
  const input = makeBuildingPacket();
  const actions = [makeAction({ data: "0x01" }), makeAction({ data: "0x02" })];
  const output = chainTransformers([
    ...actions.map(addMessageAction),
    filterMessageActions((e) => e.data === "0x01"),
  ])(input);
  expect(output).not.toBe(input);

  input.value.message.actions = actions.slice(0, 1);
  expect(output).toStrictEqual(input);
});

describe("setChangeOutput", () => {
  test("Some(1)", () => {
    const input = makeBuildingPacket();

    const output = setChangeOutput(1)(input);
    expect(output).not.toBe(input);

    input.value.changeOutput = 1;
    expect(output).toStrictEqual(input);
  });

  test("None", () => {
    const input = makeBuildingPacket();

    const output = chainTransformers([
      setChangeOutput(1),
      setChangeOutput(undefined),
    ])(input);
    expect(output).not.toBe(input);

    expect(output).toStrictEqual(input);
  });
});

describe("combineTransformers", () => {
  test("update changeOutput", () => {
    const input = makeBuildingPacket();

    const output = combineTransformers({ changeOutput: () => 1 })(input);
    expect(output).not.toBe(input);

    input.value.changeOutput = 1;
    expect(output).toStrictEqual(input);
  });
});

test("addScriptInfo", () => {
  const input = makeBuildingPacket();

  const scriptInfos = [
    makeScriptInfo({ name: "0x31" }),
    makeScriptInfo({ name: "0x32" }),
  ];
  const output = chainTransformers(scriptInfos.map(addScriptInfo))(input);
  expect(output).not.toBe(input);

  input.value.scriptInfos = scriptInfos;
  expect(output).toStrictEqual(input);
});

test("filterScriptInfos", () => {
  const input = makeBuildingPacket();
  const scriptInfos = [
    makeScriptInfo({ name: "0x31" }),
    makeScriptInfo({ name: "0x32" }),
  ];
  const output = chainTransformers([
    ...scriptInfos.map(addScriptInfo),
    filterScriptInfos((e) => e.name === "0x31"),
  ])(input);
  expect(output).not.toBe(input);

  input.value.scriptInfos = scriptInfos.slice(0, 1);
  expect(output).toStrictEqual(input);
});

describe("combineTransactionTransformers", () => {
  test("update version", () => {
    const input = makeBuildingPacket();

    const output = combineTransactionTransformers({ version: () => 1 })(input);
    expect(output).not.toBe(input);

    input.value.payload.version = 1;
    expect(output).toStrictEqual(input);
  });
});

test("setTransactionVersion", () => {
  const input = makeBuildingPacket();

  const output = setTransactionVersion(1)(input);
  expect(output).not.toBe(input);

  input.value.payload.version = 1;
  expect(output).toStrictEqual(input);
});

test("addInput", () => {
  const input = makeBuildingPacket();
  const item = {
    cellInput: makeCellInput({
      previousOutput: {
        index: 1,
      },
    }),
    cellOutput: makeCellOutput({ capacity: "0x100" }),
    data: "0x1",
  };

  const output = addInput(item)(input);
  expect(output).not.toBe(input);

  input.value.resolvedInputs = {
    outputs: [item.cellOutput],
    outputsData: [item.data],
  };
  input.value.payload.inputs = [item.cellInput];
  expect(output).toStrictEqual(input);
});

describe("filterInputs", () => {
  const item = {
    cellInput: makeCellInput({
      previousOutput: {
        index: 1,
      },
    }),
    cellOutput: makeCellOutput({ capacity: "0x100" }),
    data: "0x1",
  };
  test("matched", () => {
    const input = addInput(item)(makeBuildingPacket());
    const output = filterInputs(() => true)(input);
    expect(output).not.toBe(input);

    expect(output).toStrictEqual(input);
  });
  test("unmatched", () => {
    const input = addInput(item)(makeBuildingPacket());
    const output = filterInputs(() => false)(input);
    expect(output).not.toBe(input);

    input.value.resolvedInputs = { outputs: [], outputsData: [] };
    input.value.payload.inputs = [];
    expect(output).toStrictEqual(input);
  });
});

test("addOutput", () => {
  const item = makeCellOutput({ capacity: "0x100" });
  const input = makeBuildingPacket();
  const output = addOutput(item)(input);

  expect(output).not.toBe(input);

  input.value.payload.outputs = [item];
  expect(output).toStrictEqual(input);
});

test("filterOutputs", () => {
  const item = makeCellOutput({ capacity: "0x100" });
  const input = addOutput(item)(makeBuildingPacket());
  const output = filterOutputs(() => false)(input);

  expect(output).not.toBe(input);

  input.value.payload.outputs = [];
  expect(output).toStrictEqual(input);
});

test("addWitness", () => {
  const item = "0x01";
  const input = makeBuildingPacket();
  const output = addWitness(item)(input);

  expect(output).not.toBe(input);

  input.value.payload.witnesses = [item];
  expect(output).toStrictEqual(input);
});

test("filterWitnesses", () => {
  const item = makeCellOutput({ capacity: "0x100" });
  const input = addWitness(item)(makeBuildingPacket());
  const output = filterWitnesses(() => false)(input);

  expect(output).not.toBe(input);

  input.value.payload.witnesses = [];
  expect(output).toStrictEqual(input);
});

test("addCellDep", () => {
  const item = makeCellDep();
  const input = makeBuildingPacket();
  const output = chainTransformers([addCellDep(item), addCellDep(item)])(input);

  expect(output).not.toBe(input);

  input.value.payload.cellDeps = [item, item];
  expect(output).toStrictEqual(input);
});

test("addDistinctCellDep", () => {
  const item = makeCellDep();
  const input = makeBuildingPacket();
  const output = chainTransformers([
    addDistinctCellDep(item),
    addDistinctCellDep(item),
  ])(input);

  expect(output).not.toBe(input);

  input.value.payload.cellDeps = [item];
  expect(output).toStrictEqual(input);
});

test("filterCellDeps", () => {
  const item = makeCellDep();
  const input = chainTransformers([addCellDep(item), addCellDep(item)])(
    makeBuildingPacket(),
  );
  const output = filterCellDeps(() => false)(input);

  expect(output).not.toBe(input);

  input.value.payload.cellDeps = [];
  expect(output).toStrictEqual(input);
});

test("addHeaderDep", () => {
  const item = BYTE32_ONE;
  const input = makeBuildingPacket();
  const output = addHeaderDep(item)(input);

  expect(output).not.toBe(input);

  input.value.payload.headerDeps = [item];
  expect(output).toStrictEqual(input);
});

test("addDistinctHeaderDep", () => {
  const item = makeCellDep({ depType: "type" });
  const input = makeBuildingPacket();
  const output = chainTransformers([
    addHeaderDep(item),
    addDistinctHeaderDep(item),
  ])(input);

  expect(output).not.toBe(input);

  input.value.payload.headerDeps = [item];
  expect(output).toStrictEqual(input);
});

test("filterHeaderDeps", () => {
  const item = BYTE32_ONE;
  const input = addHeaderDep(item)(makeBuildingPacket());
  const output = filterHeaderDeps(() => false)(input);

  expect(output).not.toBe(input);

  input.value.payload.headerDeps = [];
  expect(output).toStrictEqual(input);
});

test("updateMessageActionAt", () => {
  const item = makeAction();
  const input = addMessageAction(item)(makeBuildingPacket());
  const output = updateMessageActionAt(0, (action) => ({
    ...action,
    data: "0x1",
  }))(input);

  expect(output).not.toBe(input);

  item.data = "0x1";
  input.value.message.actions = [item];
  expect(output).toStrictEqual(input);
});

test("updateLockActionAt", () => {
  const item = makeAction();
  const input = addLockAction(item)(makeBuildingPacket());
  const output = updateLockActionAt(0, (action) => ({
    ...action,
    data: "0x1",
  }))(input);

  expect(output).not.toBe(input);

  item.data = "0x1";
  input.value.lockActions = [item];
  expect(output).toStrictEqual(input);
});

test("updateScriptInfoAt", () => {
  const item = makeScriptInfo();
  const input = addScriptInfo(item)(makeBuildingPacket());
  const output = updateScriptInfoAt(0, (scriptInfo) => ({
    ...scriptInfo,
    name: "0x31",
  }))(input);

  expect(output).not.toBe(input);

  item.name = "0x31";
  input.value.scriptInfos = [item];
  expect(output).toStrictEqual(input);
});

test("updateInputAt", () => {
  const item = {
    cellInput: makeCellInput({
      previousOutput: {
        index: 1,
      },
    }),
    cellOutput: makeCellOutput({ capacity: "0x100" }),
    data: "0x1",
  };
  const input = addInput(item)(makeBuildingPacket());

  const output = updateInputAt(0, (e) => ({
    ...e,
    cellInput: {
      ...e.cellInput,
      previousOutput: {
        ...e.cellInput.previousOutput,
        index: 2,
      },
    },
  }))(input);
  expect(output).not.toBe(input);

  input.value.payload.inputs[0].previousOutput.index = 2;
  expect(output).toStrictEqual(input);
});

test("updateOutputAt", () => {
  const item = makeCellOutput({ capacity: "0x100" });
  const input = addOutput(item)(makeBuildingPacket());

  const output = updateOutputAt(0, (e) => ({
    ...e,
    capacity: "0x200",
  }))(input);
  expect(output).not.toBe(input);

  input.value.payload.outputs[0].capacity = "0x200";
  expect(output).toStrictEqual(input);
});

test("updateWitnessArgsAt", () => {
  const input = addWitness("0x")(makeBuildingPacket());
  const output = updateWitnessArgsAt(0, (e) => ({
    ...e,
    lock: "0x",
  }))(input);
  expect(output).not.toBe(input);

  input.value.payload.witnesses[0] = bytes.hexify(
    WitnessArgs.pack(makeWitnessArgs({ lock: "0x" })),
  );
  expect(output).toStrictEqual(input);
});

test("updateWitnessLayoutAt", () => {
  const input = addWitness("0x")(makeBuildingPacket());
  const output = updateWitnessLayoutAt(0, (e) => ({
    ...e,
    value: {
      ...e.value,
      seal: "0x01",
    },
  }))(input);
  expect(output).not.toBe(input);

  input.value.payload.witnesses[0] = bytes.hexify(
    WitnessLayout.pack(makeSighashAllWitnessLayout({ seal: "0x01" })),
  );
  expect(output).toStrictEqual(input);
});
