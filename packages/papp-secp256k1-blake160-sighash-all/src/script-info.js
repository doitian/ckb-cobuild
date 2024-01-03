import { SCHEMA, MESSAGE_TYPE } from "./schema";

export function getSecp256k1Blake160SighashAllHumanScriptInfoTemplate() {
  return {
    name: "secp256k1_blake160_sighash_all",
    url: "https://github.com/nervosnetwork/ckb-system-scripts/blob/master/c/secp256k1_blake160_sighash_all.c",
    schema: SCHEMA,
    messageType: MESSAGE_TYPE,
  };
}

export default getSecp256k1Blake160SighashAllHumanScriptInfoTemplate;
