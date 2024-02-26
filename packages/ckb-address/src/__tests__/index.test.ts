import { decodeHex } from "@ckb-cobuild/hex-encoding";
import { bech32m } from "bech32";
import { encodeCkbAddress, decodeCkbAddress, Script } from "..";

function seq(length: number): Uint8Array {
  return Uint8Array.from(new Array(length).keys());
}

function fakeAddress(prefix: string, buf: Uint8Array): string {
  return bech32m.encode(prefix, bech32m.toWords(buf), 1023);
}

const SECP256K1_CODE_HASH = decodeHex(
  "9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
);

const validScripts: { script: Script; ckb: string; ckt: string }[] = [
  {
    script: {
      code_hash: seq(32),
      hash_type: "data",
      args: Uint8Array.of(),
    },
    ckb: "ckb1qqqqzqsrqszsvpcgpy9qkrqdpc83qygjzv2p29shrqv35xcur50p7qqk9vs9f",
    ckt: "ckt1qqqqzqsrqszsvpcgpy9qkrqdpc83qygjzv2p29shrqv35xcur50p7qqtr3rgd",
  },
  {
    script: {
      code_hash: new Uint8Array(32),
      hash_type: "type",
      args: Uint8Array.of(),
    },
    ckb: "ckb1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqgt0ezqs",
    ckt: "ckt1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqgkfy3d5",
  },
  {
    script: {
      code_hash: seq(32),
      hash_type: "data1",
      args: Uint8Array.of(33),
    },
    ckb: "ckb1qqqqzqsrqszsvpcgpy9qkrqdpc83qygjzv2p29shrqv35xcur50p7q3pkdytrn",
    ckt: "ckt1qqqqzqsrqszsvpcgpy9qkrqdpc83qygjzv2p29shrqv35xcur50p7q3pfedp74",
  },
  {
    script: {
      code_hash: new Uint8Array(32),
      hash_type: "data2",
      args: Uint8Array.of(33),
    },
    ckb: "ckb1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpppzcq0y0",
    ckt: "ckt1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpppavf9ef",
  },
  {
    script: {
      code_hash: SECP256K1_CODE_HASH,
      hash_type: "type",
      args: decodeHex("29a96825573ea6c1177db9bdddf24c8066fdfa55"),
    },
    ckb: "ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqff495z24e75mq3wldehhwlynyqvm7l54g7f7x2w",
    ckt: "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqff495z24e75mq3wldehhwlynyqvm7l54gsm4fqk",
  },
];

describe("encodeCkbAddress", () => {
  test.each(validScripts)('($script, "ckb")', ({ script, ckb }) => {
    expect(encodeCkbAddress(script, "ckb")).toEqual(ckb);
  });

  test.each(validScripts)('($script, "ckt")', ({ script, ckt }) => {
    expect(encodeCkbAddress(script, "ckt")).toEqual(ckt);
  });

  describe("TypeError", () => {
    test.each([
      {
        code_hash: new Uint8Array(31),
        hash_type: "data",
        args: new Uint8Array(),
      },
      {
        code_hash: new Uint8Array(33),
        hash_type: "data",
        args: new Uint8Array(),
      },
      {
        code_hash: new Uint8Array(32),
        hash_type: "data0",
        args: new Uint8Array(),
      },
    ])("(%p)", (script) => {
      expect(() =>
        encodeCkbAddress(script as unknown as Script, "ckb"),
      ).toThrow(TypeError);
    });

    test("invalid prefix", () => {
      expect(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        encodeCkbAddress(validScripts[0]!.script, "ckx" as any),
      ).toThrow(TypeError);
    });
  });
});

describe("decodeCkbAddress", () => {
  test.each(validScripts)("($ckb)", ({ script, ckb }) => {
    expect(decodeCkbAddress(ckb)).toEqual(script);
  });

  test.each(validScripts)("($ckt)", ({ script, ckt }) => {
    expect(decodeCkbAddress(ckt)).toEqual(script);
  });

  describe("TypeError", () => {
    const invalidChecksum = "c" + fakeAddress("kb", new Uint8Array(34));

    test.each([
      ["", "too short"],
      [invalidChecksum, "Invalid checksum"],
    ])("(%p)", (address, error) => {
      expect(() => decodeCkbAddress(address)).toThrow(error);
    });

    test.each([
      fakeAddress("ckx", new Uint8Array(34)),
      fakeAddress("ckb", new Uint8Array(33)),
      fakeAddress("ckb", Uint8Array.of(1, ...new Array(33))),
      fakeAddress("ckb", Uint8Array.of(...new Array(33), 3)),
    ])("(%p)", (address) => {
      expect(() => decodeCkbAddress(address)).toThrow(TypeError);
    });
  });
});
