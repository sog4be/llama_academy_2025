interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LLMRequestOptions {
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface LLMResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

const SAMBANOVA_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions";
const SAMBANOVA_MODEL = "Llama-4-Maverick-17B-128E-Instruct";
const SAMBANOVA_API_TOKEN = process.env.SAMBANOVA_API_TOKEN;

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "meta-llama/llama-4-maverick-17b-128e-instruct";
const GROQ_API_TOKEN = process.env.GROQ_API_TOKEN;

/**
 * Calls LLM API with automatic fallback from SambaNova to Groq on rate limit
 *
 * @param options - Request options including messages, temperature, etc.
 * @returns LLM response
 * @throws Error if both APIs fail
 */
export async function callLLMWithFallback(
  options: LLMRequestOptions
): Promise<LLMResponse> {
  const { messages, temperature = 0.7, max_tokens = 500, stream = false } = options;

  // Try SambaNova first
  const sambaNovaResponse = await fetch(SAMBANOVA_ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SAMBANOVA_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: SAMBANOVA_MODEL,
      messages,
      stream,
      temperature,
      max_tokens,
    }),
  });

  // If rate limit hit (429), fallback to Groq
  if (sambaNovaResponse.status === 429) {
    const errorText = await sambaNovaResponse.text();
    console.log("SambaNova rate limit hit (429), falling back to Groq...", errorText);

    // Fallback to Groq
    const groqResponse = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        stream,
        temperature,
        max_tokens,
      }),
    });

    if (!groqResponse.ok) {
      const groqErrorText = await groqResponse.text();
      console.error("Groq API error:", groqErrorText);

      // If Groq also hits rate limit, throw special error
      if (groqResponse.status === 429) {
        throw new Error("RATE_LIMIT_BOTH");
      }

      throw new Error(`Groq API request failed: ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    console.log("Successfully fell back to Groq API");
    return groqData;
  }

  // For other SambaNova errors, throw
  if (!sambaNovaResponse.ok) {
    const errorText = await sambaNovaResponse.text();
    console.error("SambaNova API error:", errorText);
    throw new Error(`SambaNova API request failed: ${sambaNovaResponse.status}`);
  }

  const data = await sambaNovaResponse.json();
  return data;
}
