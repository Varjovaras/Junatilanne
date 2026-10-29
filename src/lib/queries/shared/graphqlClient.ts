import { DIGITRAFFIC_USER_HEADERS } from "./digitrafficHeaders";

const GRAPHQL_ENDPOINT = "https://rata.digitraffic.fi/api/v2/graphql/graphql";

const MAX_ATTEMPTS = 3;
const BASE_RETRY_DELAY_MS = 1_000;
const MAX_RETRY_DELAY_MS = 5_000;
const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

export type GraphQLError = {
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: Record<string, unknown>;
};

export type GraphQLResponse<T> = {
    data?: T | null;
    errors?: GraphQLError[] | null;
};

export class GraphQLResponseError extends Error {
    readonly errors: GraphQLError[];

    constructor(message: string, errors: GraphQLError[] = [], options?: ErrorOptions) {
        super(message, options);
        this.name = "GraphQLResponseError";
        this.errors = errors;
    }
}

type GraphQLTelemetryEvent =
    | {
          event: "retry";
          operation: string;
          attempt: number;
          nextAttempt: number;
          delayMs: number;
          reason: "network" | "http";
          status?: number;
          error?: string;
      }
    | {
          event: "rate_limited";
          operation: string;
          attempt: number;
          cooldownMs: number;
          cooldownUntil: number;
      }
    | {
          event: "graphql_error";
          operation: string;
          errorCount: number;
          messages: string[];
      }
    | { event: "timeout"; operation: string; timeoutMs: number };

// This app does not have a telemetry backend yet. Keeping all client logs behind
// this helper makes it easy to forward these events somewhere else later.
const logGraphQLTelemetry = (event: GraphQLTelemetryEvent) => {
    console.warn("[graphql]", event);
};

const getOperationName = (query: string): string => {
    const namedOperation = query.match(
        /\b(?:query|mutation|subscription)\s+([_A-Za-z][_0-9A-Za-z]*)/,
    );
    if (namedOperation?.[1]) return namedOperation[1];

    const rootField = query.match(/\{\s*([_A-Za-z][_0-9A-Za-z]*)/);
    return rootField?.[1] ?? "anonymous";
};

const createTimeoutError = (operation: string, timeoutMs: number): Error => {
    const error = new Error(`GraphQL request timed out after ${timeoutMs} ms (${operation})`);
    error.name = "TimeoutError";
    return error;
};

type RequestContext = {
    signal: AbortSignal;
    timedOut: () => boolean;
    timeoutError: Error;
    dispose: () => void;
};

const createRequestContext = (
    callerSignal: AbortSignal | undefined,
    timeoutMs: number,
    operation: string,
): RequestContext => {
    const controller = new AbortController();
    const timeoutError = createTimeoutError(operation, timeoutMs);
    let timedOut = false;

    const abortFromCaller = () => {
        controller.abort(
            callerSignal?.reason ?? new DOMException("The operation was aborted.", "AbortError"),
        );
    };

    if (callerSignal?.aborted) {
        abortFromCaller();
    } else {
        callerSignal?.addEventListener("abort", abortFromCaller, { once: true });
    }

    const timer = setTimeout(() => {
        timedOut = true;
        logGraphQLTelemetry({ event: "timeout", operation, timeoutMs });
        controller.abort(timeoutError);
    }, timeoutMs);

    return {
        signal: controller.signal,
        timedOut: () => timedOut,
        timeoutError,
        dispose: () => {
            clearTimeout(timer);
            callerSignal?.removeEventListener("abort", abortFromCaller);
        },
    };
};

// When Fintraffic rate limits us, let every concurrent request wait for the
// same cooldown instead of each one hammering the endpoint with its own retry.
let cooldownUntil = 0;

const sleep = (ms: number, signal?: AbortSignal): Promise<void> =>
    new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(signal.reason ?? new DOMException("The operation was aborted.", "AbortError"));
            return;
        }

        let timer: ReturnType<typeof setTimeout>;

        const onAbort = () => {
            clearTimeout(timer);
            reject(signal?.reason ?? new DOMException("The operation was aborted.", "AbortError"));
        };

        timer = setTimeout(() => {
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, ms);

        signal?.addEventListener("abort", onAbort, { once: true });
    });

const waitForCooldown = async (signal?: AbortSignal) => {
    const waitMs = cooldownUntil - Date.now();
    if (waitMs > 0) await sleep(waitMs, signal);
};

const getRetryDelayMs = (response: Response, attempt: number): number => {
    const retryAfter = response.headers.get("retry-after");
    if (retryAfter) {
        const seconds = Number(retryAfter);
        if (Number.isFinite(seconds) && seconds >= 0) {
            return Math.min(seconds * 1_000, MAX_RETRY_DELAY_MS);
        }

        const date = Date.parse(retryAfter);
        if (Number.isFinite(date)) {
            return Math.min(Math.max(date - Date.now(), 0), MAX_RETRY_DELAY_MS);
        }
    }

    return Math.min(BASE_RETRY_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const getErrorMessage = (error: unknown): string =>
    error instanceof Error ? error.message : String(error);

const parseGraphQLResponse = <T>(body: unknown, operation: string): T => {
    if (!isRecord(body)) {
        throw new GraphQLResponseError(`GraphQL response was not a JSON object (${operation})`);
    }

    const { data, errors } = body as GraphQLResponse<unknown>;

    if (errors != null && !Array.isArray(errors)) {
        throw new GraphQLResponseError(
            `GraphQL response contained an invalid errors field (${operation})`,
        );
    }

    if (errors && errors.length > 0) {
        const messages = errors.map((error) =>
            isRecord(error) && typeof error.message === "string"
                ? error.message
                : "Unknown GraphQL error",
        );

        logGraphQLTelemetry({
            event: "graphql_error",
            operation,
            errorCount: errors.length,
            messages,
        });

        throw new GraphQLResponseError(
            `GraphQL request failed (${operation}): ${messages.join("; ")}`,
            errors,
        );
    }

    if (!("data" in body) || data === undefined || data === null) {
        throw new GraphQLResponseError(`GraphQL response contained no data (${operation})`);
    }

    return data as T;
};

export const graphqlFetch = async <T>(
    query: string,
    {
        signal,
        variables,
        operationName,
        timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
    }: {
        signal?: AbortSignal;
        variables?: Record<string, unknown>;
        operationName?: string;
        timeoutMs?: number;
    } = {},
): Promise<T> => {
    const operation = operationName ?? getOperationName(query);
    const request = createRequestContext(signal, timeoutMs, operation);

    try {
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
            await waitForCooldown(request.signal);

            let response: Response;
            try {
                response = await fetch(GRAPHQL_ENDPOINT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept-Encoding": "gzip",
                        ...DIGITRAFFIC_USER_HEADERS,
                    },
                    body: JSON.stringify({ query, variables }),
                    cache: "no-store",
                    signal: request.signal,
                });
            } catch (error) {
                if (request.timedOut()) throw request.timeoutError;
                if (signal?.aborted || attempt === MAX_ATTEMPTS - 1) throw error;

                const delay = Math.min(BASE_RETRY_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS);

                logGraphQLTelemetry({
                    event: "retry",
                    operation,
                    attempt: attempt + 1,
                    nextAttempt: attempt + 2,
                    delayMs: delay,
                    reason: "network",
                    error: getErrorMessage(error),
                });

                await sleep(delay + Math.random() * 250, request.signal);
                continue;
            }

            if (response.ok) {
                let body: unknown;
                try {
                    body = await response.json();
                } catch (error) {
                    if (request.timedOut()) throw request.timeoutError;

                    throw new GraphQLResponseError(
                        `GraphQL response was not valid JSON (${operation})`,
                        [],
                        { cause: error },
                    );
                }

                return parseGraphQLResponse<T>(body, operation);
            }

            if (!RETRYABLE_STATUSES.has(response.status) || attempt === MAX_ATTEMPTS - 1) {
                throw new Error(`Train data not available. HTTP error! status: ${response.status}`);
            }

            const delay = getRetryDelayMs(response, attempt);

            if (response.status === 429) {
                cooldownUntil = Math.max(cooldownUntil, Date.now() + delay);
                logGraphQLTelemetry({
                    event: "rate_limited",
                    operation,
                    attempt: attempt + 1,
                    cooldownMs: delay,
                    cooldownUntil,
                });
                continue;
            }

            logGraphQLTelemetry({
                event: "retry",
                operation,
                attempt: attempt + 1,
                nextAttempt: attempt + 2,
                delayMs: delay,
                reason: "http",
                status: response.status,
            });

            await sleep(delay + Math.random() * 250, request.signal);
        }

        throw new Error("Train data not available.");
    } finally {
        request.dispose();
    }
};
