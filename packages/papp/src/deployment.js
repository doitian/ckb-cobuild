import { blockchain, utils as lumosBaseUtils } from "@ckb-lumos/base";
import { bytes } from "@ckb-lumos/codec";

import BUNDLED_CKB_HASHES from "./bundled-ckb-hashes";

const { Script } = blockchain;
const { ckbHash } = lumosBaseUtils;

const DEFAULT_OPTOINS = {
  // The default hash type used to create script
  defaultHashType: "type",
  // The fallback hash type when `defaultHashType` is "type" but the deployed script cell has no type script.
  fallbackDataHashType: "data1",
};

const SPECS_MAPPING = {
  mainnet: "ckb",
  testnet: "ckb_testnet",
  dev: "ckb_dev",
};

// Default option for the depoyment.
//
export function defaultDeploymentOptions() {
  return DEFAULT_OPTOINS;
}

export function ckb2023DeploymentOptions() {
  return {
    ...DEFAULT_OPTOINS,
    fallbackDataHashType: "data2",
  };
}

// Create a deployment information from the script cell.
//
// - outPoint is the reference to the script cell output.
// - type is the script cell type script.
export function createDeploymentFromCell(cell) {
  const { outPoint } = cell;
  return createDeploymentFromCellAndCellDeps(cell, [
    { outPoint, depType: "code" },
  ]);
}

export function createDeploymentFromCellAndCellDeps(
  { cellOutput, data },
  cellDeps,
) {
  const dataHash = bytes.hexify(ckbHash(data));
  const typeHash =
    cellOutput.type === null || cellOutput === undefined
      ? undefined
      : bytes.hexify(ckbHash(Script.pack(cellOutput.type)));

  return {
    dataHash,
    typeHash,
    cellDeps,
  };
}

export function getHashes({ chain, hashes }) {
  chain = SPECS_MAPPING[chain] ?? chain;
  return (hashes ?? BUNDLED_CKB_HASHES)[chain];
}

export function createSecp256k1Blake160SighashAllDeployment({ chain, hashes }) {
  return createSystemScriptDeployment({ chain, hashes }, 0, 0);
}

export function createSecp256k1Blake160MultisigAllDeployment({
  chain,
  hashes,
}) {
  return createSystemScriptDeployment({ chain, hashes }, 3, 1);
}

export function createDaoDeployment({ chain, hashes }) {
  return createSystemScriptDeployment({ chain, hashes }, 1, null);
}

function createSystemScriptDeployment(
  { chain, hashes },
  systemCellIndex,
  depGroupIndex,
) {
  const resolvedHashes = getHashes({ chain, hashes });
  return {
    typeHash: resolvedHashes.system_cells[systemCellIndex].type_hash,
    dataHash: resolvedHashes.system_cells[systemCellIndex].data_hash,
    cellDeps: [
      depGroupIndex !== null && depGroupIndex !== undefined
        ? {
            outPoint: {
              txHash: resolvedHashes.dep_groups[depGroupIndex].tx_hash,
              index: resolvedHashes.dep_groups[depGroupIndex].index,
            },
            depType: "depGroup",
          }
        : {
            outPoint: {
              txHash: resolvedHashes.system_cells[systemCellIndex].tx_hash,
              index: resolvedHashes.system_cells[systemCellIndex].index,
            },
            depType: "code",
          },
    ],
  };
}

export function createDeploymentFromCkbCliMigration(
  cellRecipe,
  depGroupRecipe,
) {
  return {
    typeHash: cellRecipe.type_id,
    dataHash: cellRecipe.data_hash,
    cellDeps: [
      depGroupRecipe !== null && depGroupRecipe !== undefined
        ? {
            outPoint: {
              txHash: depGroupRecipe.tx_hash,
              index: depGroupRecipe.index,
            },
            depType: "depGroup",
          }
        : {
            outPoint: {
              txHash: cellRecipe.tx_hash,
              index: cellRecipe.index,
            },
            depType: "code",
          },
    ],
  };
}

export function createScriptFromDeployment(deployment, args, options = {}) {
  const { defaultHashType, fallbackDataHashType } = options
    ? { ...DEFAULT_OPTOINS, ...options }
    : DEFAULT_OPTOINS;

  const preferedDataHashType =
    defaultHashType === "type" ? fallbackDataHashType : defaultHashType;

  return deployment.typeHash !== undefined && defaultHashType === "type"
    ? { scriptHash: deployment.typeHash, hashType: "type", args }
    : { scriptHash: deployment.dataHash, hashType: preferedDataHashType, args };
}
