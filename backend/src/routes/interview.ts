import { Router } from "express";
import { z } from "zod";
import { saveTurn } from "../services/firebase.js";
import { ChatMessage, generateReply } from "../services/llm.js";
import {
  BASE_QUESTIONS,
  buildInterviewerPrompt,
  toChatMessages,
} from "../services/promptBuilder.js";
import { synthesizeToBase64 } from "../services/tts.js";

const requestSchema = z.object({
  sessionId: z.string().min(1),
  candidateText: z.string(),
  history: z.array(
    z.object({
      role: z.enum(["interviewer", "candidate"]),
      text: z.string(),
      timestamp: z.number(),
    })
  ),
});

export const interviewRouter = Router();

interviewRouter.post("/", async (req, res) => {
  try {
    const { sessionId, candidateText, history } = requestSchema.parse(req.body);

    // Initial greeting
    if (!candidateText.trim() && history.length === 0) {
      const firstQuestion = `Hi there! I'm your AI recruiter today. We'll keep this brief and conversational. To start us off, could you quickly introduce yourself and tell me your name?`;
      const tts = await synthesizeToBase64(firstQuestion);
      await saveTurn(sessionId, {
        role: "interviewer",
        text: firstQuestion,
        timestamp: Date.now(),
      });
      return res.json({
        replyText: firstQuestion,
        reprompt: false,
        fallbackUsed: false,
        audioBase64: tts.audioBase64,
        usedTtsFallback: tts.usedFallback,
      });
    }

    // Dynamic Edge Case Evaluation
    const wordCount = candidateText.trim().split(/\s+/).filter(Boolean).length;
    const isVeryShort = wordCount > 0 && wordCount <= 4;
    const isRambling = wordCount > 70;
    const isSilent = !candidateText.trim();

    await saveTurn(sessionId, {
      role: "candidate",
      text: isSilent ? "[Silence / Inaudible]" : candidateText,
      timestamp: Date.now(),
    });

    const messages: ChatMessage[] = [
      { role: "system" as const, content: buildInterviewerPrompt() },
      ...toChatMessages(history),
      { role: "user" as const, content: isSilent ? "[User said nothing]" : candidateText },
    ];

    const llm = await generateReply(messages);
    const tts = await synthesizeToBase64(llm.text);

    await saveTurn(sessionId, {
      role: "interviewer",
      text: llm.text,
      timestamp: Date.now(),
    });

    return res.json({
      replyText: llm.text,
      reprompt: isVeryShort || isSilent,
      fallbackUsed: llm.fallbackUsed,
      audioBase64: tts.audioBase64,
      usedTtsFallback: tts.usedFallback,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Unable to generate interview response.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
