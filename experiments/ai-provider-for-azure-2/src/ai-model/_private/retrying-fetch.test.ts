import asyncFn from "@async-fn/jest";
import { getRetryingFetch } from "./retrying-fetch";

const buildResponse = (status: number, body = ""): Response => new Response(body, { status });

const buildDnsError = () =>
  Object.assign(new TypeError("fetch failed"), { cause: new Error("getaddrinfo ENOTFOUND example.openai.azure.com") });

const okJson = (extra: Record<string, unknown> = {}) => buildResponse(200, JSON.stringify({ ok: true, ...extra }));

describe("retrying-fetch", () => {
  const noSleep = () => Promise.resolve();
  const fixedRandom = () => 0;
  const chatUrl =
    "https://example.openai.azure.com/openai/deployments/some-deployment/chat/completions?api-version=2024-02-01";

  describe("happy path", () => {
    it("when upstream returns 200, returns the response without retrying", async () => {
      const upstream = asyncFn<typeof fetch>();
      const retrying = getRetryingFetch({
        upstreamFetch: upstream,
        forceMaxCompletionTokens: false,
        sleep: noSleep,
        random: fixedRandom,
      });

      const responsePromise = retrying(chatUrl);
      await upstream.resolve(okJson());
      const response = await responsePromise;

      expect(response.status).toBe(200);
      expect(upstream).toHaveBeenCalledTimes(1);
    });
  });

  describe("DNS / transient network errors", () => {
    it("when upstream throws DNS error once then resolves, returns the eventual response", async () => {
      const upstream = asyncFn<typeof fetch>();
      const retrying = getRetryingFetch({
        upstreamFetch: upstream,
        forceMaxCompletionTokens: false,
        sleep: noSleep,
        random: fixedRandom,
      });

      const responsePromise = retrying(chatUrl);
      await upstream.reject(buildDnsError());
      await upstream.resolve(okJson());
      const response = await responsePromise;

      expect(response.status).toBe(200);
      expect(upstream).toHaveBeenCalledTimes(2);
    });

    it("when upstream throws DNS error every attempt, retries up to maxAttempts then throws", async () => {
      const upstream = asyncFn<typeof fetch>();
      const retrying = getRetryingFetch({
        upstreamFetch: upstream,
        forceMaxCompletionTokens: false,
        sleep: noSleep,
        random: fixedRandom,
      });

      const settled = retrying(chatUrl).then(
        () => undefined,
        (err) => err,
      );
      await upstream.reject(buildDnsError());
      await upstream.reject(buildDnsError());
      await upstream.reject(buildDnsError());
      const caught = await settled;

      expect(caught).toBeInstanceOf(TypeError);
      expect(String((caught as Error & { cause?: unknown }).cause)).toContain("ENOTFOUND");
      expect(upstream).toHaveBeenCalledTimes(3);
    });
  });

  describe("private-endpoint / public-access-disabled handling", () => {
    it("when upstream returns 403 'Public access is disabled' once then 200, returns the 200", async () => {
      const upstream = asyncFn<typeof fetch>();
      const retrying = getRetryingFetch({
        upstreamFetch: upstream,
        forceMaxCompletionTokens: false,
        sleep: noSleep,
        random: fixedRandom,
      });

      const responsePromise = retrying(chatUrl);
      await upstream.resolve(
        buildResponse(403, '{"error":"Public access is disabled. Please configure private endpoint."}'),
      );
      await upstream.resolve(okJson());
      const response = await responsePromise;

      expect(response.status).toBe(200);
      expect(upstream).toHaveBeenCalledTimes(2);
    });

    it("when upstream consistently returns 403 'Public access is disabled', returns the final 403", async () => {
      const upstream = asyncFn<typeof fetch>();
      const retrying = getRetryingFetch({
        upstreamFetch: upstream,
        forceMaxCompletionTokens: false,
        sleep: noSleep,
        random: fixedRandom,
      });

      const responsePromise = retrying(chatUrl);
      await upstream.resolve(buildResponse(403, '{"error":"Public access is disabled"}'));
      await upstream.resolve(buildResponse(403, '{"error":"Public access is disabled"}'));
      await upstream.resolve(buildResponse(403, '{"error":"Public access is disabled"}'));
      const response = await responsePromise;

      expect(response.status).toBe(403);
      expect(upstream).toHaveBeenCalledTimes(3);
    });
  });

  describe("non-retryable errors", () => {
    it("when upstream returns 401, returns it immediately without retry", async () => {
      const upstream = asyncFn<typeof fetch>();
      const retrying = getRetryingFetch({
        upstreamFetch: upstream,
        forceMaxCompletionTokens: false,
        sleep: noSleep,
        random: fixedRandom,
      });

      const responsePromise = retrying(chatUrl);
      await upstream.resolve(buildResponse(401, '{"error":"Unauthorized"}'));
      const response = await responsePromise;

      expect(response.status).toBe(401);
      expect(upstream).toHaveBeenCalledTimes(1);
    });

    it("when upstream returns plain 403 (no private-endpoint marker), returns it without retry", async () => {
      const upstream = asyncFn<typeof fetch>();
      const retrying = getRetryingFetch({
        upstreamFetch: upstream,
        forceMaxCompletionTokens: false,
        sleep: noSleep,
        random: fixedRandom,
      });

      const responsePromise = retrying(chatUrl);
      await upstream.resolve(buildResponse(403, '{"error":"Forbidden"}'));
      const response = await responsePromise;

      expect(response.status).toBe(403);
      expect(upstream).toHaveBeenCalledTimes(1);
    });
  });

  describe("5xx handling", () => {
    it("when upstream returns 503 once then 200, returns the 200", async () => {
      const upstream = asyncFn<typeof fetch>();
      const retrying = getRetryingFetch({
        upstreamFetch: upstream,
        forceMaxCompletionTokens: false,
        sleep: noSleep,
        random: fixedRandom,
      });

      const responsePromise = retrying(chatUrl);
      await upstream.resolve(buildResponse(503));
      await upstream.resolve(okJson());
      const response = await responsePromise;

      expect(response.status).toBe(200);
      expect(upstream).toHaveBeenCalledTimes(2);
    });
  });

  describe("force max_completion_tokens body rewrite", () => {
    it("when forceMaxCompletionTokens is true and body has max_tokens, rewrites to max_completion_tokens", async () => {
      const upstream = asyncFn<typeof fetch>();
      const retrying = getRetryingFetch({
        upstreamFetch: upstream,
        forceMaxCompletionTokens: true,
        sleep: noSleep,
        random: fixedRandom,
      });

      const responsePromise = retrying(chatUrl, {
        method: "POST",
        body: JSON.stringify({ model: "gpt-5.4", max_tokens: 4096, messages: [] }),
      });
      await upstream.resolve(okJson());
      await responsePromise;

      const init = upstream.mock.calls[0]?.[1] as RequestInit;
      const body = JSON.parse(init.body as string);

      expect(body.max_completion_tokens).toBe(4096);
      expect(body.max_tokens).toBeUndefined();
    });

    it("when forceMaxCompletionTokens is false, leaves the body unchanged", async () => {
      const upstream = asyncFn<typeof fetch>();
      const retrying = getRetryingFetch({
        upstreamFetch: upstream,
        forceMaxCompletionTokens: false,
        sleep: noSleep,
        random: fixedRandom,
      });

      const originalBody = JSON.stringify({ model: "gpt-5.4", max_tokens: 4096, messages: [] });
      const responsePromise = retrying(chatUrl, { method: "POST", body: originalBody });
      await upstream.resolve(okJson());
      await responsePromise;

      const init = upstream.mock.calls[0]?.[1] as RequestInit;
      expect(init.body).toBe(originalBody);
    });

    it("when forceMaxCompletionTokens is true but the URL is not a chat-completions URL, leaves the body unchanged", async () => {
      const upstream = asyncFn<typeof fetch>();
      const retrying = getRetryingFetch({
        upstreamFetch: upstream,
        forceMaxCompletionTokens: true,
        sleep: noSleep,
        random: fixedRandom,
      });

      const originalBody = JSON.stringify({ model: "gpt-5.4", max_tokens: 4096 });
      const responsePromise = retrying("https://example.openai.azure.com/openai/deployments/some/embeddings", {
        method: "POST",
        body: originalBody,
      });
      await upstream.resolve(okJson());
      await responsePromise;

      const init = upstream.mock.calls[0]?.[1] as RequestInit;
      expect(init.body).toBe(originalBody);
    });

    it("when forceMaxCompletionTokens is true and body already has max_completion_tokens, leaves it alone and drops max_tokens", async () => {
      const upstream = asyncFn<typeof fetch>();
      const retrying = getRetryingFetch({
        upstreamFetch: upstream,
        forceMaxCompletionTokens: true,
        sleep: noSleep,
        random: fixedRandom,
      });

      const responsePromise = retrying(chatUrl, {
        method: "POST",
        body: JSON.stringify({ max_tokens: 100, max_completion_tokens: 4096, messages: [] }),
      });
      await upstream.resolve(okJson());
      await responsePromise;

      const init = upstream.mock.calls[0]?.[1] as RequestInit;
      const body = JSON.parse(init.body as string);

      expect(body.max_completion_tokens).toBe(4096);
      expect(body.max_tokens).toBeUndefined();
    });
  });

  describe("abort signal", () => {
    it("when the signal is already aborted, throws AbortError without calling upstream", async () => {
      const upstream = asyncFn<typeof fetch>();
      const retrying = getRetryingFetch({
        upstreamFetch: upstream,
        forceMaxCompletionTokens: false,
        sleep: noSleep,
        random: fixedRandom,
      });

      const controller = new AbortController();
      controller.abort();

      const caught = await retrying(chatUrl, { signal: controller.signal }).then(
        () => undefined,
        (err) => err,
      );

      expect((caught as { name?: string })?.name).toBe("AbortError");
      expect(upstream).not.toHaveBeenCalled();
    });
  });
});
