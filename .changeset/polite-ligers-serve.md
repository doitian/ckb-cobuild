---
"@ckb-cobuild/molecule": patch
---

:sparkles: Molecule table

```ts
import { mol } from "@ckb-cobuild/molecule";
const Point = mol.table("Point", {
  x: mol.byte,
  y, mol.byte,
], ["x", "y"]);
```
