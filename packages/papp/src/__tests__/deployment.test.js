import {
  createSecp256k1Blake160SighashAllDeployment,
  createDaoDeployment,
  createDeploymentFromCkbCliMigration,
} from "../deployment";

const EXAMPLE_CKB_CLI_MIGRATION = {
  cell_recipes: [
    {
      name: "joyid-cobuild-poc",
      tx_hash:
        "0x53ba0900742334d2283f321ae17324efb3846fa38ba4bd47542f6d508db13b0b",
      index: 0,
      occupied_capacity: 10059000000000,
      data_hash:
        "0x1d1dfd01af30e184b4b770efaa6662cf07f65fb36b931c9cc75fbba11d939169",
      type_id:
        "0x04dd652246af5f32ae10c04821ae32bff3dce37da52b6c60354c8ba867959e1e",
    },
  ],
  dep_group_recipes: [],
};

const EXAMPLE_CKB_HASHES = {
  ckb_dev: {
    spec_hash:
      "0x5ae35fd040587e183357804e7fcfb96a846bafe89b1466d2ffb0730f00ca2edf",
    genesis:
      "0xde2a9a0f62046aaf60763fe0ee1819ec6548990b58f72c9903d853d9349e556e",
    cellbase:
      "0x50e53af4ce7f2cc0a27c1fe1e2d7f227565c3edd3c9410a9f33e9150459c4086",
    system_cells: [
      {
        path: "Bundled(specs/cells/secp256k1_blake160_sighash_all)",
        tx_hash:
          "0x50e53af4ce7f2cc0a27c1fe1e2d7f227565c3edd3c9410a9f33e9150459c4086",
        index: 1,
        data_hash:
          "0x709f3fda12f561cfacf92273c57a98fede188a3f1a59b1f888d113f9cce08649",
        type_hash:
          "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
      },
      {
        path: "Bundled(specs/cells/dao)",
        tx_hash:
          "0x50e53af4ce7f2cc0a27c1fe1e2d7f227565c3edd3c9410a9f33e9150459c4086",
        index: 2,
        data_hash:
          "0x32064a14ce10d95d4b7343054cc19d73b25b16ae61a6c681011ca781a60c7923",
        type_hash:
          "0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e",
      },
      {
        path: "Bundled(specs/cells/secp256k1_data)",
        tx_hash:
          "0x50e53af4ce7f2cc0a27c1fe1e2d7f227565c3edd3c9410a9f33e9150459c4086",
        index: 3,
        data_hash:
          "0x9799bee251b975b82c45a02154ce28cec89c5853ecc14d12b7b8cccfc19e0af4",
        type_hash: null,
      },
      {
        path: "Bundled(specs/cells/secp256k1_blake160_multisig_all)",
        tx_hash:
          "0x50e53af4ce7f2cc0a27c1fe1e2d7f227565c3edd3c9410a9f33e9150459c4086",
        index: 4,
        data_hash:
          "0x43400de165f0821abf63dcac299bbdf7fd73898675ee4ddb099b0a0d8db63bfb",
        type_hash:
          "0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8",
      },
    ],
    dep_groups: [
      {
        included_cells: [
          "Bundled(specs/cells/secp256k1_data)",
          "Bundled(specs/cells/secp256k1_blake160_sighash_all)",
        ],
        tx_hash:
          "0x0fb96f39b4398eadca15a766f995869d8424b280b5eb920f7384a44bb3562e9c",
        index: 0,
      },
      {
        included_cells: [
          "Bundled(specs/cells/secp256k1_data)",
          "Bundled(specs/cells/secp256k1_blake160_multisig_all)",
        ],
        tx_hash:
          "0x0fb96f39b4398eadca15a766f995869d8424b280b5eb920f7384a44bb3562e9c",
        index: 1,
      },
    ],
  },
};

describe("createSecp256k1Blake160SighashAllDeployment", () => {
  test("mainnet", () => {
    const deployment = createSecp256k1Blake160SighashAllDeployment({
      chain: "mainnet",
    });
    expect(deployment.dataHash).toBe(
      "0x709f3fda12f561cfacf92273c57a98fede188a3f1a59b1f888d113f9cce08649",
    );
    expect(deployment.typeHash).toBe(
      "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    );
    expect(deployment.cellDeps).toStrictEqual([
      {
        outPoint: {
          txHash:
            "0x71a7ba8fc96349fea0ed3a5c47992e3b4084b031a42264a018e0072e8172e46c",
          index: 0,
        },
        depType: "depGroup",
      },
    ]);
  });

  test("testnet", () => {
    const deployment = createSecp256k1Blake160SighashAllDeployment({
      chain: "testnet",
    });
    expect(deployment.dataHash).toBe(
      "0x709f3fda12f561cfacf92273c57a98fede188a3f1a59b1f888d113f9cce08649",
    );
    expect(deployment.typeHash).toBe(
      "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    );
    expect(deployment.cellDeps).toStrictEqual([
      {
        outPoint: {
          txHash:
            "0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37",
          index: 0,
        },
        depType: "depGroup",
      },
    ]);
  });

  test("dev", () => {
    const deployment = createSecp256k1Blake160SighashAllDeployment({
      chain: "dev",
      hashes: EXAMPLE_CKB_HASHES,
    });
    expect(deployment.dataHash).toBe(
      "0x709f3fda12f561cfacf92273c57a98fede188a3f1a59b1f888d113f9cce08649",
    );
    expect(deployment.typeHash).toBe(
      "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    );
    expect(deployment.cellDeps).toStrictEqual([
      {
        outPoint: {
          txHash:
            "0x0fb96f39b4398eadca15a766f995869d8424b280b5eb920f7384a44bb3562e9c",
          index: 0,
        },
        depType: "depGroup",
      },
    ]);
  });
});

describe("createDaoDeployment", () => {
  test("mainnet", () => {
    const deployment = createDaoDeployment({
      chain: "mainnet",
    });
    expect(deployment.dataHash).toBe(
      "0x32064a14ce10d95d4b7343054cc19d73b25b16ae61a6c681011ca781a60c7923",
    );
    expect(deployment.typeHash).toBe(
      "0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e",
    );
    expect(deployment.cellDeps).toStrictEqual([
      {
        outPoint: {
          txHash:
            "0xe2fb199810d49a4d8beec56718ba2593b665db9d52299a0f9e6e75416d73ff5c",
          index: 2,
        },
        depType: "code",
      },
    ]);
  });

  test("testnet", () => {
    const deployment = createDaoDeployment({
      chain: "testnet",
    });
    expect(deployment.dataHash).toBe(
      "0x32064a14ce10d95d4b7343054cc19d73b25b16ae61a6c681011ca781a60c7923",
    );
    expect(deployment.typeHash).toBe(
      "0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e",
    );
    expect(deployment.cellDeps).toStrictEqual([
      {
        outPoint: {
          txHash:
            "0x8f8c79eb6671709633fe6a46de93c0fedc9c1b8a6527a18d3983879542635c9f",
          index: 2,
        },
        depType: "code",
      },
    ]);
  });

  test("dev", () => {
    const deployment = createDaoDeployment({
      chain: "dev",
      hashes: EXAMPLE_CKB_HASHES,
    });
    expect(deployment.dataHash).toBe(
      "0x32064a14ce10d95d4b7343054cc19d73b25b16ae61a6c681011ca781a60c7923",
    );
    expect(deployment.typeHash).toBe(
      "0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e",
    );
    expect(deployment.cellDeps).toStrictEqual([
      {
        outPoint: {
          txHash:
            "0x50e53af4ce7f2cc0a27c1fe1e2d7f227565c3edd3c9410a9f33e9150459c4086",
          index: 2,
        },
        depType: "code",
      },
    ]);
  });
});

test("createDeploymentFromCkbCliMigration", () => {
  const deployment = createDeploymentFromCkbCliMigration(
    EXAMPLE_CKB_CLI_MIGRATION.cell_recipes[0],
  );
  expect(deployment.dataHash).toBe(
    "0x1d1dfd01af30e184b4b770efaa6662cf07f65fb36b931c9cc75fbba11d939169",
  );
  expect(deployment.typeHash).toBe(
    "0x04dd652246af5f32ae10c04821ae32bff3dce37da52b6c60354c8ba867959e1e",
  );
  expect(deployment.cellDeps).toStrictEqual([
    {
      outPoint: {
        txHash:
          "0x53ba0900742334d2283f321ae17324efb3846fa38ba4bd47542f6d508db13b0b",
        index: 0,
      },
      depType: "code",
    },
  ]);
});
