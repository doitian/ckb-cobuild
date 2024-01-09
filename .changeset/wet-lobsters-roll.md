---
"@ckb-cobuild/cobuild": major
---

Name unpack result same name as codec.

- Move all codecs in `@ckb-lumos/codec` to a module `builtins`.
- Name all unpack result types using the same name as the codec itself.

Example:

```
export type BuildingPacket = UnpackResult<typeof BuildingPacket>;
```
