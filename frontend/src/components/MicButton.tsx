"use client";

interface MicButtonProps {
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function MicButton({ isListening, onClick, disabled }: MicButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-8 py-4 font-bold text-white shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50 ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-[#e36c39] hover:bg-[#d65f2e]'}`}
    >
      {isListening ? "Stop Recording" : "Tap to Answer"}
    </button>
  );
}
