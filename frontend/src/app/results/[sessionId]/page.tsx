"use client";

import { ScoreCard } from "@/components/ScoreCard";
import { getEvaluation } from "@/lib/api";
import { EvaluationResult } from "@/lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const dimensions: Array<keyof Omit<EvaluationResult, "overallSummary">> = [
  "clarity",
  "simplicity",
  "patience",
  "warmth",
  "fluency",
];

export default function ResultsPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const response = await getEvaluation(sessionId);
        setEvaluation(response.evaluation);
      } catch {
        setError("Unable to load report.");
      }
    };
    void run();
  }, [sessionId]);

  if (error) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
        <p className="text-red-600">{error}</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to home
        </Link>
      </main>
    );
  }

  if (!evaluation) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
        <p className="text-slate-600">Generating your report...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Interview Report</h1>
      <p className="mt-2 text-slate-600">{evaluation.overallSummary}</p>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {dimensions.map((key) => (
          <ScoreCard key={key} title={key} value={evaluation[key]} />
        ))}
      </section>

      <Link
        href="/"
        className="mt-8 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
      >
        Start New Interview
      </Link>
    </main>
  );
}
