import { SCHEMA, MESSAGE_TYPE } from "./schema";

export function getCkbHumanScriptInfoTemplate() {
  return {
    name: "ckb",
    url: "https://github.com/nervosnetwork/ckb",
    schema: SCHEMA,
    messageType: MESSAGE_TYPE,
  };
}

export default getCkbHumanScriptInfoTemplate;
