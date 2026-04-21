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
      className="rounded-full px-5 py-3 font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 bg-blue-600 hover:bg-blue-700"
    >
      {isListening ? "Listening..." : "Tap to Answer"}
    </button>
  );
}
