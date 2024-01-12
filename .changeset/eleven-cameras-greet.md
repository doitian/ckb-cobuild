---
"@ckb-cobuild/molecule": patch
---

:sparkles: Add array

```ts
import { mol } from "@ckb-cobuild/molecule";
const Byte32 = mol.byteArray("Byte32", 32);
const Point = mol.array("Point", Byte32, 2);
```
