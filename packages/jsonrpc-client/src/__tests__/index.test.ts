import { JsonRpcError, abortJsonRpcRequest, createJsonRpcClient } from "..";

interface RpcService {
  add(a: number, b: number): number;
}
const ENDPOINT = "https://127.0.0.1:3000/";

describe("createJsonRpcClient", () => {
  const transport = jest.fn();
  const client = createJsonRpcClient<RpcService>(ENDPOINT, {
    transport,
  });

  beforeEach(() => {
    transport.mockClear();
  });

  test("toString", () => {
    expect(client.toString()).toBe(`JsonRpcClient(${ENDPOINT})`);
  });
  test("typeof", () => {
    expect(typeof client).toBe("object");
  });

  describe("RPC Method", () => {
    test("API is down", async () => {
      transport.mockImplementationOnce(() => Promise.reject("API is down"));

      expect.hasAssertions();
      try {
        await client.add(1, 2);
      } catch (error) {
        expect(error).toMatch("API is down");
      }
    });

    test("success", async () => {
      transport.mockImplementationOnce(() =>
        Promise.resolve({
          jsonrpc: "2.0",
          id: 1,
          result: 3,
        }),
      );

      const sum = await client.add(1, 2);
      expect(sum).toBe(3);
      expect(transport).toHaveBeenCalledWith(
        ENDPOINT,
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"params":[1,2]'),
        }),
      );
    });

    test("error", async () => {
      const error = { code: 1, message: "2", data: 3 };
      transport.mockImplementationOnce(() =>
        Promise.resolve({
          jsonrpc: "2.0",
          id: 1,
          error,
        }),
      );

      expect.hasAssertions();
      try {
        await client.add(1, 2);
      } catch (error) {
        if (error instanceof JsonRpcError) {
          expect(error.toString()).toMatch("JsonRpcError: 2");
          expect(error.code).toBe(1);
          expect(error.data).toBe(3);
        }
      }
    });

    test("Invalid response", async () => {
      transport.mockImplementationOnce(() =>
        Promise.resolve({
          jsonrpc: "2.0",
          id: 1,
        }),
      );

      expect.hasAssertions();
      try {
        await client.add(1, 2);
      } catch (error) {
        if (error instanceof TypeError) {
          expect(error.toString()).toMatch("Invalid response");
        }
      }
    });

    test("abort", async () => {
      transport.mockImplementationOnce(
        (_endpoint, { signal }) =>
          new Promise((_resolve, reject) => {
            if (signal.aborted) {
              reject(signal.reason);
            }

            signal.addEventListener("abort", () => {
              reject(signal.reason);
            });
          }),
      );
      expect.hasAssertions();

      const promise = client.add(1, 2);
      abortJsonRpcRequest(promise);

      try {
        await promise;
      } catch (error) {
        if (typeof error === "object" && error !== null) {
          expect(`${error}`).toMatch("AbortError");
        }
      }
    });
  });
});
