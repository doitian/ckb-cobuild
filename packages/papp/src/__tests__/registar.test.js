import { utils as lumosBaseUtils } from "@ckb-lumos/base";

import {
  makeByte32,
  makeScript,
  makeAction,
  makeBuildingPacket,
} from "@ckb-cobuild/cobuild/building-packet-factory";
import * as transformers from "@ckb-cobuild/cobuild/transformers";

import { Registar } from "../registar";
import { createDeploymentFromCell } from "../deployment";

const { computeScriptHash } = lumosBaseUtils;
const jest = import.meta.jest;

function seedToData(seed) {
  const hex = seed.toString(16);
  if (hex.length % 2 !== 0) {
    return `0x0${hex}`;
  }
  return `0x${hex}`;
}

function makePapp(name, seed) {
  const txHash = makeByte32(seed++);
  const scriptCellLockScript = makeScript({ args: seedToData(seed++) });
  const scriptCellTypeScript = makeScript({ args: seedToData(seed++) });
  const apiMock = jest.fn();
  const willAddMock = jest.fn();
  const didAddMock = jest.fn();
  const willEstimateFeeMock = jest.fn();
  const willSealMock = jest.fn();
  const didSealMock = jest.fn();
  const deployment = createDeploymentFromCell({
    outPoint: {
      txHash,
      index: 0,
    },
    cellOutput: {
      capacity: 100,
      lock: scriptCellLockScript,
      type: scriptCellTypeScript,
    },
    data: seedToData(seed++),
  });
  return {
    name,
    deployment,
    actionCreators: {
      api: apiMock,
      willAdd: willAddMock,
    },
    reducers: {
      didAdd: () => didAddMock,
      willEstimateFee: () => willEstimateFeeMock,
      willSeal: () => willSealMock,
      didSeal: () => didSealMock,
    },
  };
}

function makeCellForPapps(lockPapp, typePapp, seed, preferType) {
  const lock = preferType
    ? {
        codeHash: lockPapp.deployment.typeHash,
        hashType: "type",
        args: seedToData(seed++),
      }
    : {
        codeHash: lockPapp.deployment.datahHash,
        hashType: "data",
        args: seedToData(seed++),
      };
  const type = typePapp
    ? preferType
      ? {
          codeHash: typePapp.deployment.typeHash,
          hashType: "type",
          args: seedToData(seed++),
        }
      : {
          codeHash: typePapp.deployment.datahHash,
          hashType: "data",
          args: seedToData(seed++),
        }
    : undefined;

  return {
    outPoint: {
      txHash: makeByte32(seed++),
      index: 0,
    },
    cellOutput: {
      capacity: 100,
      lock,
      type,
    },
    data: "0x",
  };
}

function makeActionForPapp(cellOutput, kind, seed) {
  const script = cellOutput[kind];
  const scriptHash = computeScriptHash(script);

  return makeAction({
    scriptHash,
    data: seedToData(seed++),
  });
}

describe("Registar", () => {
  const lockPapp = makePapp("lock", 100);
  const typePapp = makePapp("type", 200);

  const createRegistar = () => {
    const registar = new Registar();
    registar.register(lockPapp);
    registar.register(typePapp);
    return registar;
  };

  test(".getPappByName", () => {
    const registar = createRegistar();
    const papp = registar.getPappByName("lock");
    expect(papp).toBe(lockPapp);
  });

  describe(".prepareActions", () => {
    test("for lock papp", () => {
      const registar = createRegistar();
      const cell = makeCellForPapps(lockPapp, undefined, 300, true);
      const action = makeActionForPapp(cell.cellOutput, "lock", 400);
      const input = transformers.addInput(cell)(makeBuildingPacket());
      const inputWithAction = transformers.addLockAction(action)(input);
      lockPapp.actionCreators.willAdd.mockImplementation(() => action);
      lockPapp.reducers.didAdd().mockImplementation((bp) => bp);
      const output = registar.prepareActions(input);
      expect(lockPapp.reducers.didAdd()).toHaveBeenCalledWith(
        inputWithAction,
        action,
      );
      expect(output.value.lockActions.length).toBe(1);
    });
    test("for lock papp", () => {
      const registar = createRegistar();
      const cell = makeCellForPapps(lockPapp, typePapp, 300, true);
      const lockAction = makeActionForPapp(cell.cellOutput, "lock", 400);
      const typeAction = makeActionForPapp(cell.cellOutput, "type", 400);
      const input = transformers.addInput(cell)(makeBuildingPacket());
      const inputWithActions = transformers.chainTransformers([
        transformers.addLockAction(lockAction),
        transformers.addMessageAction(typeAction),
      ])(input);
      lockPapp.actionCreators.willAdd.mockImplementation(() => lockAction);
      lockPapp.reducers.didAdd().mockImplementation((bp) => bp);
      typePapp.actionCreators.willAdd.mockImplementation(() => typeAction);
      typePapp.reducers.didAdd().mockImplementation((bp) => bp);
      const output = registar.prepareActions(input);
      expect(typePapp.reducers.didAdd()).toHaveBeenCalledWith(
        inputWithActions,
        typeAction,
      );
      expect(output.value.lockActions.length).toBe(1);
      expect(output.value.message.actions.length).toBe(1);
    });
  });

  describe(".addPappAction", () => {
    const registar = createRegistar();
    const cell = makeCellForPapps(lockPapp, typePapp, 300, true);
    const typeAction = makeActionForPapp(cell.cellOutput, "type", 400);
    typePapp.actionCreators.api.mockImplementation(() => typeAction);
    typePapp.reducers.didAdd().mockImplementation((bp) => bp);
    const addPappAction = registar.addPappAction("type", "type", "api");
    const input = makeBuildingPacket();
    const inputWithActions = transformers.addMessageAction(typeAction)(input);
    const output = addPappAction(input);
    expect(typePapp.reducers.didAdd()).toHaveBeenCalledWith(
      inputWithActions,
      typeAction,
    );
    expect(output.value.message.actions.length).toBe(1);
  });
});
