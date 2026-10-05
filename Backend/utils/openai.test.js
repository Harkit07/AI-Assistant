import assert from "node:assert/strict";
import test from "node:test";
import getOpenAIAPIResponse from "./openai.js";

test("includes the final streamed event when it has no trailing newline", async () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalFetch = globalThis.fetch;
  const encoder = new TextEncoder();
  const finalEvent = 'data: {"choices":[{"delta":{"content":" world"}}]}';

  process.env.OPENAI_API_KEY = "test-api-key";
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://integrate.api.nvidia.com/v1/chat/completions");
    assert.equal(options.headers.Authorization, "Bearer test-api-key");

    return new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
            ),
          );
          controller.enqueue(encoder.encode(finalEvent));
          controller.close();
        },
      }),
    );
  };

  try {
    assert.equal(await getOpenAIAPIResponse([]), "Hello world");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
  }
});

test("fails clearly when the provider API key is missing", async () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalFetch = globalThis.fetch;
  let fetchCalled = false;

  delete process.env.OPENAI_API_KEY;
  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error("fetch should not be called without an API key");
  };

  try {
    await assert.rejects(
      getOpenAIAPIResponse([]),
      /OPENAI_API_KEY is not configured/,
    );
    assert.equal(fetchCalled, false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey !== undefined) {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
  }
});
