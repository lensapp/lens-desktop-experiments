export interface RetryingFetchOptions {
  upstreamFetch: typeof fetch;
  forceMaxCompletionTokens: boolean;
  /** Maximum total attempts (initial + retries). Defaults to 3. */
  maxAttempts?: number;
  /** Base backoff ms; doubles each retry then jittered up to ±50%. Defaults to 500. */
  baseBackoffMs?: number;
  /** Override sleeper for tests. */
  sleep?: (ms: number) => Promise<void>;
  /** Override random for jitter in tests. Returns 0..1. */
  random?: () => number;
}

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BASE_BACKOFF_MS = 500;

const DNS_ERROR_FRAGMENTS = ["ENOTFOUND", "EAI_AGAIN", "getaddrinfo", "ECONNRESET", "ETIMEDOUT"];

const PRIVATE_ENDPOINT_BODY_FRAGMENT = "Public access is disabled";

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const isDnsLikeError = (error: unknown): boolean => {
  if (!error) {
    return false;
  }
  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? `${error.message} ${(error as Error & { cause?: unknown }).cause ?? ""}`
        : "";
  return DNS_ERROR_FRAGMENTS.some((fragment) => message.includes(fragment));
};

const isRetryableStatus = (status: number): boolean => status >= 500 && status < 600;

const isPrivateEndpointBlock = async (response: Response): Promise<boolean> => {
  if (response.status !== 403) {
    return false;
  }
  try {
    const text = await response.clone().text();
    return text.includes(PRIVATE_ENDPOINT_BODY_FRAGMENT);
  } catch {
    return false;
  }
};

const isChatCompletionsUrl = (url: string): boolean =>
  /\/openai\/(?:deployments\/[^/]+\/)?chat\/completions/i.test(url) || /\/v1\/chat\/completions/i.test(url);

const rewriteMaxTokensToMaxCompletionTokens = (body: BodyInit | null | undefined): BodyInit | null | undefined => {
  if (body === null || body === undefined) {
    return body;
  }
  if (typeof body !== "string") {
    return body;
  }
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const hasMaxTokens = "max_tokens" in parsed && parsed.max_tokens !== undefined && parsed.max_tokens !== null;
      const hasMaxCompletion =
        "max_completion_tokens" in parsed &&
        parsed.max_completion_tokens !== undefined &&
        parsed.max_completion_tokens !== null;

      if (hasMaxTokens && !hasMaxCompletion) {
        parsed.max_completion_tokens = parsed.max_tokens;
      }
      delete parsed.max_tokens;
      return JSON.stringify(parsed);
    }
  } catch {
    // Not JSON or otherwise unparseable — leave as-is.
  }
  return body;
};

const maybeRewriteBody = (url: string, init: RequestInit | undefined, force: boolean): RequestInit | undefined => {
  if (!force) {
    return init;
  }
  if (!isChatCompletionsUrl(url)) {
    return init;
  }
  const body = init?.body;
  const rewritten = rewriteMaxTokensToMaxCompletionTokens(body);
  if (rewritten === body) {
    return init;
  }
  return { ...init, body: rewritten };
};

export const getRetryingFetch = (options: RetryingFetchOptions): typeof fetch => {
  const {
    upstreamFetch,
    forceMaxCompletionTokens,
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    baseBackoffMs = DEFAULT_BASE_BACKOFF_MS,
    sleep = defaultSleep,
    random = Math.random,
  } = options;

  const retryingFetch: typeof fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const adjustedInit = maybeRewriteBody(url, init, forceMaxCompletionTokens);
    const signal = adjustedInit?.signal ?? (input instanceof Request ? input.signal : undefined);

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      if (signal?.aborted) {
        throw signal.reason ?? new DOMException("Aborted", "AbortError");
      }

      try {
        const response = await upstreamFetch(input, adjustedInit);

        if (isRetryableStatus(response.status) || (await isPrivateEndpointBlock(response))) {
          if (attempt < maxAttempts) {
            await sleep(backoffMs(attempt, baseBackoffMs, random));
            continue;
          }
        }

        return response;
      } catch (error) {
        lastError = error;
        if (attempt >= maxAttempts || !isDnsLikeError(error)) {
          throw error;
        }
        await sleep(backoffMs(attempt, baseBackoffMs, random));
      }
    }

    throw lastError ?? new Error("retrying-fetch exhausted attempts");
  };

  return retryingFetch;
};

const backoffMs = (attempt: number, base: number, random: () => number): number => {
  const exponential = base * 3 ** (attempt - 1);
  const jitter = exponential * (random() * 0.5);
  return Math.floor(exponential + jitter);
};
