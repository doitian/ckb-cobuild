---
"@ckb-cobuild/molecule": patch
---

:sparkles: Add fixvec

Add both fixvec and byteFixvec

```ts
import { mol } from "@ckb-cobuild/molecule";
const Bytes = mol.byteFixvec("Bytes", mol.byte);
```
