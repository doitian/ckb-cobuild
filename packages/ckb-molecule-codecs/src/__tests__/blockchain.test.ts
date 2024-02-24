import { decodeHex } from "@ckb-cobuild/hex-encoding";
import { toJson } from "@ckb-cobuild/molecule-json";
import { parseError, parseSuccess } from "@ckb-cobuild/molecule";
import {
  Block,
  BlockV1,
  DepType,
  DepTypeCodec,
  DepTypeEnum,
  HashType,
  HashTypeCodec,
  HashTypeEnum,
} from "../blockchain";

describe("HashTypeCodec", () => {
  describe(".safeParse", () => {
    test.each([
      HashTypeEnum.data,
      HashTypeEnum.type,
      HashTypeEnum.data1,
      HashTypeEnum.data2,
    ])("(%s)", (variant) => {
      expect(HashTypeCodec.safeParse(variant)).toEqual(
        parseSuccess(HashTypeEnum[variant]),
      );
    });
    const hashTypes: HashType[] = ["data", "type", "data1", "data2"];
    test.each(hashTypes)("(%s)", (variant) => {
      expect(HashTypeCodec.safeParse(variant)).toEqual(parseSuccess(variant));
    });

    test.each([-1, 3, 5])("(%s)", (variant) => {
      expect(HashTypeCodec.safeParse(variant)).toEqual(
        parseError(`Invalid HashType enum variant: ${variant}`),
      );
    });
    test.each(["data3"])("(%s)", (variant) => {
      expect(HashTypeCodec.safeParse(variant as HashType)).toEqual(
        parseError(`Invalid HashType enum variant: ${variant}`),
      );
    });
  });
});

describe("DepTypeCodec", () => {
  describe(".safeParse", () => {
    test.each([DepTypeEnum.code, DepTypeEnum.dep_group])("(%s)", (variant) => {
      expect(DepTypeCodec.safeParse(variant)).toEqual(
        parseSuccess(DepTypeEnum[variant]),
      );
    });
    const depTypes: DepType[] = ["code", "dep_group"];
    test.each(depTypes)("(%s)", (variant) => {
      expect(DepTypeCodec.safeParse(variant)).toEqual(parseSuccess(variant));
    });

    test.each([-1, 2])("(%s)", (variant) => {
      expect(DepTypeCodec.safeParse(variant)).toEqual(
        parseError(`Invalid DepType enum variant: ${variant}`),
      );
    });
    test.each(["", "dep"])("(%s)", (variant) => {
      expect(DepTypeCodec.safeParse(variant as DepType)).toEqual(
        parseError(`Invalid DepType enum variant: ${variant}`),
      );
    });
  });
});

describe("Block", () => {
  test(".exportSchema", () => {
    expect(
      Array.from(Block.exportSchema().values()).join("\n").split("\n"),
    ).toEqual([
      "array Uint32 [byte; 4];",
      "array Uint64 [byte; 8];",
      "array Byte32 [byte; 32];",
      "struct RawHeader {",
      "    version: Uint32,",
      "    compact_target: Uint32,",
      "    timestamp: Uint64,",
      "    number: Uint64,",
      "    epoch: Uint64,",
      "    parent_hash: Byte32,",
      "    transactions_root: Byte32,",
      "    proposals_hash: Byte32,",
      "    extra_hash: Byte32,",
      "    dao: Byte32,",
      "}",
      "array Uint128 [byte; 16];",
      "struct Header {",
      "    raw: RawHeader,",
      "    nonce: Uint128,",
      "}",
      "array ProposalShortId [byte; 10];",
      "vector ProposalShortIdVec <ProposalShortId>;",
      "table UncleBlock {",
      "    header: Header,",
      "    proposals: ProposalShortIdVec,",
      "}",
      "vector UncleBlockVec <UncleBlock>;",
      "struct OutPoint {",
      "    tx_hash: Byte32,",
      "    index: Uint32,",
      "}",
      "struct CellDep {",
      "    out_point: OutPoint,",
      "    dep_type: byte,",
      "}",
      "vector CellDepVec <CellDep>;",
      "vector Byte32Vec <Byte32>;",
      "struct CellInput {",
      "    since: Uint64,",
      "    previous_output: OutPoint,",
      "}",
      "vector CellInputVec <CellInput>;",
      "vector Bytes <byte>;",
      "table Script {",
      "    code_hash: Byte32,",
      "    hash_type: byte,",
      "    args: Bytes,",
      "}",
      "option ScriptOpt (Script);",
      "table CellOutput {",
      "    capacity: Uint64,",
      "    lock: Script,",
      "    type: ScriptOpt,",
      "}",
      "vector CellOutputVec <CellOutput>;",
      "vector BytesVec <Bytes>;",
      "table RawTransaction {",
      "    version: Uint32,",
      "    cell_deps: CellDepVec,",
      "    header_deps: Byte32Vec,",
      "    inputs: CellInputVec,",
      "    outputs: CellOutputVec,",
      "    outputs_data: BytesVec,",
      "}",
      "table Transaction {",
      "    raw: RawTransaction,",
      "    witnesses: BytesVec,",
      "}",
      "vector TransactionVec <Transaction>;",
      "table Block {",
      "    header: Header,",
      "    uncles: UncleBlockVec,",
      "    transactions: TransactionVec,",
      "    proposals: ProposalShortIdVec,",
      "}",
    ]);
  });
});

describe("BlockV1", () => {
  // https://pudge.explorer.nervos.org/block/12385557
  const blockBuffer = decodeHex(
    "7c12000018000000e8000000ec000000401200005812000000000000152e0a1dd5579bdb8d01000015fdbc00000000002620003400080700cb806c13960d0a3fc254c741787cefc6d765133509a7544b3f938d820ddafe44cd7d714feca291c4dbcd0ba7f984a302a5876dcd169313aaf16745ff366d398da880cb0b469ae851598359f588678833b76a8bb7eb11de36eccda3a7da4978a2ce8d4196c7f0bc08c9d55dccf896b931a08e9e7f88462b85c0828291c5b1cfcbd7fa1e87a4f98a4b8824ccfc6bef2700170e5413cbca180600c6d1b9c2c4dc08c6cdb08c8985dc817c43c712aa29451304000000541100001000000074010000ea090000640100000c000000d9000000cd0000001c00000020000000240000002800000058000000c10000000000000000000000000000000100000015fdbc00000000000000000000000000000000000000000000000000000000000000000000000000ffffffff6900000008000000610000001000000018000000610000005ff3fabc19000000490000001000000030000000310000009bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce801140000000450340178ae277261a838c89f9ccb76a190ed4b0c00000008000000000000008b000000080000007f0000007f0000000c00000055000000490000001000000030000000310000009bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce80114000000f1cbacc833b5c62f79ac8de6aa7ffbe464cae563260000000000000020302e3131332e3020283832383731613320323032342d30312d30392920deadbeef760800000c0000000d040000010400001c00000020000000dd000000e100000069010000270300000000000005000000fdbf09b619ae346ceac173cd27401ba07eeb1733865ae637dbcfd58f76b795230000000000f8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37000000000168127b264600451cc4dd43af1c829d86a98ea5035d54bedc86667eb7103519110000000000443f98ae5de6a3f02fb8d12a1519dd68ac71a4e286db63b8fd4da45ef99c90a300000000009154df4f7336402114d04495175b37390ce86a4906d2d4001cf02c3e6d97f39c000000000000000000030000004102da650000004005d821884da35e5c8a5e08fef737dc7b526a218d2fc18529eeaba55cb979572d00000000000000000000000005d821884da35e5c8a5e08fef737dc7b526a218d2fc18529eeaba55cb979572d01000000000000000000000005d821884da35e5c8a5e08fef737dc7b526a218d2fc18529eeaba55cb979572d02000000be01000010000000c80000005d010000b8000000100000001800000063000000007e6d67070000004b00000010000000300000003100000079f90bb5e892d80dd213439eeab551120eb417678824f282b4ffb5f21bad2e1e011600000000d7c521f77cae39e7083d1cd664a893395fe25fdb005500000010000000300000003100000056abab7961e8348aed629a0e59c05d0f6b555314f8f95606eae4bcb2adafdce30120000000749f79c58129fb18ce425e030e23f127fe60979ef8f69c28a945f4da19fec5919500000010000000180000009500000000203d88792d00007d000000100000003000000031000000feac11dee7c66e54e4864c177215d0cbb6ebcfbd2fe8e0d2bc45b3413542e2da01480000000a6d3bb9392242c0357fcae7ccead8f87b428ed280909bfdfaa549529b85df38b155296abb0db5fed6514bf8beda37d18c48302872a826e6a1229fb17fe535febdba58000000000061000000100000001800000061000000c4f506bbd4000000490000001000000030000000310000009bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce80114000000d7c521f77cae39e7083d1cd664a893395fe25fdbda00000010000000d2000000d6000000be000000ede00dbcfd70811334490dae9e992e8b11f50267faadde52255f4add5480505e6cb9d53e85b2e1ed91bacbbda814b897069a261a9bd73a9ede2aade5c9cce3b5d481160011d51f3df0bdec7e838e1ed58339e7fc4fad0b8964cf82143a3efd539b98a551beba58000000000000000000000000000000000000000000000000000000000000000000000000003b4249527e6be9d5ab93affdaaa80db5cf6705021b4aa4d9d9325b0067ee65cc9acc98db8d01000059ba580000000000000100000000000000006904000010000000fc03000010040000e8030000e8030000100000006900000069000000550000005500000010000000550000005500000041000000ec51d97fd3cdf5f1bbaa5bc172f7e9e25510854a651794163fcf944bcde79fc51233e9958124501409f60dc9b15184b1458f4a97ded43e13171f2283f6e8bb68017b0300000000000077030000100000006f030000730300005f0300001c0000006c0100007001000074010000780100005b030000500100002c000000340000005400000074000000940000009c000000c0000000e4000000e80000000c010000bdba5800000000001c000000020000001400000056e6885ff68c995c5d68d5942bf4dbc5835a47c706d7d4ddede17e4a52afdc90a8ca965880baa27bec6f7ec3ffb942ae2f17f2b6b155296abb0db5fed6514bf8beda37d18c48302872a826e6a1229fb17fe535fe9acc98db8d0100006cb9d53e85b2e1ed91bacbbda814b897069a261a9bd73a9ede2aade5c9cce3b5d48116006cb9d53e85b2e1ed91bacbbda814b897069a261a9bd73a9ede2aade5c9cce3b5d481160000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000551904c2068da606b5dcab64c86e77bf5077922fb6c16a3a96e0113849f0fe17000000000000000004000000df0100004c5006d7d4ddede17e4a52afdc90a8ca965880baa27bec6f7ec3ffb942ae2f17f2b64f01502d5fff084bf94715bf4d7f7c2003ee0b3808b940edb6d03ad58edc96d193ddc55045f47b8434de2ce5771bba0823846e63f3d989878effc232b3270b69fd8226d150636fa9425e543c303b9360ab8bbcd9d74c9d76f584a09e079256b21bab1845795097878e925826038c5b226bd8177c97a57581b45f825a6c92b3ef8caf8a6182c74f01501b5a9ed5862faebe746f46b356c9ca79c921d7a592afb32f202d0b49628c790c4f0150797f1309fee27faa48f37878dbc03c90ef1a5c4340c562f2abb29726f8eb12d04f0150187c713c18bc20c4d0f2089f7fac0baa6a7cecc311aac87d0fbea3de7515b84a50e634fc88bfa417e9aeba230fa8499ae1a9ff042bb14c848fd2bc626814c3fc515006d8351b1d24bbcae30fe5cecc5282beb08f4a0d971c5d0b514a58b9aa902bf64f0150eeb02d9e662720409e9ca109061b6ea1cd0b01157ad4ffcad2eb9943f94810a04f0350c7420180aa1c3373d5fa828baa1374fe8ddd326055ee4c2f96394326a61bd9cb50a291161c965d83b9700b3c47549c35b357ad394c06b1c029f56f92c3c0319e744f0150b286795034baa814e085d84ae61d556de8dfe36474603047cf5a93a80e3440ea4fe90400000000000000000000001000000010000000100000001000000010000000550000005500000010000000550000005500000041000000420dbea2d44d7731a198d4b7f65aa434d5e60e23147c28574793b25f924d127607bc16f8226a49abf4cd316d2600cec3c0e65af12f9507fdae040c5b112164df006a0700000c0000000d040000010400001c00000020000000dd000000e100000069010000270300000000000005000000bcd73881ba53f1cd95d0c855395c4ffe6f54e041765d9ab7602d48a7cb71612e0000000000cd52d714ddea04d2917892f16d47cbd0bbbb7d9ba281233ec4021f79fc34bccc0000000000f8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d370000000001053fdb4ed3181eab3a3a5f05693b53a8cdec0a24569e16369f444bac48be7de900000000009154df4f7336402114d04495175b37390ce86a4906d2d4001cf02c3e6d97f39c000000000000000000030000004202da65000000402403a2d27c5c63422a6afb25d154dcfa100ff659c0d8ec9b2ebfe1a2dd4e07260000000000000000000000002403a2d27c5c63422a6afb25d154dcfa100ff659c0d8ec9b2ebfe1a2dd4e07260100000000000000000000002403a2d27c5c63422a6afb25d154dcfa100ff659c0d8ec9b2ebfe1a2dd4e072602000000be01000010000000c80000005d010000b8000000100000001800000063000000007e6d67070000004b00000010000000300000003100000079f90bb5e892d80dd213439eeab551120eb417678824f282b4ffb5f21bad2e1e011600000000c267a8b93cdae15fb06325f11a72b1047bd4d33c00550000001000000030000000310000001e44736436b406f8e48a30dfbddcf044feb0c9eebfe63b0f81cb5bb727d84854012000000086c7429247beba7ddd6e4361bcdfc0510b0b644131e2afb7e486375249a018029500000010000000180000009500000000c0afd6913600007d0000001000000030000000310000007f5a09b8bd0e85bcf2ccad96411ccba2f289748a1c16900b0635c2ed9126f2880148000000702359ea7f073558921eb50d8c1c77e92f760c8f8656bde4995f26b8963e2dd8f245705db4fe72be953e4f9ee3808a1700a578341aa80a8b2349c236c4af64e54001590000000000610000001000000018000000610000003ad2b1f8e5000000490000001000000030000000310000009bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce80114000000c267a8b93cdae15fb06325f11a72b1047bd4d33cda00000010000000d2000000d6000000be000000a0cf6037bfc238b179b74a30a9b12e15a4fbdd8881aebc8e5a66a8b5b5c95f0a7a3a615fb0282311f098f7b4ebd53a7c2118ddfbe0faa168f139bf99cd20b6dbf0a802007364c011be661ed576e4e58faf0e43ac5229465250ffbbd48b936c0442b9c48a41015900000000000000000000000000000000000000000000000000000000000000000000000000aeb5b7dbb06d51839aec4049723fe53e1ab05651f3a06e7ada43979dd94ff87d82d098db8d010000dc00590000000000000100000000000000005d03000010000000f002000004030000dc020000dc020000100000006900000069000000550000005500000010000000550000005500000041000000593aeeaae0a98286f84e47e7dcd95f5edd29156c8a9431da3221fe721102de0e7976749cd4d78048d1d6b87c536c15f8b45008d383f7bb2f9cd2b0e0db508fe4006f020000000000006b020000100000006302000067020000530200001c0000006c0100007001000074010000780100004f020000500100002c000000340000005400000074000000940000009c000000c0000000e4000000e80000000c01000040015900000000001c0000000200000014000000715ab282b873b79a7be8b0e8c13c4e8966a52040e1ccdbbeb6100df1a0781c180bbe20b809481bb56e345996c1931a4b2c1214adf245705db4fe72be953e4f9ee3808a1700a578341aa80a8b2349c236c4af64e582d098db8d0100007a3a615fb0282311f098f7b4ebd53a7c2118ddfbe0faa168f139bf99cd20b6dbf0a802007a3a615fb0282311f098f7b4ebd53a7c2118ddfbe0faa168f139bf99cd20b6dbf0a802000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000083a5bac5d72705c8f35947ddce53b8dba7d5922d8d84ba0154723ccae524e1b2000000000000000004000000d30000004c4f0650070a47891e62c8f3b168d621d2deed718a563054c01e258fcd0a304a89419f084f01501b77306dd42464905dffbb87f8fbd1da311f7538d2e5082c2c4044eb45bcc60f4f075022e17844935bb9df93699a8300ba2ac9161ba835d35fd5ffe9c444599245bdce4f0250523c6f86dc85a411abab1e91f80ec81487eeefeb98e6352e9c2ea546b5b5cb075047efcb29e34c4b890c5372b17e94df0ce98dffe112ebf532277e663e0e9795f24f01508ad8ce2ac94cf885730b362ca4b81787bf85b48d7f72ef7816130bdc54433f644fe90400000000000000000000001000000010000000100000001000000010000000550000005500000010000000550000005500000041000000f0ef2578cb27ea9f6238088ff88c4812b3c4fc3f01094896fc0c37dfb6ad8b893e6af7116aab09bcdeb775bde2e9b01b0381cf3145abee3615b0e47b4845de6a0102000000866d6a852895cc73882e1bacadba568cebeab7ca200000004e5117b595abdadb53704755ada3915b5cc72d647ca487ef7f8ff72e9e93ed0b",
  );

  test("unpack then pack", () => {
    const block = BlockV1.unpack(blockBuffer);
    const actual = BlockV1.pack(block);
    expect(actual).toStrictEqual(blockBuffer);
  });

  test("toJson", () => {
    const block = BlockV1.unpack(blockBuffer);
    const blockJson = toJson(block);
    expect(blockJson).toStrictEqual({
      extension:
        "0x4e5117b595abdadb53704755ada3915b5cc72d647ca487ef7f8ff72e9e93ed0b",
      header: {
        hash: "0x041002afe300a332e16601a347107be1135ded74d8d269f95ca038bc970d4a2e",
        nonce: "0x134529aa12c7437c81dc85898cb0cdc6",
        compact_target: "0x1d0a2e15",
        dao: "0xd7fa1e87a4f98a4b8824ccfc6bef2700170e5413cbca180600c6d1b9c2c4dc08",
        epoch: "0x7080034002026",
        extra_hash:
          "0xce8d4196c7f0bc08c9d55dccf896b931a08e9e7f88462b85c0828291c5b1cfcb",
        number: "0xbcfd15",
        parent_hash:
          "0xcb806c13960d0a3fc254c741787cefc6d765133509a7544b3f938d820ddafe44",
        proposals_hash:
          "0xa880cb0b469ae851598359f588678833b76a8bb7eb11de36eccda3a7da4978a2",
        timestamp: "0x18ddb9b57d5",
        transactions_root:
          "0xcd7d714feca291c4dbcd0ba7f984a302a5876dcd169313aaf16745ff366d398d",
        version: "0x0",
      },
      proposals: ["0x866d6a852895cc73882e", "0x1bacadba568cebeab7ca"],
      transactions: [
        {
          hash: "0x8a1c83e55f1196b4cecf5184ccbd54d80eb8c826b64eac9f1374e64ede507ef2",
          cell_deps: [],
          header_deps: [],
          inputs: [
            {
              previous_output: {
                index: "0xffffffff",
                tx_hash:
                  "0x0000000000000000000000000000000000000000000000000000000000000000",
              },
              since: "0xbcfd15",
            },
          ],
          outputs: [
            {
              capacity: "0x19bcfaf35f",
              lock: {
                args: "0x0450340178ae277261a838c89f9ccb76a190ed4b",
                code_hash:
                  "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                hash_type: "type",
              },
              type: null,
            },
          ],
          outputs_data: ["0x"],
          version: "0x0",
          witnesses: [
            "0x7f0000000c00000055000000490000001000000030000000310000009bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce80114000000f1cbacc833b5c62f79ac8de6aa7ffbe464cae563260000000000000020302e3131332e3020283832383731613320323032342d30312d30392920deadbeef",
          ],
        },
        {
          hash: "0xabade4ec074fc2c68c17a1bc4b580f3ae99cdc2732b871627cb98709b71e894e",
          cell_deps: [
            {
              dep_type: "code",
              out_point: {
                index: "0x0",
                tx_hash:
                  "0xfdbf09b619ae346ceac173cd27401ba07eeb1733865ae637dbcfd58f76b79523",
              },
            },
            {
              dep_type: "dep_group",
              out_point: {
                index: "0x0",
                tx_hash:
                  "0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37",
              },
            },
            {
              dep_type: "code",
              out_point: {
                index: "0x0",
                tx_hash:
                  "0x68127b264600451cc4dd43af1c829d86a98ea5035d54bedc86667eb710351911",
              },
            },
            {
              dep_type: "code",
              out_point: {
                index: "0x0",
                tx_hash:
                  "0x443f98ae5de6a3f02fb8d12a1519dd68ac71a4e286db63b8fd4da45ef99c90a3",
              },
            },
            {
              dep_type: "code",
              out_point: {
                index: "0x0",
                tx_hash:
                  "0x9154df4f7336402114d04495175b37390ce86a4906d2d4001cf02c3e6d97f39c",
              },
            },
          ],
          header_deps: [],
          inputs: [
            {
              previous_output: {
                index: "0x0",
                tx_hash:
                  "0x05d821884da35e5c8a5e08fef737dc7b526a218d2fc18529eeaba55cb979572d",
              },
              since: "0x4000000065da0241",
            },
            {
              previous_output: {
                index: "0x1",
                tx_hash:
                  "0x05d821884da35e5c8a5e08fef737dc7b526a218d2fc18529eeaba55cb979572d",
              },
              since: "0x0",
            },
            {
              previous_output: {
                index: "0x2",
                tx_hash:
                  "0x05d821884da35e5c8a5e08fef737dc7b526a218d2fc18529eeaba55cb979572d",
              },
              since: "0x0",
            },
          ],
          outputs: [
            {
              capacity: "0x7676d7e00",
              lock: {
                args: "0x00d7c521f77cae39e7083d1cd664a893395fe25fdb00",
                code_hash:
                  "0x79f90bb5e892d80dd213439eeab551120eb417678824f282b4ffb5f21bad2e1e",
                hash_type: "type",
              },
              type: {
                args: "0x749f79c58129fb18ce425e030e23f127fe60979ef8f69c28a945f4da19fec591",
                code_hash:
                  "0x56abab7961e8348aed629a0e59c05d0f6b555314f8f95606eae4bcb2adafdce3",
                hash_type: "type",
              },
            },
            {
              capacity: "0x2d79883d2000",
              lock: {
                args: "0x0a6d3bb9392242c0357fcae7ccead8f87b428ed280909bfdfaa549529b85df38b155296abb0db5fed6514bf8beda37d18c48302872a826e6a1229fb17fe535febdba580000000000",
                code_hash:
                  "0xfeac11dee7c66e54e4864c177215d0cbb6ebcfbd2fe8e0d2bc45b3413542e2da",
                hash_type: "type",
              },
              type: null,
            },
            {
              capacity: "0xd4bb06f5c4",
              lock: {
                args: "0xd7c521f77cae39e7083d1cd664a893395fe25fdb",
                code_hash:
                  "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                hash_type: "type",
              },
              type: null,
            },
          ],
          outputs_data: [
            "0xede00dbcfd70811334490dae9e992e8b11f50267faadde52255f4add5480505e6cb9d53e85b2e1ed91bacbbda814b897069a261a9bd73a9ede2aade5c9cce3b5d481160011d51f3df0bdec7e838e1ed58339e7fc4fad0b8964cf82143a3efd539b98a551beba58000000000000000000000000000000000000000000000000000000000000000000000000003b4249527e6be9d5ab93affdaaa80db5cf6705021b4aa4d9d9325b0067ee65cc9acc98db8d01000059ba5800000000000001",
            "0x",
            "0x",
          ],
          version: "0x0",
          witnesses: [
            "0xe8030000100000006900000069000000550000005500000010000000550000005500000041000000ec51d97fd3cdf5f1bbaa5bc172f7e9e25510854a651794163fcf944bcde79fc51233e9958124501409f60dc9b15184b1458f4a97ded43e13171f2283f6e8bb68017b0300000000000077030000100000006f030000730300005f0300001c0000006c0100007001000074010000780100005b030000500100002c000000340000005400000074000000940000009c000000c0000000e4000000e80000000c010000bdba5800000000001c000000020000001400000056e6885ff68c995c5d68d5942bf4dbc5835a47c706d7d4ddede17e4a52afdc90a8ca965880baa27bec6f7ec3ffb942ae2f17f2b6b155296abb0db5fed6514bf8beda37d18c48302872a826e6a1229fb17fe535fe9acc98db8d0100006cb9d53e85b2e1ed91bacbbda814b897069a261a9bd73a9ede2aade5c9cce3b5d48116006cb9d53e85b2e1ed91bacbbda814b897069a261a9bd73a9ede2aade5c9cce3b5d481160000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000551904c2068da606b5dcab64c86e77bf5077922fb6c16a3a96e0113849f0fe17000000000000000004000000df0100004c5006d7d4ddede17e4a52afdc90a8ca965880baa27bec6f7ec3ffb942ae2f17f2b64f01502d5fff084bf94715bf4d7f7c2003ee0b3808b940edb6d03ad58edc96d193ddc55045f47b8434de2ce5771bba0823846e63f3d989878effc232b3270b69fd8226d150636fa9425e543c303b9360ab8bbcd9d74c9d76f584a09e079256b21bab1845795097878e925826038c5b226bd8177c97a57581b45f825a6c92b3ef8caf8a6182c74f01501b5a9ed5862faebe746f46b356c9ca79c921d7a592afb32f202d0b49628c790c4f0150797f1309fee27faa48f37878dbc03c90ef1a5c4340c562f2abb29726f8eb12d04f0150187c713c18bc20c4d0f2089f7fac0baa6a7cecc311aac87d0fbea3de7515b84a50e634fc88bfa417e9aeba230fa8499ae1a9ff042bb14c848fd2bc626814c3fc515006d8351b1d24bbcae30fe5cecc5282beb08f4a0d971c5d0b514a58b9aa902bf64f0150eeb02d9e662720409e9ca109061b6ea1cd0b01157ad4ffcad2eb9943f94810a04f0350c7420180aa1c3373d5fa828baa1374fe8ddd326055ee4c2f96394326a61bd9cb50a291161c965d83b9700b3c47549c35b357ad394c06b1c029f56f92c3c0319e744f0150b286795034baa814e085d84ae61d556de8dfe36474603047cf5a93a80e3440ea4fe9040000000000000000000000",
            "0x10000000100000001000000010000000",
            "0x5500000010000000550000005500000041000000420dbea2d44d7731a198d4b7f65aa434d5e60e23147c28574793b25f924d127607bc16f8226a49abf4cd316d2600cec3c0e65af12f9507fdae040c5b112164df00",
          ],
        },
        {
          hash: "0xdfa3266ab2a2b4390d6b6131faba8da46b50746de815f1b135827c85dd8337ab",
          cell_deps: [
            {
              dep_type: "code",
              out_point: {
                index: "0x0",
                tx_hash:
                  "0xbcd73881ba53f1cd95d0c855395c4ffe6f54e041765d9ab7602d48a7cb71612e",
              },
            },
            {
              dep_type: "code",
              out_point: {
                index: "0x0",
                tx_hash:
                  "0xcd52d714ddea04d2917892f16d47cbd0bbbb7d9ba281233ec4021f79fc34bccc",
              },
            },
            {
              dep_type: "dep_group",
              out_point: {
                index: "0x0",
                tx_hash:
                  "0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37",
              },
            },
            {
              dep_type: "code",
              out_point: {
                index: "0x0",
                tx_hash:
                  "0x053fdb4ed3181eab3a3a5f05693b53a8cdec0a24569e16369f444bac48be7de9",
              },
            },
            {
              dep_type: "code",
              out_point: {
                index: "0x0",
                tx_hash:
                  "0x9154df4f7336402114d04495175b37390ce86a4906d2d4001cf02c3e6d97f39c",
              },
            },
          ],
          header_deps: [],
          inputs: [
            {
              previous_output: {
                index: "0x0",
                tx_hash:
                  "0x2403a2d27c5c63422a6afb25d154dcfa100ff659c0d8ec9b2ebfe1a2dd4e0726",
              },
              since: "0x4000000065da0242",
            },
            {
              previous_output: {
                index: "0x1",
                tx_hash:
                  "0x2403a2d27c5c63422a6afb25d154dcfa100ff659c0d8ec9b2ebfe1a2dd4e0726",
              },
              since: "0x0",
            },
            {
              previous_output: {
                index: "0x2",
                tx_hash:
                  "0x2403a2d27c5c63422a6afb25d154dcfa100ff659c0d8ec9b2ebfe1a2dd4e0726",
              },
              since: "0x0",
            },
          ],
          outputs: [
            {
              capacity: "0x7676d7e00",
              lock: {
                args: "0x00c267a8b93cdae15fb06325f11a72b1047bd4d33c00",
                code_hash:
                  "0x79f90bb5e892d80dd213439eeab551120eb417678824f282b4ffb5f21bad2e1e",
                hash_type: "type",
              },
              type: {
                args: "0x86c7429247beba7ddd6e4361bcdfc0510b0b644131e2afb7e486375249a01802",
                code_hash:
                  "0x1e44736436b406f8e48a30dfbddcf044feb0c9eebfe63b0f81cb5bb727d84854",
                hash_type: "type",
              },
            },
            {
              capacity: "0x3691d6afc000",
              lock: {
                args: "0x702359ea7f073558921eb50d8c1c77e92f760c8f8656bde4995f26b8963e2dd8f245705db4fe72be953e4f9ee3808a1700a578341aa80a8b2349c236c4af64e54001590000000000",
                code_hash:
                  "0x7f5a09b8bd0e85bcf2ccad96411ccba2f289748a1c16900b0635c2ed9126f288",
                hash_type: "type",
              },
              type: null,
            },
            {
              capacity: "0xe5f8b1d23a",
              lock: {
                args: "0xc267a8b93cdae15fb06325f11a72b1047bd4d33c",
                code_hash:
                  "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                hash_type: "type",
              },
              type: null,
            },
          ],
          outputs_data: [
            "0xa0cf6037bfc238b179b74a30a9b12e15a4fbdd8881aebc8e5a66a8b5b5c95f0a7a3a615fb0282311f098f7b4ebd53a7c2118ddfbe0faa168f139bf99cd20b6dbf0a802007364c011be661ed576e4e58faf0e43ac5229465250ffbbd48b936c0442b9c48a41015900000000000000000000000000000000000000000000000000000000000000000000000000aeb5b7dbb06d51839aec4049723fe53e1ab05651f3a06e7ada43979dd94ff87d82d098db8d010000dc005900000000000001",
            "0x",
            "0x",
          ],
          version: "0x0",
          witnesses: [
            "0xdc020000100000006900000069000000550000005500000010000000550000005500000041000000593aeeaae0a98286f84e47e7dcd95f5edd29156c8a9431da3221fe721102de0e7976749cd4d78048d1d6b87c536c15f8b45008d383f7bb2f9cd2b0e0db508fe4006f020000000000006b020000100000006302000067020000530200001c0000006c0100007001000074010000780100004f020000500100002c000000340000005400000074000000940000009c000000c0000000e4000000e80000000c01000040015900000000001c0000000200000014000000715ab282b873b79a7be8b0e8c13c4e8966a52040e1ccdbbeb6100df1a0781c180bbe20b809481bb56e345996c1931a4b2c1214adf245705db4fe72be953e4f9ee3808a1700a578341aa80a8b2349c236c4af64e582d098db8d0100007a3a615fb0282311f098f7b4ebd53a7c2118ddfbe0faa168f139bf99cd20b6dbf0a802007a3a615fb0282311f098f7b4ebd53a7c2118ddfbe0faa168f139bf99cd20b6dbf0a802000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000083a5bac5d72705c8f35947ddce53b8dba7d5922d8d84ba0154723ccae524e1b2000000000000000004000000d30000004c4f0650070a47891e62c8f3b168d621d2deed718a563054c01e258fcd0a304a89419f084f01501b77306dd42464905dffbb87f8fbd1da311f7538d2e5082c2c4044eb45bcc60f4f075022e17844935bb9df93699a8300ba2ac9161ba835d35fd5ffe9c444599245bdce4f0250523c6f86dc85a411abab1e91f80ec81487eeefeb98e6352e9c2ea546b5b5cb075047efcb29e34c4b890c5372b17e94df0ce98dffe112ebf532277e663e0e9795f24f01508ad8ce2ac94cf885730b362ca4b81787bf85b48d7f72ef7816130bdc54433f644fe9040000000000000000000000",
            "0x10000000100000001000000010000000",
            "0x5500000010000000550000005500000041000000f0ef2578cb27ea9f6238088ff88c4812b3c4fc3f01094896fc0c37dfb6ad8b893e6af7116aab09bcdeb775bde2e9b01b0381cf3145abee3615b0e47b4845de6a01",
          ],
        },
      ],
      uncles: [],
    });
  });

  test("parse(toJson)", () => {
    const block = BlockV1.unpack(blockBuffer);
    const blockJson = toJson(block);
    const blockParse = BlockV1.parse(blockJson);
    expect(blockParse).toStrictEqual(block);
  });
});
