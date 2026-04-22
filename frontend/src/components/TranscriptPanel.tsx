import { InterviewTurn } from "@/lib/types";

interface TranscriptPanelProps {
  turns: InterviewTurn[];
}

export function TranscriptPanel({ turns }: TranscriptPanelProps) {
  return (
    <div className="flex flex-col h-full w-full bg-white p-4">
      <h2 className="mb-4 text-sm font-bold tracking-widest text-gray-400 uppercase shrink-0">Live Transcript</h2>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
        {turns.map((turn, idx) => {
          const isCandidate = turn.role === "candidate";
          return (
            <div key={`${turn.timestamp}-log-${idx}`} className={`flex w-full ${isCandidate ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3 text-[15px] shadow-sm leading-relaxed ${
                  isCandidate 
                    ? 'bg-[#e36c39] text-white rounded-br-sm' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200'
                }`}
              >
                <div className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isCandidate ? 'text-white/70' : 'text-gray-500'}`}>
                  {isCandidate ? 'Candidate' : 'Interviewer'}
                </div>
                {turn.text}
              </div>
            </div>
          );
        })}
        {turns.length === 0 && (
          <p className="text-sm text-gray-400 italic text-center mt-10">Transcript will appear here once the session begins.</p>
        )}
      </div>
    </div>
  );
}
