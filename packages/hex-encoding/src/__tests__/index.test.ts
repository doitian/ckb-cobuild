// Ported from Go
// https://github.com/golang/go/blob/go1.12.5/src/encoding/hex/hex.go
// Copyright 2009 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// https://github.com/denoland/deno_std/blob/main/encoding/hex_test.ts

import { decodeHex, encodeHex } from "../";

const testCases = [
  // encoded(hex) / decoded(Uint8Array)
  ["", []],
  ["0001020304050607", [0, 1, 2, 3, 4, 5, 6, 7]],
  ["08090a0b0c0d0e0f", [8, 9, 10, 11, 12, 13, 14, 15]],
  ["f0f1f2f3f4f5f6f7", [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7]],
  ["f8f9fafbfcfdfeff", [0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]],
  ["67", Array.from(new TextEncoder().encode("g"))],
  ["e3a1", [0xe3, 0xa1]],
];

const errCases: [string, ErrorConstructor, string][] = [
  // encoded(hex) / error / msg
  ["0", RangeError, ""],
  ["zd4aa", TypeError, "'z'"],
  ["d4aaz", TypeError, "'z'"],
  ["30313", RangeError, ""],
  ["0g", TypeError, "'g'"],
  ["00gg", TypeError, "'g'"],
  ["0\x01", TypeError, "'\x01'"],
  ["ffeed", RangeError, ""],
];

describe("encodeHex()", () => {
  test("handles string", () => {
    const srcStr = "abc";
    const dest = encodeHex(srcStr);
    expect(dest).toEqual("616263");
  });

  test("handles Uint8Array", () => {
    const srcBuf = Uint8Array.of(1, 2);
    const dest = encodeHex(srcBuf);
    expect(dest).toEqual("0102");
  });

  test.each([
    [null, "null"],
    [undefined, "undefined"],
    [{}, "Object"],
    [1, "number"],
  ])("handles %s", (input, typeName) => {
    expect(() => encodeHex(input as string)).toThrow(TypeError);
    expect(() => encodeHex(input as string)).toThrow(typeName);
  });

  test.each(testCases)("into %s", (enc, dec) => {
    const src = new Uint8Array(dec as number[]);
    const dest = encodeHex(src);
    expect(dest.length).toEqual(src.length * 2);
    expect(dest).toEqual(enc);
  });
});

describe("decodeHex()", () => {
  // Case for decoding uppercase hex characters, since
  // Encode always uses lowercase.
  const extraTestcase: [string, number[]][] = [
    ["F8F9FAFBFCFDFEFF", [0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]],
  ];

  test.each(testCases.concat(extraTestcase))("from %s", (enc, dec) => {
    const dest = decodeHex(enc as string);
    expect(dest).toEqual(new Uint8Array(dec as number[]));
  });

  test.each(errCases)("throws on %s", (input, expectedErr, msg) => {
    expect(() => decodeHex(input)).toThrow(expectedErr);
    expect(() => decodeHex(input)).toThrow(msg);
  });
});
