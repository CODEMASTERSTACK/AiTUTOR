import { Router } from "express";
import { z } from "zod";
import { getEvaluation, saveEvaluation } from "../services/firebase.js";
import { evaluateTranscript } from "../services/evaluator.js";

const requestSchema = z.object({
  sessionId: z.string().min(1),
  history: z.array(
    z.object({
      role: z.enum(["interviewer", "candidate"]),
      text: z.string(),
      timestamp: z.number(),
    })
  ),
});

export const evaluateRouter = Router();

evaluateRouter.get("/", (_req, res) => {
  return res.status(405).json({
    message: "Use POST /api/evaluate to evaluate, or GET /api/evaluate/:sessionId to fetch a report.",
  });
});

evaluateRouter.post("/", async (req, res) => {
  try {
    const { sessionId, history } = requestSchema.parse(req.body);
    const evaluation = await evaluateTranscript(history);
    await saveEvaluation(sessionId, evaluation);
    return res.json({ evaluation });
  } catch (error) {
    return res.status(400).json({
      message: "Unable to evaluate interview.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

evaluateRouter.get("/:sessionId", async (req, res) => {
  const evaluation = await getEvaluation(req.params.sessionId);
  if (!evaluation) {
    return res.status(404).json({ message: "Evaluation not found." });
  }
  return res.json({ evaluation });
});
