---
"@ckb-cobuild/molecule-json": patch
"@ckb-cobuild/molecule": patch
---

:bug: Ensure beforeParse reserve fixed codec

Ensure beforeParse and beforeSafeParse returns FixedSizeCodec on FixedSizeCodec,
and returns DynamicSizeCodec on DynamicSizeCodec.
