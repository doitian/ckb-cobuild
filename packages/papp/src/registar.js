import { utils as lumosBaseUtils } from "@ckb-lumos/base";

import * as transformers from "@ckb-cobuild/cobuild-es/transformers";

import {
  groupScripts,
  getScriptForGroup,
  findActionForGroup,
} from "./script-group";
import { createScriptInfoFromHumanTemplate } from "./script-info";

const { computeScriptHash } = lumosBaseUtils;

// Registar use the registered papps to process building packet.
export class Registar {
  constructor() {
    this.papps = {
      byDataHash: {},
      byTypeHash: {},
      byName: {},
    };
  }

  // registry:
  // - scriptInfoTemplate: human readable ScriptInfo template
  // - deployment: see deployment.js
  // - actionCreators: a map of callbaks to return Actions
  //     - willAdd(buildingPacket, { kind: "type" | "lock", scriptHash, inputIndices, outputIndices }): Called to create an action when the papp is found in the transaction.
  //         The registar will add the action to `message.actions` or `lockActions`.
  // - reducers: a map of callbacks to return Reducers
  //     - didAdd(): returns a reducer to handle the new action created by `actionCreators.willAdd`.
  //     - willEstimateFee(): returns a reducer to prepare witnesses for fee estimation.
  //     - willSeal(): returns a reducer to prepare the building packet for generating seals.
  //     - didSeal(script, seal): returns a reducer to add the new generated seal.
  register(registry) {
    const {
      scriptInfoTemplate: { name },
      deployment: { dataHash, typeHash },
    } = registry;
    this.papps.byName[name] = registry;
    this.papps.byDataHash[dataHash] = registry;
    if (typeHash !== null && typeHash !== undefined) {
      this.papps.byTypeHash[typeHash] = registry;
    }
  }

  getPappByName(name) {
    return this.papps.byName[name];
  }

  mustGetPappByName(name) {
    const papp = this.getPappByName(name);
    if (papp !== undefined) {
      return papp;
    }
    throw new Error(`No papp found by name ${name}`);
  }

  getPappByDataHash(dataHash) {
    return this.papps.byDataHash[dataHash];
  }

  mustGetPappByDataHash(dataHash) {
    const papp = this.getPappByDataHash(dataHash);
    if (papp !== undefined) {
      return papp;
    }
    throw new Error(`No papp found by data hash ${dataHash}`);
  }

  getPappByTypeHash(typeHash) {
    return this.papps.byTypeHash[typeHash];
  }

  mustGetPappByTypeHash(typeHash) {
    const papp = this.getPappByTypeHash(typeHash);
    if (papp !== undefined) {
      return papp;
    }
    throw new Error(`No papp found by type hash ${typeHash}`);
  }

  getPappByScriptTemplate({ codeHash, hashType }) {
    return hashType === "type"
      ? this.getPappByTypeHash(codeHash)
      : this.getPappByDataHash(codeHash);
  }

  mustGetPappByScriptTemplate(scriptTemplate) {
    const papp = this.getPappByScriptTemplate(scriptTemplate);
    if (papp !== undefined) {
      return papp;
    }
    throw new Error(
      `No papp found by script template hashType=${scriptTemplate.hashType} codeHash=${scriptTemplate.codeHash}`,
    );
  }

  addPappLockAction(pappName, actionCreatorName, ...actionCreatorArgs) {
    return this.addPappAction(
      pappName,
      "lock",
      actionCreatorName,
      ...actionCreatorArgs,
    );
  }

  addPappTypeAction(pappName, actionCreatorName, ...actionCreatorArgs) {
    return this.addPappAction(
      pappName,
      "type",
      actionCreatorName,
      ...actionCreatorArgs,
    );
  }

  // Create a transformer which will add a papp action to the building packet.
  addPappAction(pappName, kind, actionCreatorName, ...actionCreatorArgs) {
    const papp = this.mustGetPappByName(pappName);
    const creator = papp.actionCreators[actionCreatorName];
    if (creator === null || creator === undefined) {
      throw new Error(
        `Creator ${actionCreatorName} not found in papp ${pappName}`,
      );
    }
    const action = creator(...actionCreatorArgs);
    const addAction =
      kind === "lock"
        ? transformers.addLockAction(action)
        : transformers.addMessageAction(action);
    const addScriptInfo = transformers.addScriptInfo(
      createScriptInfoFromHumanTemplate(
        papp.scriptInfoTemplate,
        action.scriptHash,
      ),
    );
    const reducer = papp.reducers.didAdd ? papp.reducers.didAdd() : undefined;

    return (buildingPacket) => {
      buildingPacket = addScriptInfo(addAction(buildingPacket));
      if (reducer !== undefined) {
        return reducer(buildingPacket, action) ?? buildingPacket;
      }
      return buildingPacket;
    };
  }

  // For each found papps, if the registar cannot find the action in the building packet, it will call `actionCreators.willAdd`
  // to create one and add it to the building packet.
  //
  // Then the registar will call the reducer `reducers.didAdd` to let the papp do the preparation work.
  prepareActions(buildingPacket) {
    const groups = groupScripts(buildingPacket);
    for (const group of groups) {
      const script = getScriptForGroup(buildingPacket, group);
      const papp = this.mustGetPappByScriptTemplate(script);
      let action = findActionForGroup(buildingPacket, group);
      if (action === undefined && papp.actionCreators.willAdd !== undefined) {
        action = papp.actionCreators.willAdd(buildingPacket, group);
        const addAction =
          group.kind === "type"
            ? transformers.addMessageAction
            : transformers.addLockAction;
        const addScriptInfo = transformers.addScriptInfo(
          createScriptInfoFromHumanTemplate(
            papp.scriptInfoTemplate,
            action.scriptHash,
          ),
        );
        buildingPacket = addScriptInfo(addAction(action)(buildingPacket));
      }
      if (action !== undefined && papp.reducers.didAdd !== undefined) {
        buildingPacket =
          papp.reducers.didAdd()(buildingPacket, action) ?? buildingPacket;
      }
    }
    return buildingPacket;
  }

  // Create a transformer to run the registered appas reducers
  runReducers(reducerName, factoryArgs = [], buildingPacket) {
    const groups = groupScripts(buildingPacket);

    for (const group of groups) {
      const script = getScriptForGroup(buildingPacket, group);
      const papp = this.mustGetPappByScriptTemplate(script);
      const action = findActionForGroup(buildingPacket, group);
      if (action !== undefined && papp.reducers[reducerName] !== undefined) {
        const reducer = papp.reducers[reducerName](...factoryArgs);
        buildingPacket = reducer(buildingPacket, action);
      }
    }

    return buildingPacket;
  }

  prepareForFeeEstimation(buildingPacket) {
    return this.runReducers("willEstimateFee", [], buildingPacket);
  }

  prepareForSeal(buildingPacket) {
    return this.runReducers("willSeal", [], buildingPacket);
  }

  // Return a transformer to call the matched papp reducers.didSeal callback.
  didSeal(script, seal, buildingPacket) {
    const scriptHash = computeScriptHash(script);

    const action =
      buildingPacket.value.lockActions.find(
        (e) => e.scriptHash === scriptHash,
      ) ??
      buildingPacket.value.message.actions.find(
        (e) => e.scriptHash === scriptHash,
      );
    if (action !== undefined) {
      const papp = this.mustGetPappByScriptTemplate(script);
      if (
        papp.reducers.didSeal === null ||
        papp.reducers.didSeal === undefined
      ) {
        throw Error(
          `The papp for ${scriptHash} does not support didSeal callback`,
        );
      }
      const reducer = papp.reducers.didSeal(scriptHash, seal);
      return reducer(buildingPacket, action);
    }

    return buildingPacket;
  }
}

export default Registar;
