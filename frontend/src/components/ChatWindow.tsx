import { InterviewTurn } from "@/lib/types";

interface ChatWindowProps {
  turns: InterviewTurn[];
}

export function ChatWindow({ turns }: ChatWindowProps) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {turns.map((turn, idx) => (
        <div
          key={`${turn.timestamp}-${idx}`}
          className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
            turn.role === "interviewer"
              ? "bg-slate-100 text-slate-800"
              : "ml-auto bg-blue-600 text-white"
          }`}
        >
          <p className="mb-1 text-xs opacity-75">
            {turn.role === "interviewer" ? "Interviewer" : "You"}
          </p>
          <p>{turn.text}</p>
        </div>
      ))}
    </div>
  );
}
