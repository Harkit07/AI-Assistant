import "dotenv/config";

const getOpenAIAPIResponse = async (messages) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages,
      temperature: 1,
      top_p: 1,
      max_tokens: 4096,
      stream: true,
    }),
  };

  try {
    if (!process.env.OPENAI_API_KEY?.trim()) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const response = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions", // ✅ fixed URL
      options,
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API error: ${response.status} - ${errText}`);
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

      const json = JSON.parse(data);
      const content = json.choices?.[0]?.delta?.content;
      if (typeof content === "string") {
        fullContent += content;
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
      buffer = lines.pop();

      for (const line of lines) {
        appendLine(line);
      }
    }

    if (buffer) {
      appendLine(buffer);
    }

    return fullContent;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export default getOpenAIAPIResponse;
