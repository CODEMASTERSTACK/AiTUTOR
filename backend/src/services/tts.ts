import axios from "axios";

const HUGGINGFACE_TTS_URLS = [
  "https://router.huggingface.co/hf-inference/models",
  "https://api-inference.huggingface.co/models",
];
const DEFAULT_HF_MODEL = "hexgrad/Kokoro-82M";
const RECENT_TTS_TTL_MS = 60_000;
const recentTtsCache = new Map<string, { audioBase64: string; expiresAt: number }>();

function cacheKey(model: string, text: string) {
  return `${model}:${text.trim()}`;
}

export async function synthesizeToBase64(text: string) {
  const apiKey = process.env.HUGGINGFACE_API_KEY?.trim();
  const model = process.env.HUGGINGFACE_TTS_MODEL?.trim() || DEFAULT_HF_MODEL;
  const normalizedText = text.trim();

  if (!apiKey || !normalizedText) {
    return { audioBase64: undefined, usedFallback: true };
  }

  const key = cacheKey(model, normalizedText);
  const cached = recentTtsCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return { audioBase64: cached.audioBase64, usedFallback: false };
  }

  for (const baseUrl of HUGGINGFACE_TTS_URLS) {
    try {
      const res = await axios.post(
        `${baseUrl}/${model}`,
        {
          inputs: normalizedText,
          options: {
            wait_for_model: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "audio/wav",
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        }
      );

      const audioBase64 = Buffer.from(res.data).toString("base64");
      recentTtsCache.set(key, {
        audioBase64,
        expiresAt: Date.now() + RECENT_TTS_TTL_MS,
      });
      return { audioBase64, usedFallback: false };
    } catch (error) {
      const maybeAxios = error as {
        response?: { status?: number; data?: Buffer | string };
        message?: string;
      };
      let detail = "";
      if (maybeAxios?.response?.data) {
        let raw = "";
        try {
          raw =
            typeof maybeAxios.response.data === "string"
              ? maybeAxios.response.data
              : Buffer.from(maybeAxios.response.data).toString("utf-8");
          const parsed = JSON.parse(raw) as { detail?: { status?: string; message?: string } };
          detail = parsed?.detail?.status || parsed?.detail?.message || raw;
        } catch {
          detail =
            raw.slice(0, 250).trim() ||
            (typeof maybeAxios.response.data === "string"
              ? maybeAxios.response.data
              : "unparseable_error");
        }
      }
      // eslint-disable-next-line no-console
      console.error(
        `Hugging Face TTS endpoint failed (${baseUrl}, status: ${maybeAxios?.response?.status ?? "unknown"}, detail: ${detail || maybeAxios?.message || "unknown"}).`
      );
    }
  }

  try {
    throw new Error("All Hugging Face TTS endpoints failed.");
  } catch (error) {
    const maybeAxios = error as {
      response?: { status?: number; data?: Buffer | string };
      message?: string;
    };
    // eslint-disable-next-line no-console
    console.error(
      `Hugging Face TTS failed (${maybeAxios?.message || "unknown"}). Using browser fallback.`
    );
    return { audioBase64: undefined, usedFallback: true };
  }
}
