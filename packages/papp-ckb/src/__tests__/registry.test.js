import { Registar } from "@ckb-cobuild/papp/registar";
import { getCkbRegistry } from "../registry";

test("registar registry", () => {
  const registar = new Registar();
  const ckbPapp = getCkbRegistry();
  registar.register(ckbPapp);
  expect(registar.getPappByName("ckb")).toBe(ckbPapp);
});
