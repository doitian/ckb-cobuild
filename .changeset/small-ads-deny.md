---
"@ckb-cobuild/molecule": patch
---

:sparkles: Add molecule struct

```ts
import { mol } from "@ckb-cobuild/molecule";
const Point = mol.struct(
  "Point",
  {
    x: mol.byte,
    y: mol.byte,
  },
  ["x", "y"],
);
```
