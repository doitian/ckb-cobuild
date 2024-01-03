import { createSecp256k1Blake160SighashAllDeployment } from "@ckb-cobuild/papp/deployment";

import { getSecp256k1Blake160SighashAllHumanScriptInfoTemplate } from "./script-info";

export function getSecp256k1Blake160SighashAllRegistry({ chain, hashes }) {
  return {
    scriptInfoTemplate: getSecp256k1Blake160SighashAllHumanScriptInfoTemplate(),
    deployment: createSecp256k1Blake160SighashAllDeployment({ chain, hashes }),
    actionCreators: {},
    reducers: {},
  };
}

export default getSecp256k1Blake160SighashAllRegistry;
