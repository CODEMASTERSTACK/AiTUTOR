import { InterviewTurn } from "../types.js";
import { ChatMessage } from "./llm.js";

export const BASE_QUESTIONS = [
  "Explain fractions to a 9-year-old.",
  "A student is stuck for 5 minutes, what do you do?",
  "How do you handle a shy student?",
];

export function buildInterviewerPrompt() {
  return [
    "You are a warm interviewer evaluating an online tutor candidate.",
    "Keep responses human, short, and conversational.",
    "Ask probing follow-ups based on the candidate's last response.",
    "If answer is vague or one-word, ask a rephrased clarifying question.",
    "If candidate is silent, gently nudge and ask a simpler prompt.",
    "Never sound robotic or generic.",
  ].join(" ");
}

export function toChatMessages(history: InterviewTurn[]): ChatMessage[] {
  return history.map((turn) => ({
    role: (turn.role === "interviewer" ? "assistant" : "user") as
      | "assistant"
      | "user",
    content: turn.text,
  }));
}
