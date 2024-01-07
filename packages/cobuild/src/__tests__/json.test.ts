import { BI } from "@ckb-lumos/bi";
import {
  AnyCodec,
  bytes,
  number,
  createBytesCodec,
  createFixedBytesCodec,
  molecule,
} from "@ckb-lumos/codec";

import { StringCodec, Uint32LE, BytesVec } from "..";
import { fromJson, toJson } from "../json";

const testCaseIn = {
  aCase: 1,
  bCase: null,
  cCase: undefined,
  dCase: true,
  eCase: false,
  fCase: BI.from(2),
  gCase: "g",
  hCase: new Uint8Array(3),
  iCase: ["0x"],
};

const testCaseOut = {
  aCase: "0x1",
  bCase: null,
  cCase: null,
  dCase: true,
  eCase: false,
  fCase: "0x2",
  gCase: "g",
  hCase: "0x000000",
  iCase: ["0x"],
};

const Boolean = createFixedBytesCodec<boolean>({
  pack: (value) => new Uint8Array([value ? 1 : 0]),
  unpack: (buffer) => buffer[0] !== 0,
  byteLength: 1,
});
const Uint8ArrayCodec = createBytesCodec<Uint8Array>({
  pack: bytes.bytify,
  unpack: (buffer) => buffer,
});
const UndefinedCodec = createFixedBytesCodec<undefined>({
  pack: () => new Uint8Array(0),
  unpack: () => undefined,
  byteLength: 0,
});
const NullCodec = createFixedBytesCodec<null>({
  pack: () => new Uint8Array(0),
  unpack: () => null,
  byteLength: 0,
});
const codecs: Record<string, AnyCodec> = {
  aCase: Uint32LE,
  bCase: NullCodec,
  cCase: UndefinedCodec,
  dCase: Boolean,
  eCase: Boolean,
  fCase: number.Uint64LE,
  gCase: StringCodec,
  hCase: Uint8ArrayCodec,
  iCase: BytesVec,
};
const ObjectCodec = molecule.table(codecs, [
  "aCase",
  "bCase",
  "cCase",
  "dCase",
  "eCase",
  "fCase",
  "gCase",
  "hCase",
  "iCase",
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const testCases: [any, any, AnyCodec | undefined][] = [
  [testCaseIn, testCaseOut, ObjectCodec],
  [Object.values(testCaseIn), Object.values(testCaseOut), undefined],
];
for (const [name, value] of Object.entries(testCaseIn)) {
  testCases.push([
    value,
    testCaseOut[name as keyof typeof testCaseOut],
    codecs[name],
  ]);
}

describe("toJson", () => {
  test.each(testCases)("(%p)", (input, expected) => {
    expect(toJson(input)).toStrictEqual(expected);
  });
});

describe("fromJson", () => {
  test.each(testCases.filter((testCase) => testCase[2] !== undefined))(
    "(%p)",
    (expected, input, codec) => {
      expect(fromJson(codec as AnyCodec, input)).toStrictEqual(expected);
    },
  );
});
