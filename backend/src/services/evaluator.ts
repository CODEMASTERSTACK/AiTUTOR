import { z } from "zod";
import { InterviewTurn } from "../types.js";
import { generateReply } from "./llm.js";

function toText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const candidateKeys = ["text", "quote", "value", "summary", "content", "reasoning"];
    for (const key of candidateKeys) {
      if (typeof record[key] === "string") return record[key] as string;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return "";
}

function toScore(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (!Number.isNaN(n)) return n;
  }
  return 3;
}

const dimensionSchema = z.object({
  score: z.preprocess(toScore, z.number().min(1).max(5)),
  reasoning: z.preprocess(toText, z.string().min(1)),
  evidenceQuote: z.preprocess(toText, z.string().min(1)),
});

export const evaluationSchema = z.object({
  clarity: dimensionSchema,
  simplicity: dimensionSchema,
  patience: dimensionSchema,
  warmth: dimensionSchema,
  fluency: dimensionSchema,
  overallSummary: z.preprocess(toText, z.string().min(1)),
});

function buildEvaluationPrompt(history: InterviewTurn[]) {
  return [
    "Evaluate this tutor interview transcript.",
    "Return only valid JSON.",
    "Use keys: clarity, simplicity, patience, warmth, fluency, overallSummary.",
    "Each dimension must include score(1-5), reasoning, evidenceQuote (exact quote).",
    "Be strict and evidence-based.",
    "",
    JSON.stringify(history),
  ].join("\n");
}

function extractJson(content: string) {
  const cleaned = content
    .replace(/```json/gi, "```")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    if (start >= 0) {
      let depth = 0;
      let inString = false;
      let escaped = false;

      for (let i = start; i < cleaned.length; i += 1) {
        const ch = cleaned[i];

        if (inString) {
          if (escaped) {
            escaped = false;
          } else if (ch === "\\") {
            escaped = true;
          } else if (ch === "\"") {
            inString = false;
          }
          continue;
        }

        if (ch === "\"") {
          inString = true;
          continue;
        }
        if (ch === "{") depth += 1;
        if (ch === "}") {
          depth -= 1;
          if (depth === 0) {
            const candidate = cleaned.slice(start, i + 1);
            return JSON.parse(candidate);
          }
        }
      }
    }
    throw new Error("Model did not return JSON.");
  }
}

function normalizePayload(raw: unknown) {
  if (!raw || typeof raw !== "object") {
    return raw;
  }
  const obj = raw as Record<string, unknown>;
  const pickDimension = (key: string) =>
    (obj[key] as Record<string, unknown> | undefined) ?? {};

  return {
    clarity: pickDimension("clarity"),
    simplicity: pickDimension("simplicity"),
    patience: pickDimension("patience"),
    warmth: pickDimension("warmth"),
    fluency: pickDimension("fluency"),
    overallSummary:
      obj.overallSummary ??
      obj.summary ??
      obj.finalSummary ??
      obj.overall_feedback ??
      "",
  };
}

export async function evaluateTranscript(history: InterviewTurn[]) {
  const initial = await generateReply([
    {
      role: "system",
      content:
        "You are an interview evaluator. Return strict JSON only with no markdown.",
    },
    { role: "user", content: buildEvaluationPrompt(history) },
  ]);

  try {
    return evaluationSchema.parse(normalizePayload(extractJson(initial.text)));
  } catch {
    const repaired = await generateReply([
      {
        role: "system",
        content:
          "Fix malformed JSON. Return strict valid JSON only and keep original intent. Ensure evidenceQuote and overallSummary are plain strings.",
      },
      { role: "user", content: initial.text },
    ]);

    return evaluationSchema.parse(normalizePayload(extractJson(repaired.text)));
  }
}
