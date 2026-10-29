import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { GraphQLResponseError, graphqlFetch } from "./graphqlClient";

const originalFetch = globalThis.fetch;

const jsonResponse = (body: unknown, init?: ResponseInit): Response =>
    new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
        ...init,
    });

const mockFetch = (
    handler: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
) => {
    globalThis.fetch = handler as typeof fetch;
};

afterEach(() => {
    globalThis.fetch = originalFetch;
});

describe("graphqlFetch", () => {
    test("returns the GraphQL data payload", async () => {
        let requestBody: { query?: string; variables?: Record<string, unknown> } | undefined;

        mockFetch(async (_input, init) => {
            requestBody = JSON.parse(String(init?.body));
            return jsonResponse({
                data: { currentlyRunningTrains: [{ trainNumber: 1 }] },
            });
        });

        const result = await graphqlFetch<{
            currentlyRunningTrains: Array<{ trainNumber: number }>;
        }>("query Trains { currentlyRunningTrains { trainNumber } }", {
            variables: { station: "HKI" },
        });

        expect(result.currentlyRunningTrains[0]?.trainNumber).toBe(1);
        expect(requestBody?.variables).toEqual({ station: "HKI" });
    });

    test("throws a descriptive error for GraphQL errors without retrying", async () => {
        let calls = 0;

        mockFetch(async () => {
            calls += 1;
            return jsonResponse({
                errors: [{ message: 'Cannot query field "missing" on type "Train".' }],
            });
        });

        const request = graphqlFetch("query Broken { missing }");

        await expect(request).rejects.toThrow(
            'GraphQL request failed (Broken): Cannot query field "missing" on type "Train".',
        );

        try {
            await request;
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLResponseError);
            expect((error as GraphQLResponseError).errors).toHaveLength(1);
        }

        expect(calls).toBe(1);
    });

    test("throws when the response has no data", async () => {
        mockFetch(async () => jsonResponse({ data: null }));

        await expect(graphqlFetch("query Empty { trains }")).rejects.toThrow(
            "GraphQL response contained no data (Empty)",
        );

        mockFetch(async () => jsonResponse({}));

        await expect(graphqlFetch("query Empty { trains }")).rejects.toThrow(
            "GraphQL response contained no data (Empty)",
        );
    });

    test("throws when the response body is not valid JSON", async () => {
        mockFetch(async () => new Response("not json", { status: 200 }));

        await expect(graphqlFetch("query Broken { trains }")).rejects.toThrow(
            "GraphQL response was not valid JSON (Broken)",
        );
    });

    test("logs and retries a 429 cooldown", async () => {
        const warn = spyOn(console, "warn").mockImplementation(() => {});
        let calls = 0;

        mockFetch(async () => {
            calls += 1;

            if (calls === 1) {
                return new Response(null, {
                    status: 429,
                    headers: { "Retry-After": "0" },
                });
            }

            return jsonResponse({ data: { ok: true } });
        });

        const result = await graphqlFetch<{ ok: boolean }>("query Rate { ok }");

        expect(result).toEqual({ ok: true });
        expect(calls).toBe(2);
        expect(warn).toHaveBeenCalledWith(
            "[graphql]",
            expect.objectContaining({ event: "rate_limited", operation: "Rate" }),
        );

        warn.mockRestore();
    });

    test("times out the whole request", async () => {
        mockFetch(
            (_input, init) =>
                new Promise((_resolve, reject) => {
                    const signal = init?.signal;

                    if (signal?.aborted) {
                        reject(signal.reason);
                        return;
                    }

                    signal?.addEventListener("abort", () => reject(signal.reason), {
                        once: true,
                    });
                }),
        );

        await expect(graphqlFetch("query Slow { slow }", { timeoutMs: 20 })).rejects.toThrow(
            "GraphQL request timed out after 20 ms (Slow)",
        );
    });

    test("propagates caller cancellation", async () => {
        const controller = new AbortController();

        mockFetch(
            (_input, init) =>
                new Promise((_resolve, reject) => {
                    const signal = init?.signal;

                    if (signal?.aborted) {
                        reject(signal.reason);
                        return;
                    }

                    signal?.addEventListener("abort", () => reject(signal.reason), {
                        once: true,
                    });
                }),
        );

        const request = graphqlFetch("query Slow { slow }", {
            signal: controller.signal,
        });

        controller.abort(new Error("Request cancelled by the caller"));

        await expect(request).rejects.toThrow("Request cancelled by the caller");
    });
});
