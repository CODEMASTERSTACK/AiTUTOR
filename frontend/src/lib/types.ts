export type Role = "interviewer" | "candidate";

export interface InterviewTurn {
  role: Role;
  text: string;
  timestamp: number;
}

export interface InterviewResponse {
  replyText: string;
  reprompt?: boolean;
  fallbackUsed?: boolean;
  audioBase64?: string;
  usedTtsFallback?: boolean;
}

export interface DimensionScore {
  score: number;
  reasoning: string;
  evidenceQuote: string;
}

export interface EvaluationResult {
  clarity: DimensionScore;
  simplicity: DimensionScore;
  patience: DimensionScore;
  warmth: DimensionScore;
  fluency: DimensionScore;
  overallSummary: string;
}
