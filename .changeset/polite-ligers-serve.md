---
"@ckb-cobuild/molecule": patch
---

:sparkles: Molecule table

```ts
import { mol } from "@ckb-cobuild/molecule";
const Point = mol.tableFromEntries("Point", [
  ["x", mol.byte],
  ["y", mol.byte],
]);
```
