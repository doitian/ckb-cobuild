---
"@ckb-cobuild/molecule": patch
---

:bug: Fix unpack buffer offset bug

Create `DataView` from `Uint8Array.buffer` does not inherit the
byte offset. The correct way is:

```ts
const bytes = Uint8Array(20);
const slice = bytes.subarray(4, 8);
const view = new DataView(slice.buffer, slice.byteOffset);
```
