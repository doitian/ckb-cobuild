import { ckbHasher } from "..";

describe("ckbHasher", () => {
  test("empty hash", () => {
    expect(ckbHasher().digest("hex")).toEqual(
      "44f4c69744d5f8c55d642062949dcae49bc4e7ef43d388c5a12f42b5633d163e",
    );
  });

  test.each([
    [[], "44f4c69744d5f8c55d642062949dcae49bc4e7ef43d388c5a12f42b5633d163e"],
    [
      [0x12, 0x34],
      "82f54af4148801b8e8848911bb6cb6bbf26f00ab26e7515cfaae2b30096e907e",
    ],
  ])("update(%s)", (input, hex) => {
    expect(ckbHasher().update(Uint8Array.from(input)).digest("hex")).toEqual(
      hex,
    );
  });
});
