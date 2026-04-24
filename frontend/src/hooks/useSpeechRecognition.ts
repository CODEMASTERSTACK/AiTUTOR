"use client";

import { useCallback, useRef, useState } from "react";

type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    SpeechRecognition?: new () => BrowserSpeechRecognition;
  }
}

interface UseSpeechRecognitionOptions {
  onFinalText: (text: string) => void;
  onNoSpeech: () => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const transcriptRef = useRef<string>("");

  const handleStop = useCallback((isForced: boolean) => {
    if (transcriptRef.current) {
      options.onFinalText(transcriptRef.current);
      transcriptRef.current = "";
    } else if (!isForced) {
      options.onNoSpeech();
    }
    setIsListening(false);
  }, [options]);

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      throw new Error("Speech recognition is not supported in this browser.");
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    transcriptRef.current = ""; // Reset on start

    recognition.onstart = () => setIsListening(true);
    
    recognition.onend = () => {
      // If it ends naturally without stop() being called (e.g. browser timeout)
      setIsListening((prev) => {
        if (prev) {
          setTimeout(() => handleStop(true), 0);
        }
        return false;
      });
    };
    
    recognition.onerror = () => {
      setIsListening(false);
      options.onNoSpeech();
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript + " ";
      }
      transcriptRef.current = currentTranscript.trim();
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [handleStop, options]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      handleStop(false);
    }
  }, [handleStop]);

  return {
    isListening,
    startListening,
    stopListening,
  };
}
