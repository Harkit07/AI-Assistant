import assert from "node:assert/strict";
import test from "node:test";
import getOpenAIAPIResponse from "./openai.js";

test("streams completion tokens and returns the full reply", async () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalFetch = globalThis.fetch;
  const messages = [{ role: "user", content: "Hello" }];
  const requestMessages = [
    {
      role: "system",
      content:
        "Reply in English by default. Reply in Hindi only when the user explicitly asks for Hindi. Do not use other languages. Keep programming code and identifiers unchanged, and explain them in English.",
    },
    ...messages,
  ];
  const tokens = [];

  process.env.OPENAI_API_KEY = "test-api-key";
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://integrate.api.nvidia.com/v1/chat/completions");
    assert.equal(options.headers.Authorization, "Bearer test-api-key");
    assert.equal(options.headers.Accept, "text/event-stream");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(options.body), {
      model: "openai/gpt-oss-20b",
      messages: requestMessages,
      temperature: 0.6,
      top_p: 0.7,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 800,
      stream: true,
      reasoning_effort: "low",
    });

    return new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode(
              'data: {"choices":[{"delta":{"content":"Hello"}}]}\n' +
                'data: {"choices":[{"delta":{"content":" there"}}]}\n' +
                "data: [DONE]\n",
            ),
          );
          controller.close();
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
        },
      },
    );
  };

  try {
    assert.equal(
      await getOpenAIAPIResponse(messages, (token) => tokens.push(token)),
      "Hello there",
    );
    assert.deepEqual(tokens, ["Hello", " there"]);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
  }
});

test("supports a JSON completion response if the provider does not stream", async () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalFetch = globalThis.fetch;
  const tokens = [];

  process.env.OPENAI_API_KEY = "test-api-key";
  globalThis.fetch = async () =>
    Response.json({
      choices: [{ message: { content: "JSON fallback reply" } }],
    });

  try {
    assert.equal(
      await getOpenAIAPIResponse(
        [{ role: "user", content: "Hello" }],
        (token) => tokens.push(token),
      ),
      "JSON fallback reply",
    );
    assert.deepEqual(tokens, ["JSON fallback reply"]);
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
