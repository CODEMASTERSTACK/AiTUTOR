"use client";

import { ScoreCard } from "@/components/ScoreCard";
import { getEvaluation } from "@/lib/api";
import { EvaluationResult } from "@/lib/types";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Clock, ShieldCheck, AlertOctagon, Target } from "lucide-react";

type DimensionKey = "clarity" | "simplicity" | "patience" | "warmth" | "fluency";
const dimensions: Array<DimensionKey> = [
  "clarity",
  "simplicity",
  "patience",
  "warmth",
  "fluency",
];

function ResultsContent() {
  const params = useParams<{ sessionId: string }>();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId;
  
  const rawTime = searchParams.get("time");
  const durationSeconds = rawTime ? parseInt(rawTime, 10) || 0 : 0;
  const mm = Math.floor(durationSeconds / 60).toString().padStart(2, '0');
  const ss = (durationSeconds % 60).toString().padStart(2, '0');

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
      <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10 flex items-center justify-center">
        <p className="text-red-600 bg-red-50 px-6 py-4 rounded-xl border border-red-200">{error}</p>
      </main>
    );
  }

  if (!evaluation) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 font-sans animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-10 text-center space-y-4 flex flex-col items-center">
          <div className="h-10 bg-gray-200 rounded-lg w-3/4 max-w-2xl"></div>
          <div className="h-4 bg-gray-200 rounded-md w-1/2 max-w-md"></div>
        </div>

        {/* Hero Banner Skeleton */}
        <div className="w-full p-6 md:p-8 rounded-3xl border border-gray-100 bg-gray-50 mb-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-full bg-gray-200 shrink-0 flex items-center justify-center relative">
             {/* Spinner inside skeleton avatar */}
             <div className="absolute w-8 h-8 border-4 border-gray-300 border-t-[#e36c39] rounded-full animate-spin"></div>
          </div>
          <div className="flex-1 w-full space-y-3 flex flex-col items-center md:items-start">
            <div className="h-4 bg-gray-200 rounded-md w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded-lg w-full md:w-2/3"></div>
            <div className="h-5 bg-gray-200 rounded-md w-1/2"></div>
          </div>
          <div className="flex flex-row gap-4 w-full md:w-auto justify-center">
             <div className="w-full md:w-32 h-28 bg-gray-200 rounded-2xl"></div>
             <div className="w-full md:w-32 h-28 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>

        {/* Evaluator Summary Skeleton */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 md:p-8 mb-10">
          <div className="grid md:grid-cols-2 gap-8">
             <div className="space-y-4">
               <div className="h-5 bg-gray-200 rounded-md w-1/3 mb-4"></div>
               <div className="h-4 bg-gray-200 rounded-md w-full"></div>
               <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
               <div className="h-4 bg-gray-200 rounded-md w-4/6"></div>
             </div>
             <div className="space-y-4">
               <div className="h-5 bg-gray-200 rounded-md w-1/3 mb-4"></div>
               <div className="h-4 bg-gray-200 rounded-md w-full"></div>
               <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
               <div className="h-4 bg-gray-200 rounded-md w-4/6"></div>
             </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
             <div className="h-4 bg-gray-200 rounded-md w-1/4 mb-2"></div>
             <div className="h-4 bg-gray-200 rounded-md w-full"></div>
             <div className="h-4 bg-gray-200 rounded-md w-full"></div>
          </div>
        </div>

        {/* Dimension Grids Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-gray-50 border border-gray-100 rounded-2xl"></div>
          ))}
        </div>
      </main>
    );
  }

  // Calculate algorithmic pass threshold
  const sum = dimensions.reduce((acc, dim) => acc + (evaluation[dim]?.score || 0), 0);
  const avgScore = sum / dimensions.length;
  // Threshold >= 3.5 requires candidates to perform above average consistently
  const isPass = avgScore >= 3.5;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 font-sans">
      <div className="mb-10 text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">CANDIDATE DOSSIER: {evaluation.candidateName.toUpperCase()}</h1>
        <p className="text-gray-500 uppercase tracking-widest text-sm font-semibold">Department of Recruitment & Selection • Confidential</p>
      </div>

      {/* Hero Decision Banner */}
      <section className={`w-full p-6 md:p-8 rounded-3xl border shadow-sm mb-10 flex flex-col md:flex-row items-center gap-8 ${
        isPass ? 'bg-[#f4fcf6] border-[#d4f3dd]' : 'bg-[#fff5f5] border-[#fce8e8]'
      }`}>
        <div className={`p-5 rounded-full ${isPass ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {isPass ? <ShieldCheck className="w-12 h-12" /> : <AlertOctagon className="w-12 h-12" />}
        </div>
        <div className="flex-1 text-center md:text-left">
          <p className="text-sm font-bold tracking-widest text-gray-400 mb-1 uppercase">Final Assessment Outcome</p>
          <h2 className={`text-3xl font-bold mb-2 ${isPass ? 'text-green-700' : 'text-[#e36c39]'}`}>
            {isPass ? 'Cleared • Proceed to Next Round' : 'Review Pending • Growth Opportunities Identified'}
          </h2>
          <p className="text-gray-600 font-medium">Standardized Aggregate Competency Score: <span className="font-bold text-gray-900">{avgScore.toFixed(1)} / 5.0</span></p>
        </div>
        <div className="flex flex-row w-full md:w-auto gap-4">
           <div className="flex-1 md:flex-none flex flex-col items-center justify-center p-4 bg-white border border-gray-100 shadow-sm rounded-2xl md:w-32">
             <Target className="w-6 h-6 text-[#e36c39] mb-1" />
             <span className="text-2xl font-black text-gray-900">{avgScore.toFixed(1)}</span>
             <span className="text-[10px] uppercase font-bold text-gray-400">Net Score</span>
           </div>
           <div className="flex-1 md:flex-none flex flex-col items-center justify-center p-4 bg-white border border-gray-100 shadow-sm rounded-2xl md:w-32">
             <Clock className="w-6 h-6 text-[#e36c39] mb-1" />
             <span className="text-2xl font-black text-gray-900">{durationSeconds > 0 ? `${mm}:${ss}` : 'N/A'}</span>
             <span className="text-[10px] uppercase font-bold text-gray-400">Round Time</span>
           </div>
        </div>
      </section>

      {/* Evaluator Summary Block */}
      <section className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 mb-10 shadow-sm bg-gradient-to-br from-white to-gray-50">
        <div className="grid md:grid-cols-2 gap-8">
           <div>
             <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Key Strengths
             </h3>
             <p className="text-[15px] text-gray-800 leading-relaxed">{evaluation.strengths || "No specific strengths identified."}</p>
           </div>
           <div>
             <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#e36c39] rounded-full"></div>
                Areas for Growth
             </h3>
             <p className="text-[15px] text-gray-800 leading-relaxed">{evaluation.weaknesses || "No specific areas for growth identified."}</p>
           </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Overall Synthesis</h3>
           <p className="text-sm text-gray-600 leading-relaxed">{evaluation.overallSummary}</p>
        </div>
      </section>

      {/* Dimension Grids */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {dimensions.map((key) => (
          <ScoreCard key={key} title={key} value={evaluation[key]} />
        ))}
      </section>

      {/* Footer Navigation */}
      <div className="flex justify-center mt-12 pb-20 border-t border-gray-200 pt-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-8 py-3.5 font-semibold text-gray-700 hover:bg-gray-50 hover:text-black transition-colors shadow-sm"
        >
          Return to Dashboard Homepage
        </Link>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  // Wrap in Suspense to safely trigger useSearchParams without failing Server Side hydration bounds
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading Report...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
