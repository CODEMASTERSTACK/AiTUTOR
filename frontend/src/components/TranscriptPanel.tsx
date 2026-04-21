import { InterviewTurn } from "@/lib/types";

interface TranscriptPanelProps {
  turns: InterviewTurn[];
}

export function TranscriptPanel({ turns }: TranscriptPanelProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">Transcript</h2>
      <div className="max-h-80 space-y-2 overflow-auto text-sm">
        {turns.map((turn, idx) => (
          <p key={`${turn.timestamp}-transcript-${idx}`} className="text-slate-700">
            <span className="font-semibold">
              {turn.role === "interviewer" ? "Interviewer" : "Candidate"}:
            </span>{" "}
            {turn.text}
          </p>
        ))}
      </div>
    </div>
  );
}
