import { DIGITRAFFIC_USER_HEADERS } from "./digitrafficHeaders";

export const GRAPHQL_ENDPOINT = "https://rata.digitraffic.fi/api/v2/graphql/graphql";

const MAX_ATTEMPTS = 3;
const BASE_RETRY_DELAY_MS = 1_000;
const MAX_RETRY_DELAY_MS = 5_000;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

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

export const graphqlFetch = async <T>(
    query: string,
    { signal }: { signal?: AbortSignal } = {},
): Promise<T> => {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        await waitForCooldown(signal);

        let response: Response;
        try {
            response = await fetch(GRAPHQL_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept-Encoding": "gzip",
                    ...DIGITRAFFIC_USER_HEADERS,
                },
                body: JSON.stringify({ query }),
                cache: "no-store",
                signal,
            });
        } catch (error) {
            if (signal?.aborted || attempt === MAX_ATTEMPTS - 1) throw error;

            const delay = Math.min(BASE_RETRY_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS);
            await sleep(delay + Math.random() * 250, signal);
            continue;
        }

        if (response.ok) {
            return (await response.json()) as T;
        }

        if (!RETRYABLE_STATUSES.has(response.status) || attempt === MAX_ATTEMPTS - 1) {
            throw new Error(`Train data not available. HTTP error! status: ${response.status}`);
        }

        const delay = getRetryDelayMs(response, attempt);

        if (response.status === 429) {
            cooldownUntil = Math.max(cooldownUntil, Date.now() + delay);
            continue;
        }

        await sleep(delay + Math.random() * 250, signal);
    }

    throw new Error("Train data not available.");
};
