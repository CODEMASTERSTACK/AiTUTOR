import axios from "axios";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function generateReply(messages: ChatMessage[]) {
  const groqKey = process.env.GROQ_API_KEY;
  const groqModel = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openRouterModel =
    process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct";

  if (groqKey) {
    try {
      const res = await axios.post(
        GROQ_URL,
        { model: groqModel, messages, temperature: 0.6 },
        { headers: { Authorization: `Bearer ${groqKey}` } }
      );
      return {
        text: res.data?.choices?.[0]?.message?.content as string,
        fallbackUsed: false,
      };
    } catch {
      // Fallback below.
    }
  }

  if (!openRouterKey) {
    throw new Error("No configured LLM provider.");
  }

  const res = await axios.post(
    OPENROUTER_URL,
    { model: openRouterModel, messages, temperature: 0.6 },
    {
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return {
    text: res.data?.choices?.[0]?.message?.content as string,
    fallbackUsed: true,
  };
}
