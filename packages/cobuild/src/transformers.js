import { blockchain } from "@ckb-lumos/base";
import { bytes } from "@ckb-lumos/codec";

import { WitnessLayout } from "./building-packet";
import {
  makeDefaultWitnessLayout,
  makeWitnessArgs,
} from "./building-packet-factory";

const { WitnessArgs } = blockchain;

/**
 * A dummy transformer that returns the input building packet.
 */
export function identity(buildingPacket) {
  return buildingPacket;
}

export function assign(assignments) {
  return (buildingPacket) => ({
    type: buildingPacket.type,
    value: {
      ...buildingPacket.value,
      ...assignments,
    },
  });
}

export function assignPayload(payloadAssignments) {
  return (buildingPacket) => ({
    type: buildingPacket.type,
    value: {
      ...buildingPacket.value,
      payload: {
        ...buildingPacket.value.payload,
        ...payloadAssignments,
      },
    },
  });
}

/**
 * Create a transfomer that applies the child transfomers in sequence.
 */
export function chainTransformers(transformers) {
  return (buildingPacket) =>
    transformers.reduce(
      (prev, transformer) => transformer(prev),
      buildingPacket,
    );
}

export function combineTransformers(transformersMap) {
  return (buildingPacket) => {
    const newFields = {};
    let changed = false;
    for (const [key, transformer] of Object.entries(transformersMap)) {
      const oldValue = buildingPacket.value[key];
      const newValue = transformer(oldValue);
      if (oldValue !== newValue) {
        changed = true;
        newFields[key] = newValue;
      }
    }
    return changed ? assign(newFields)(buildingPacket) : buildingPacket;
  };
}

export function combineTransactionTransformers(transactionTransformersMap) {
  return (buildingPacket) => {
    const newFields = {};
    let changed = false;
    for (const [key, transformer] of Object.entries(
      transactionTransformersMap,
    )) {
      const oldValue = buildingPacket.value.payload[key];
      const newValue = transformer(oldValue);
      if (oldValue !== newValue) {
        changed = true;
        newFields[key] = newValue;
      }
    }
    return changed ? assignPayload(newFields)(buildingPacket) : buildingPacket;
  };
}

export function addLockAction(action) {
  return (buildingPacket) => ({
    type: buildingPacket.type,
    value: {
      ...buildingPacket.value,
      lockActions: [...buildingPacket.value.lockActions, action],
    },
  });
}

/**
 * Return a transformer to filter the lock actions and leave only the ones pass the predicate.
 *
 * - predicate: `(Action) => boolean`
 */
export function filterLockActions(predicate) {
  return (buildingPacket) => ({
    type: buildingPacket.type,
    value: {
      ...buildingPacket.value,
      lockActions: buildingPacket.value.lockActions.filter(predicate),
    },
  });
}

export function addMessageAction(action) {
  return (buildingPacket) => ({
    type: buildingPacket.type,
    value: {
      ...buildingPacket.value,
      message: {
        actions: [...buildingPacket.value.message.actions, action],
      },
    },
  });
}

/**
 * Return a transformer to filter the message actions and leave only the ones pass the predicate.
 *
 * - predicate: `(Action) => boolean`
 */
export function filterMessageActions(predicate) {
  return (buildingPacket) => ({
    type: buildingPacket.type,
    value: {
      ...buildingPacket.value,
      message: {
        actions: buildingPacket.value.message.actions.filter(predicate),
      },
    },
  });
}

export function setChangeOutput(changeOutput) {
  return (buildingPacket) => ({
    type: buildingPacket.type,
    value: {
      ...buildingPacket.value,
      changeOutput,
    },
  });
}

/**
 * Return a transformer to add the given script info to the building packet.
 */
export function addScriptInfo(scriptInfo) {
  return (buildingPacket) => ({
    type: buildingPacket.type,
    value: {
      ...buildingPacket.value,
      scriptInfos: [...buildingPacket.value.scriptInfos, scriptInfo],
    },
  });
}

/**
 * Return a transformer to filter the script infos and leave only the ones pass the predicate.
 *
 * - predicate: `(ScriptInfo) => boolean`
 */
export function filterScriptInfos(predicate) {
  return (buildingPacket) => ({
    type: buildingPacket.type,
    value: {
      ...buildingPacket.value,
      scriptInfos: buildingPacket.value.scriptInfos.filter(predicate),
    },
  });
}

export function setTransactionVersion(version) {
  return combineTransactionTransformers({ version: () => version });
}

/**
 * Add a cellInput to the transactio inputs and add its resolved cellOutput and data to resolvedInputs
 */
export function addInput({ cellInput, cellOutput, data }) {
  return (buildingPacket) => ({
    type: buildingPacket.type,
    value: {
      ...buildingPacket.value,
      payload: {
        ...buildingPacket.value.payload,
        inputs: [...buildingPacket.value.payload.inputs, cellInput],
      },
      resolvedInputs: {
        outputs: [...buildingPacket.value.resolvedInputs.outputs, cellOutput],
        outputsData: [...buildingPacket.value.resolvedInputs.outputsData, data],
      },
    },
  });
}

/**
 * Filter inputs as well as the resolved inputs.
 *
 * - predicate: ({ cellInput: CellInput, cellOutput: CellOutput, data: Bytes}) => boolean
 */
export function filterInputs(predicate) {
  return (buildingPacket) => {
    const resolvedInputs = buildingPacket.value.resolvedInputs;
    const inputs = buildingPacket.value.payload.inputs;
    const filtered = inputs
      .map((cellInput, i) => ({
        cellInput,
        cellOutput: resolvedInputs.outputs[i],
        data: resolvedInputs.outputsData[i],
      }))
      .filter(predicate);
    return {
      type: buildingPacket.type,
      value: {
        ...buildingPacket.value,
        payload: {
          ...buildingPacket.value.payload,
          inputs: filtered.map(({ cellInput }) => cellInput),
        },
        resolvedInputs: {
          outputs: filtered.map(({ cellOutput }) => cellOutput),
          outputsData: filtered.map(({ data }) => data),
        },
      },
    };
  };
}

export function addOutput(cellOutput) {
  return combineTransactionTransformers({
    outputs: (outputs) => [...outputs, cellOutput],
  });
}

export function filterOutputs(predicate) {
  return combineTransactionTransformers({
    outputs: (outputs) => outputs.filter(predicate),
  });
}

export function addWitness(witness) {
  return combineTransactionTransformers({
    witnesses: (witnesses) => [...witnesses, witness],
  });
}

export function filterWitnesses(predicate) {
  return combineTransactionTransformers({
    witnesses: (witnesses) => witnesses.filter(predicate),
  });
}

export function addCellDep(cellDep) {
  return combineTransactionTransformers({
    cellDeps: (cellDeps) => [...cellDeps, cellDep],
  });
}

export function cellDepEquals(a, b) {
  return (
    a.depType === b.depType &&
    a.outPoint.txHash === b.outPoint.txHash &&
    a.outPoint.index === b.outPoint.index
  );
}

export function addDistinctCellDep(cellDep) {
  return combineTransactionTransformers({
    cellDeps: (cellDeps) =>
      cellDeps.find((e) => cellDepEquals(e, cellDep)) === undefined
        ? [...cellDeps, cellDep]
        : cellDeps,
  });
}

export function filterCellDeps(predicate) {
  return combineTransactionTransformers({
    cellDeps: (cellDeps) => cellDeps.filter(predicate),
  });
}

export function addHeaderDep(blockHash) {
  return combineTransactionTransformers({
    headerDeps: (headerDeps) => [...headerDeps, blockHash],
  });
}

export function addDistinctHeaderDep(blockHash) {
  return combineTransactionTransformers({
    headerDeps: (headerDeps) =>
      headerDeps.indexOf(blockHash) === -1
        ? [...headerDeps, blockHash]
        : headerDeps,
  });
}

export function filterHeaderDeps(predicate) {
  return combineTransactionTransformers({
    headerDeps: (headerDeps) => headerDeps.filter(predicate),
  });
}

function updateAt(array, index, transfomer) {
  const oldValue = array[index];
  const newValue = transfomer(oldValue);
  if (newValue !== oldValue) {
    const newArray = [...array];
    newArray[index] = newValue;
    return newArray;
  }
  return array;
}

export function updateMessageActionAt(index, transformer) {
  return (buildingPacket) => {
    const actions = buildingPacket.value.message.actions;
    const newActions = updateAt(actions, index, transformer);
    if (newActions !== actions) {
      return {
        type: buildingPacket.type,
        value: {
          ...buildingPacket.value,
          message: {
            actions: newActions,
          },
        },
      };
    }

    return buildingPacket;
  };
}

export function updateLockActionAt(index, transformer) {
  return combineTransformers({
    lockActions: (lockActions) => updateAt(lockActions, index, transformer),
  });
}

export function updateScriptInfoAt(index, transformer) {
  return combineTransformers({
    scriptInfos: (scriptInfos) => updateAt(scriptInfos, index, transformer),
  });
}

export function updateInputAt(index, transformer) {
  return (buildingPacket) => {
    const oldResolvedInputs = buildingPacket.value.resolvedInputs;
    const oldPayload = buildingPacket.value.payload;

    const old = {
      cellInput: oldPayload.inputs[index],
      cellOutput: oldResolvedInputs.outputs[index],
      data: oldResolvedInputs.outputsData[index],
    };
    const { cellInput, cellOutput, data } = transformer(old);

    const resolvedInputs =
      cellOutput !== old.cellOutput || data !== old.data
        ? {
            outputs: updateAt(
              oldResolvedInputs.outputs,
              index,
              () => cellOutput,
            ),
            outputsData: updateAt(
              oldResolvedInputs.outputsData,
              index,
              () => data,
            ),
          }
        : oldResolvedInputs;
    const payload =
      cellInput !== old.cellInput
        ? {
            ...oldPayload,
            inputs: updateAt(oldPayload.inputs, index, () => cellInput),
          }
        : oldPayload;

    return resolvedInputs !== oldResolvedInputs || payload !== oldPayload
      ? {
          type: buildingPacket.type,
          value: {
            ...buildingPacket.value,
            resolvedInputs,
            payload,
          },
        }
      : buildingPacket;
  };
}

export function updateOutputAt(index, transformer) {
  return combineTransactionTransformers({
    outputs: (outputs) => updateAt(outputs, index, transformer),
  });
}

export function updateWitnessArgsAt(index, transformer) {
  const wrappedTransformer = (witness) => {
    const old =
      witness !== "0x" ? WitnessArgs.unpack(witness) : makeWitnessArgs();
    const unpacked = transformer(old);
    return unpacked !== old || witness === "0x"
      ? bytes.hexify(WitnessArgs.pack(unpacked))
      : witness;
  };

  return combineTransactionTransformers({
    witnesses: (witnesses) => updateAt(witnesses, index, wrappedTransformer),
  });
}

export function updateWitnessLayoutAt(index, transformer) {
  const wrappedTransformer = (witness) => {
    const old =
      witness !== "0x"
        ? WitnessLayout.unpack(witness)
        : makeDefaultWitnessLayout();
    const unpacked = transformer(old);
    return unpacked !== old || witness === "0x"
      ? bytes.hexify(WitnessLayout.pack(unpacked))
      : witness;
  };

  return combineTransactionTransformers({
    witnesses: (witnesses) => updateAt(witnesses, index, wrappedTransformer),
  });
}
