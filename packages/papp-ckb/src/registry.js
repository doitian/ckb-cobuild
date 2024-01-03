import { utils as lumosBaseUtils } from "@ckb-lumos/base";
import { bytes } from "@ckb-lumos/codec";

import { getCkbHumanScriptInfoTemplate } from "./script-info";

const { ckbHash } = lumosBaseUtils;

// dummy hash for type script which is none
export const NONE_HASH = bytes.bytify(ckbHash("0x"));

export function getCkbDeployment() {
  return {
    dataHash: NONE_HASH,
    typeHash: NONE_HASH,
    cellDeps: [],
  };
}

export function getCkbRegistry() {
  return {
    scriptInfoTemplate: getCkbHumanScriptInfoTemplate(),
    deployment: getCkbDeployment(),
    actionCreators: {},
    reducers: {},
  };
}

export default getCkbRegistry;
