import "dotenv/config";

const getOpenAIAPIResponse = async (messages, onToken) => {
  const requestMessages = [
    {
      role: "system",
      content:
        "Reply in English by default. Reply in Hindi only when the user explicitly asks for Hindi. Do not use other languages. Keep programming code and identifiers unchanged, and explain them in English.",
    },
    ...messages,
  ];

  const options = {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: requestMessages,
      temperature: 1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 1500,
      stream: true,
      reasoning_effort: "low",
    }),
  };

  try {
    if (!process.env.OPENAI_API_KEY?.trim()) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const response = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      options,
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API error: ${response.status} - ${errText}`);
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/event-stream")) {
      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;

      if (typeof content !== "string" || !content.trim()) {
        throw new Error("AI provider returned an empty response");
      }

      onToken?.(content);
      return content;
    }

    if (!response.body) {
      throw new Error("AI provider returned an empty response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullContent = "";
    let buffer = "";

    const appendLine = (line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) return;

      const data = trimmed.slice(5).trim();
      if (!data || data === "[DONE]") return;

      const event = JSON.parse(data);
      const token = event.choices?.[0]?.delta?.content;
      if (typeof token === "string") {
        fullContent += token;
        onToken?.(token);
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        buffer += decoder.decode();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      lines.forEach(appendLine);
    }

    if (buffer) appendLine(buffer);
    if (!fullContent) throw new Error("AI provider returned an empty response");

    return fullContent;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export default getOpenAIAPIResponse;
