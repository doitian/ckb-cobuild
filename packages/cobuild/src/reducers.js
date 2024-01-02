/**
 * A reducer creates a new building packet. It's RECOMMENDED to not modify the input building packet to ease debugging.
 *
 * ```
 * (BuildingPacket, Action) => BuildingPacket
 * async (BuildingPacket, Action) => BuildingPacket
 * ```
 */

import * as transformers from "./transformers";

/**
 * A dummy reducer which does nothing to the building packet.
 */
export function passThrough(buildingPacket) {
  return buildingPacket
}

/**
 * Add an action as a new lock action.
 */
export function addLockAction(buildingPacket, action) {
  return transformers.addLockAction(action)(buildingPacket);
}

/**
 * Add an action as a new message action.
 */
export function addMessageAction(buildingPacket, action) {
  return transformers.addMessageAction(action)(buildingPacket);
}

export function filterReducerByAction({ predicate, reducer }) {
  return (buildingPacket, action) =>
    predicate(action) ? reducer(buildingPacket, action) : buildingPacket;
}

export function chainReducers(reducers) {
  return (buildingPacket, action) =>
    reducers.reduce((prev, reducer) => reducer(prev, action), buildingPacket);
}

export function chainAsyncReducers(reducers) {
  return async (buildingPacket, action) => {
    let prev = buildingPacket;
    for (const reducer of reducers) {
      prev = await reducer(prev, action);
    }
    return prev;
  };
}

// Create a reducer which finds a matched child reducer by script info hash.
export function combineReducers(reducersMap) {
  return (buildingPacket, action) => {
    const reducer = reducersMap[action.scriptInfoHash];
    return reducer !== undefined
      ? reducer(buildingPacket, action)
      : buildingPacket;
  };
}
