/* eslint-disable @typescript-eslint/no-explicit-any */

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params: any[];
}

export interface JsonRpcSuccessResponse {
  jsonrpc: "2.0";
  id?: string | number | null;
  result: any;
}

export interface JsonRpcErrorResponse {
  jsonrpc: "2.0";
  id?: string | number | null;
  error: {
    code: number;
    message: string;
    data?: any;
  };
}

export type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse;

export type JsonRpcTransport = (
  endpoint: RequestInfo | URL,
  fetchOptions?: RequestInit,
) => Promise<JsonRpcResponse>;

export type JsonRpcFetchOptions = RequestInit & {
  transport?: JsonRpcTransport;
};

export class JsonRpcError extends Error {
  code: number;
  data?: unknown;

  constructor(error: JsonRpcErrorResponse["error"]) {
    super(error.message);
    this.name = "JsonRpcError";
    this.code = error.code;
    this.data = error.data;
    // https://www.typescriptlang.org/docs/handbook/2/classes.html#inheriting-built-in-types
    Object.setPrototypeOf(this, JsonRpcError.prototype);
  }
}

type Promisify<T> = T extends (...args: any[]) => Promise<any>
  ? T
  : T extends (...args: infer TArgs) => infer TReturn
    ? (...args: TArgs) => Promise<TReturn>
    : T; // not a function;
type PromisifyService<TService extends object> = {
  [K in keyof TService]: Promisify<TService[K]>;
};

const abortControllers = new WeakMap<Promise<any>, AbortController>();

/**
 * Abort an ongoing request using the response promise.
 * @example
 * ```ts
 * import { createJsonRpcClient, abortJsonRpcRequest } from "@ckb-cobuild/jsonrpc-client";
 * const client = createJsonRpcClient<AddService>("http://127.0.0.1:3000");
 * const resp = client.add(1, 2);
 * abortJsonRpcRequest(resp);
 * ```
 */
export function abortJsonRpcRequest(responsePromise: Promise<any>) {
  const ac = abortControllers.get(responsePromise);
  ac?.abort();
}

export function createJsonRpcRequest(
  method: string,
  params: any[],
  id = Date.now(),
): JsonRpcRequest {
  return {
    jsonrpc: "2.0",
    id,
    method,
    params,
  };
}

function okOrThrow(response: JsonRpcResponse): any {
  if ("result" in response) {
    return response.result;
  } else if ("error" in response) {
    throw new JsonRpcError(response.error);
  }
  throw new TypeError("Invalid response");
}

export async function fetchTransport(
  endpoint: RequestInfo | URL,
  fetchOptions?: RequestInit,
): Promise<JsonRpcResponse> {
  const res = await fetch(endpoint, fetchOptions);
  if (!res.ok) {
    throw new JsonRpcError({ message: res.statusText, code: res.status });
  }
  return await res.json();
}

export function fetchJsonRpcResult(
  endpoint: RequestInfo | URL,
  req: JsonRpcRequest,
  fetchOptions?: JsonRpcFetchOptions,
): Promise<any> {
  let ac = null;
  if (!fetchOptions?.signal) {
    ac = new AbortController();
    fetchOptions = fetchOptions ? { ...fetchOptions } : {};
    fetchOptions.signal = ac.signal;
  }

  const promise = fetchJsonRpcResponse(endpoint, req, fetchOptions).then(
    okOrThrow,
  );

  if (ac !== null) {
    abortControllers.set(promise, ac);
  }
  promise
    .finally(() => {
      abortControllers.delete(promise);
    })
    .catch(() => {});

  return promise;
}

export function fetchJsonRpcResponse(
  endpoint: RequestInfo | URL,
  req: JsonRpcRequest,
  fetchOptions?: JsonRpcFetchOptions,
): Promise<JsonRpcResponse> {
  const mergedOptions: RequestInit = {
    method: "POST",
    body: JSON.stringify(req),
    headers: {},
    ...(fetchOptions ?? {}),
  };
  mergedOptions.headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...mergedOptions.headers,
  };

  let ac = null;
  if (!mergedOptions.signal) {
    ac = new AbortController();
    mergedOptions.signal = ac.signal;
  }

  const transport = fetchOptions?.transport ?? fetchTransport;
  const promise = transport(endpoint, mergedOptions);

  if (ac !== null) {
    abortControllers.set(promise, ac);
  }
  promise
    .finally(() => {
      abortControllers.delete(promise);
    })
    .catch(() => {});

  return promise;
}

export function createJsonRpcClient<TService extends object>(
  endpoint: RequestInfo | URL,
  fetchOptions?: JsonRpcFetchOptions,
): PromisifyService<TService> {
  const name = `JsonRpcClient(${endpoint})`;
  const target = {
    toString: () => name,
  };
  return new Proxy(target, {
    get(target, prop, receiver) {
      if (typeof prop === "symbol" || prop in Object.prototype) {
        return Reflect.get(target, prop, receiver);
      }
      return (...args: any) => {
        return fetchJsonRpcResult(
          endpoint,
          createJsonRpcRequest(prop, args),
          fetchOptions,
        );
      };
    },
  }) as PromisifyService<TService>;
}
