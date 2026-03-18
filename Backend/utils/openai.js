import "dotenv/config";

const getOpenAIAPIResponse = async (message) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: message }],
      temperature: 1,
      top_p: 1,
      max_tokens: 4096,
      stream: true,
    }),
  };

  try {
    const response = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions", // ✅ fixed URL
      options,
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API error: ${response.status} - ${errText}`);
    }

    // ✅ Read the stream and collect full response
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullContent = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;

        if (trimmed.startsWith("data: ")) {
          try {
            const json = JSON.parse(trimmed.slice(6)); // remove "data: " prefix
            const delta = json.choices?.[0]?.delta;

            if (!delta) continue;

            // ✅ Handle main content
            if (delta.content) {
              fullContent += delta.content;
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    }

    return fullContent; // ✅ return complete response to chat.js
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export default getOpenAIAPIResponse;
