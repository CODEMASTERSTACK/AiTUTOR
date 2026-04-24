import { BACKEND_URL } from "./constants";
import { EvaluationResult, InterviewResponse, InterviewTurn } from "./types";

async function readApiError(res: Response, fallback: string) {
  try {
    const body = (await res.json()) as { message?: string; error?: string };
    return body.error || body.message || fallback;
  } catch {
    return fallback;
  }
}

export async function startInterview(sessionId: string) {
  return sendCandidateTurn(sessionId, "", []);
}

export async function sendCandidateTurn(
  sessionId: string,
  candidateText: string,
  history: InterviewTurn[],
  elapsedSeconds?: number
) {
  const res = await fetch(`${BACKEND_URL}/api/interview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, candidateText, history, elapsedSeconds }),
  });

  if (!res.ok) {
    throw new Error(await readApiError(res, "Interview API failed."));
  }

  return (await res.json()) as InterviewResponse;
}

export async function evaluateInterview(sessionId: string, history: InterviewTurn[]) {
  const res = await fetch(`${BACKEND_URL}/api/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, history }),
  });

  if (!res.ok) {
    throw new Error(await readApiError(res, "Evaluation API failed."));
  }

  return (await res.json()) as { evaluation: EvaluationResult };
}

export async function getEvaluation(sessionId: string) {
  const res = await fetch(`${BACKEND_URL}/api/evaluate/${sessionId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Unable to fetch evaluation."));
  }
  return (await res.json()) as { evaluation: EvaluationResult };
}
