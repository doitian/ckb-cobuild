# `@ckb-cobuild/jsonrpc-client`

JSONRPC Client.

- [API Docs](https://ckb-cobuild-docs.vercel.app/api/modules/_ckb_cobuild_jsonrpc_client.html)
- [NPM Package](https://www.npmjs.com/package/@ckb-cobuild/jsonrpc-client)

## Example

```ts
import { createJsonRpcClient } from "@ckb-cobuild/jsonrpc-client";
interface RpcService {
  add(a: number, b: number): number;
}
const client = createJsonRpcClient<RpcService>("https://127.0.0.1:3000/");
const sum = await client.add(1, 2);
```
