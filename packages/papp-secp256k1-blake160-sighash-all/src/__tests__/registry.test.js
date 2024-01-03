import { Registar } from "@ckb-cobuild/papp/registar";
import { getSecp256k1Blake160SighashAllRegistry } from "../registry";

test("registar registry", () => {
  const registar = new Registar();
  const secp256k1Papp = getSecp256k1Blake160SighashAllRegistry({
    chain: "mainnet",
  });
  registar.register(secp256k1Papp);
  expect(registar.getPappByName("secp256k1_blake160_sighash_all")).toBe(
    secp256k1Papp,
  );
});
