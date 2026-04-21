"use client";

import { useCallback, useState } from "react";

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakWithBrowser = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      return;
    }
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(async (text: string, audioBase64?: string) => {
    if (audioBase64) {
      setIsSpeaking(true);
      let playedElevenLabsAudio = false;
      await new Promise<void>((resolve) => {
        const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
        audio.onended = () => {
          setIsSpeaking(false);
          playedElevenLabsAudio = true;
          resolve();
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          resolve();
        };
        audio
          .play()
          .then(() => undefined)
          .catch(() => {
            setIsSpeaking(false);
            resolve();
          });
      });
      if (playedElevenLabsAudio) return;
    }

    speakWithBrowser(text);
  }, [speakWithBrowser]);

  return {
    isSpeaking,
    speak,
  };
}
