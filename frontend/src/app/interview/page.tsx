"use client";

import { ChatWindow } from "@/components/ChatWindow";
import { MicButton } from "@/components/MicButton";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { evaluateInterview, sendCandidateTurn, startInterview } from "@/lib/api";
import { InterviewTurn } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function createSessionId() {
  return `session_${Date.now()}`;
}

export default function InterviewPage() {
  const router = useRouter();
  const [sessionId] = useState(createSessionId);
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [loadingTurn, setLoadingTurn] = useState(false);
  const initializedRef = useRef(false);

  const { isSpeaking, speak } = useSpeechSynthesis();

  const { isListening, startListening } = useSpeechRecognition({
    onFinalText: async (text) => {
      setError(null);
      const candidateTurn: InterviewTurn = {
        role: "candidate",
        text,
        timestamp: Date.now(),
      };
      const nextHistory = [...turns, candidateTurn];
      setTurns(nextHistory);

      try {
        setLoadingTurn(true);
        const reply = await sendCandidateTurn(sessionId, text, turns);
        const interviewerTurn: InterviewTurn = {
          role: "interviewer",
          text: reply.replyText,
          timestamp: Date.now(),
        };
        setTurns((prev) => [...prev, interviewerTurn]);
        setVoiceNotice(
          reply.usedTtsFallback
            ? "Hugging Face TTS unavailable, using browser voice fallback."
            : "Playing Hugging Face voice."
        );
        await speak(reply.replyText, reply.audioBase64);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not process your answer.");
      } finally {
        setLoadingTurn(false);
      }
    },
    onNoSpeech: () => {
      setError("No speech detected. Please try again.");
    },
  });

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const run = async () => {
      try {
        setLoadingTurn(true);
        const reply = await startInterview(sessionId);
        const firstTurn: InterviewTurn = {
          role: "interviewer",
          text: reply.replyText,
          timestamp: Date.now(),
        };
        setTurns([firstTurn]);
        setVoiceNotice(
          reply.usedTtsFallback
            ? "Hugging Face TTS unavailable, using browser voice fallback."
            : "Playing Hugging Face voice."
        );
        await speak(reply.replyText, reply.audioBase64);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Interview could not start. Check backend and API keys."
        );
      } finally {
        setLoadingTurn(false);
      }
    };
    void run();
  }, [sessionId, speak]);

  const canUseMic = useMemo(
    () => !loadingTurn && !isSpeaking && turns.length > 0,
    [isSpeaking, loadingTurn, turns.length]
  );

  const endInterview = async () => {
    try {
      setLoadingTurn(true);
      await evaluateInterview(sessionId, turns);
      router.push(`/results/${sessionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evaluation failed.");
    } finally {
      setLoadingTurn(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Interview Session</h1>
        <p className="mt-2 text-slate-600">
          Voice status:{" "}
          <span className="font-semibold">
            {isListening ? "Listening" : isSpeaking ? "Speaking" : "Idle"}
          </span>
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <ChatWindow turns={turns} />
        <TranscriptPanel turns={turns} />
      </section>

      <section className="mt-6 flex flex-wrap items-center gap-3">
        <MicButton isListening={isListening} onClick={startListening} disabled={!canUseMic} />
        <button
          type="button"
          onClick={endInterview}
          disabled={turns.length < 2 || loadingTurn}
          className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          End Interview
        </button>
        {loadingTurn ? <p className="text-sm text-slate-500">Processing...</p> : null}
      </section>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {voiceNotice ? <p className="mt-1 text-sm text-amber-700">{voiceNotice}</p> : null}
    </main>
  );
}
