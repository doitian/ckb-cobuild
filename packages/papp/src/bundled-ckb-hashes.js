// ckb list-hashes --format json -b | jq '{ckb, ckb_testnet}'
export const BUNDLED_CKB_HASHES = {
  ckb: {
    spec_hash:
      "0x3fe86931c2cf5dfa6d7b9447561b5e547937fe4699787bb7ae906218b3f1e6c5",
    genesis:
      "0x92b197aa1fba0f63633922c61c92375c9c074a93e85963554f5499fe1450d0e5",
    cellbase:
      "0xe2fb199810d49a4d8beec56718ba2593b665db9d52299a0f9e6e75416d73ff5c",
    system_cells: [
      {
        path: "Bundled(specs/cells/secp256k1_blake160_sighash_all)",
        tx_hash:
          "0xe2fb199810d49a4d8beec56718ba2593b665db9d52299a0f9e6e75416d73ff5c",
        index: 1,
        data_hash:
          "0x709f3fda12f561cfacf92273c57a98fede188a3f1a59b1f888d113f9cce08649",
        type_hash:
          "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
      },
      {
        path: "Bundled(specs/cells/dao)",
        tx_hash:
          "0xe2fb199810d49a4d8beec56718ba2593b665db9d52299a0f9e6e75416d73ff5c",
        index: 2,
        data_hash:
          "0x32064a14ce10d95d4b7343054cc19d73b25b16ae61a6c681011ca781a60c7923",
        type_hash:
          "0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e",
      },
      {
        path: "Bundled(specs/cells/secp256k1_data)",
        tx_hash:
          "0xe2fb199810d49a4d8beec56718ba2593b665db9d52299a0f9e6e75416d73ff5c",
        index: 3,
        data_hash:
          "0x9799bee251b975b82c45a02154ce28cec89c5853ecc14d12b7b8cccfc19e0af4",
        type_hash: null,
      },
      {
        path: "Bundled(specs/cells/secp256k1_blake160_multisig_all)",
        tx_hash:
          "0xe2fb199810d49a4d8beec56718ba2593b665db9d52299a0f9e6e75416d73ff5c",
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
          "0x71a7ba8fc96349fea0ed3a5c47992e3b4084b031a42264a018e0072e8172e46c",
        index: 0,
      },
      {
        included_cells: [
          "Bundled(specs/cells/secp256k1_data)",
          "Bundled(specs/cells/secp256k1_blake160_multisig_all)",
        ],
        tx_hash:
          "0x71a7ba8fc96349fea0ed3a5c47992e3b4084b031a42264a018e0072e8172e46c",
        index: 1,
      },
    ],
  },
  ckb_testnet: {
    spec_hash:
      "0xdde420d56c10a06749e79701b152ed1f532f4bdf0696b5896dfd97fbc821e231",
    genesis:
      "0x10639e0895502b5688a6be8cf69460d76541bfa4821629d86d62ba0aae3f9606",
    cellbase:
      "0x8f8c79eb6671709633fe6a46de93c0fedc9c1b8a6527a18d3983879542635c9f",
    system_cells: [
      {
        path: "Bundled(specs/cells/secp256k1_blake160_sighash_all)",
        tx_hash:
          "0x8f8c79eb6671709633fe6a46de93c0fedc9c1b8a6527a18d3983879542635c9f",
        index: 1,
        data_hash:
          "0x709f3fda12f561cfacf92273c57a98fede188a3f1a59b1f888d113f9cce08649",
        type_hash:
          "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
      },
      {
        path: "Bundled(specs/cells/dao)",
        tx_hash:
          "0x8f8c79eb6671709633fe6a46de93c0fedc9c1b8a6527a18d3983879542635c9f",
        index: 2,
        data_hash:
          "0x32064a14ce10d95d4b7343054cc19d73b25b16ae61a6c681011ca781a60c7923",
        type_hash:
          "0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e",
      },
      {
        path: "Bundled(specs/cells/secp256k1_data)",
        tx_hash:
          "0x8f8c79eb6671709633fe6a46de93c0fedc9c1b8a6527a18d3983879542635c9f",
        index: 3,
        data_hash:
          "0x9799bee251b975b82c45a02154ce28cec89c5853ecc14d12b7b8cccfc19e0af4",
        type_hash: null,
      },
      {
        path: "Bundled(specs/cells/secp256k1_blake160_multisig_all)",
        tx_hash:
          "0x8f8c79eb6671709633fe6a46de93c0fedc9c1b8a6527a18d3983879542635c9f",
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
          "0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37",
        index: 0,
      },
      {
        included_cells: [
          "Bundled(specs/cells/secp256k1_data)",
          "Bundled(specs/cells/secp256k1_blake160_multisig_all)",
        ],
        tx_hash:
          "0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37",
        index: 1,
      },
    ],
  },
};

export default BUNDLED_CKB_HASHES;
