---
"@ckb-cobuild/molecule-bigint": major
---

:sparkles: Molecule integer codecs for bigint

```ts
import { Uint64 } from "@ckb-cobuild/molecule-bigint";
const buffer = Uint64.pack(1n);
console.log(buffer);
// => [1, 0, 0, 0, 0, 0, 0, 0],
console.log(Uint64.unpack(buffer));
// => 1n
```
