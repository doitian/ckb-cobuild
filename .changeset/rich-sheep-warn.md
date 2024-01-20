---
"@ckb-cobuild/molecule": patch
---

:recycle: Change preprocess to around

```ts
import { mol } from "@ckb-cobuild/molecule";

const ByteOpt = mol.option("ByteOpt", mol.byte);
const BooleanOpt = ByteOpt.around({
  safeParse: (input: boolean | null) => mol.parseSuccess(input),
  willPack: (input: boolean | null) =>
    input !== null ? (input ? 1 : 0) : null,
  didUnpack: (value: number | null) => (value !== null ? value !== 0 : null),
});
```
