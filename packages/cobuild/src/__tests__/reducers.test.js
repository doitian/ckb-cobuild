import {
  passThrough,
  addLockAction,
  addMessageAction,
  filterReducerByAction,
  chainReducers,
  chainAsyncReducers,
  combineReducers,
} from "../reducers";
import {
  makeByte32,
  makeAction,
  makeBuildingPacket,
} from "../building-packet-factory";

const BYTE32_ONE = makeByte32(1);
const BYTE32_TWO = makeByte32(2);

test("passThrough", () => {
  const input = makeBuildingPacket();
  const output = passThrough(input, makeAction({}));
  expect(output).toBe(input);
});

test("addLockAction", () => {
  const input = makeBuildingPacket();
  const action = makeAction({});
  const output = addLockAction(input, action);
  expect(output).not.toBe(input);

  input.value.lockActions.push(action);
  expect(output).toStrictEqual(input);
});

test("addMessageAction", () => {
  const input = makeBuildingPacket();
  const action = makeAction({});
  const output = addMessageAction(input, action);
  expect(output).not.toBe(input);

  input.value.message.actions.push(action);
  expect(output).toStrictEqual(input);
});

describe("filterReducerFactory", () => {
  const input = makeBuildingPacket();
  const action = makeAction({});

  test("predicate returns true", () => {
    const reducer = filterReducerByAction({
      predicate: () => true,
      reducer: addLockAction,
    });
    const output = reducer(input, action);
    expect(output).not.toBe(input);

    input.value.lockActions.push(action);
    expect(output).toStrictEqual(input);
  });

  test("predicate returns false", () => {
    const reducer = filterReducerByAction({
      predicate: () => false,
      reducer: addLockAction,
    });
    const output = reducer(input, action);
    expect(output).toBe(input);
  });
});

test("chainReducersFactory", () => {
  const input = makeBuildingPacket();
  const action = makeAction({});
  const reducer = chainReducers([addLockAction, addMessageAction]);
  const output = reducer(input, action);

  expect(output).not.toBe(input);

  input.value.lockActions.push(action);
  input.value.message.actions.push(action);
  expect(output).toStrictEqual(input);
});

test("chainAsyncReducersFactory", async () => {
  const input = makeBuildingPacket();
  const action = makeAction({});

  const actionTag1 = makeAction({ data: "0x01" });
  // ensure reducer1 runs first enen it is slower than reducer2
  const reducer1 = (makeAction) =>
    new Promise((resolve) =>
      setTimeout(() => resolve(addLockAction(makeAction, actionTag1)), 300),
    );

  const actionTag2 = makeAction({ data: "0x02" });
  const reducer2 = (makeAction) =>
    Promise.resolve(addLockAction(makeAction, actionTag2));

  const reducer = chainAsyncReducers([reducer1, reducer2]);
  const output = await reducer(input, action);

  expect(output).not.toBe(input);

  input.value.lockActions.push(actionTag1);
  input.value.lockActions.push(actionTag2);
  expect(output).toStrictEqual(input);
});

describe("combineReducersFactory", () => {
  const input = makeBuildingPacket();
  const action1 = makeAction({ scriptInfoHash: BYTE32_ONE });
  const action2 = makeAction({ scriptInfoHash: BYTE32_TWO });
  const reducer = combineReducers({
    [BYTE32_ONE]: addLockAction,
    [BYTE32_TWO]: addMessageAction,
  });

  test("action1", () => {
    const output = reducer(input, action1);
    expect(output).not.toBe(input);

    input.value.lockActions.push(action1);
    expect(output).toStrictEqual(input);
  });

  test("action2", () => {
    const output = reducer(input, action2);
    expect(output).not.toBe(input);

    input.value.message.actions.push(action2);
    expect(output).toStrictEqual(input);
  });
});
