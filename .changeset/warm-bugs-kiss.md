---
"@ckb-cobuild/molecule": patch
---

:sparkles: Add dynvec and vector

```ts
import { mol } from "@ckb-cobuild/molecule";
const ByteOpt = mol.option("ByteOpt", mol.byte);
const ByteOptVec = mol.dynvec("ByteOptVec", ByteOpt);
const ByteOptVec2 = mol.vector("ByteOptVec2", ByteOpt);
```
