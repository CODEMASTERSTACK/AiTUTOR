import { DimensionScore } from "@/lib/types";

interface ScoreCardProps {
  title: string;
  value: DimensionScore;
}

export function ScoreCard({ title, value }: ScoreCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">Score: {value.score}/5</p>
      <p className="mt-3 text-sm text-slate-700">{value.reasoning}</p>
      <blockquote className="mt-3 border-l-4 border-blue-500 pl-3 text-sm italic text-slate-600">
        {value.evidenceQuote}
      </blockquote>
    </article>
  );
}
