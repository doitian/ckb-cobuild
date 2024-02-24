---
"@ckb-cobuild/molecule-jsbi": major
---

:sparkles: Molecule integer codecs for bigint (#20)

```ts
import { Uint64 } from "@ckb-lumos/molecule-jsbi";
import JSBI from "jsbi";
const buffer = Uint64.pack(JSBI.BigInt(1));
console.log(buffer);
// => [1, 0, 0, 0, 0, 0, 0, 0],
console.log(JSBI.toNumber(Uint64.unpack(buffer)));
// => 1
```
