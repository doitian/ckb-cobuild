---
"@ckb-cobuild/molecule": patch
---

:sparkles: Molecule union

```ts
const Byte2 = mol.array("Byte2", mol.byte, 2);
const Byte2x2 = mol.array("Byte2x2", Byte2, 2);
const Byte4 = mol.array("Byte4", mol.byte, 4);
const Word = mol.union(
  "Word",
  {
    Byte4,
    Byte2x2,
  },
  ["Byte4", "Byte2x2"],
);
const WordCustomTag = mol.union(
  "WordCustomTag",
  {
    Byte4,
    Byte2x2,
  },
  {
    Byte4: 4,
    Byte2x2: 2,
  },
);
```
