import { utils as lumosBaseUtils } from "@ckb-lumos/base";

const { computeScriptHash } = lumosBaseUtils;

function makeNewScriptGroup(kind, scriptHash) {
  return { kind, scriptHash, inputIndices: [], outputIndices: [] };
}

export function getScriptForGroup(
  buildingPacket,
  { kind, inputIndices, outputIndices },
) {
  return inputIndices.length > 0
    ? buildingPacket.value.resolvedInputs.outputs[inputIndices[0]][kind]
    : buildingPacket.value.payload.outputs[outputIndices[0]][kind];
}

export function createScriptGroupForAction(buildingPacket, action) {
  const scriptHash = action.scriptHash;
  const group = { scriptHash, inputIndices: [], outputIndices: [] };

  for (const [
    i,
    cellOutput,
  ] of buildingPacket.value.resolvedInputs.outputs.entries()) {
    const lockScriptHash = computeScriptHash(cellOutput.lock);
    if (lockScriptHash === scriptHash) {
      group.inputIndices.push(i);
    }
  }
  if (group.inputIndices.length > 0) {
    group.kind = "lock";
    return group;
  }

  group.kind = "type";
  for (const [
    i,
    cellOutput,
  ] of buildingPacket.value.resolvedInputs.outputs.entries()) {
    if (cellOutput.type !== null && cellOutput.type !== undefined) {
      const typeScriptHash = computeScriptHash(cellOutput.type);
      if (typeScriptHash === scriptHash) {
        group.inputIndices.push(i);
      }
    }
  }

  for (const [
    i,
    cellOutput,
  ] of buildingPacket.value.payload.outputs.entries()) {
    if (cellOutput.type !== null && cellOutput.type !== undefined) {
      const typeScriptHash = computeScriptHash(cellOutput.type);
      if (typeScriptHash === scriptHash) {
        group.outputIndices.push(i);
      }
    }
  }

  return group.inputIndices.length > 0 || group.outputIndices.length > 0
    ? group
    : undefined;
}

export function findActionForGroup(buildingPacket, { kind, scriptHash }) {
  const actions =
    kind === "lock"
      ? buildingPacket.value.lockActions
      : kind === "type"
        ? buildingPacket.value.message.actions
        : [];

  return actions.find((e) => e.scriptHash === scriptHash);
}

export function groupScripts(buildingPacket) {
  let groups = {};
  for (const [
    i,
    cellOutput,
  ] of buildingPacket.value.resolvedInputs.outputs.entries()) {
    const lockScriptHash = computeScriptHash(cellOutput.lock);
    const lockGroupKey = `lock:${lockScriptHash}`;
    const lockGroup = (groups[lockGroupKey] =
      groups[lockGroupKey] ?? makeNewScriptGroup("lock", lockScriptHash));
    lockGroup.inputIndices.push(i);

    if (cellOutput.type !== null && cellOutput.type !== undefined) {
      const typeScriptHash = computeScriptHash(cellOutput.type);
      const typeGroupKey = `type:${typeScriptHash}`;
      const typeGroup = (groups[typeGroupKey] =
        groups[typeGroupKey] ?? makeNewScriptGroup("type", typeScriptHash));
      typeGroup.inputIndices.push(i);
    }
  }

  for (const [
    i,
    cellOutput,
  ] of buildingPacket.value.payload.outputs.entries()) {
    if (cellOutput.type !== null && cellOutput.type !== undefined) {
      const typeScriptHash = computeScriptHash(cellOutput.type);
      const typeGroupKey = `type:${typeScriptHash}`;
      const typeGroup = (groups[typeGroupKey] =
        groups[typeGroupKey] ?? makeNewScriptGroup("type", typeScriptHash));
      typeGroup.outputIndices.push(i);
    }
  }

  return Object.values(groups);
}

export default groupScripts;
