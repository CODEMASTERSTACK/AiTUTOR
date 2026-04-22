"use client";

import { useCallback, useState, useRef } from "react";

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Real-time Audio Amplitude Trackers
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

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

  // Extremely fast, non-state-triggering poll function for useFrame loops
  const getAudioVolume = useCallback((): number => {
    if (!analyserRef.current || !dataArrayRef.current || !isSpeaking) return 0;
    
    // We get real-time frequency data block
    analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
    
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
        sum += dataArrayRef.current[i];
    }
    
    return sum / dataArrayRef.current.length; // Returns an average amplitude 0-255
  }, [isSpeaking]);

  const speak = useCallback(async (text: string, audioBase64?: string) => {
    if (audioBase64) {
      setIsSpeaking(true);
      let playedElevenLabsAudio = false;
      await new Promise<void>((resolve) => {
        const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
        audio.crossOrigin = "anonymous";
        activeAudioRef.current = audio;
        
        // Initialize Analyser specifically for avatar lip sync
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
             audioContextRef.current = new AudioContextClass();
             analyserRef.current = audioContextRef.current.createAnalyser();
             analyserRef.current.fftSize = 64; // Small size for fast jaw reading
             dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
          }
        }
        
        const audioCtx = audioContextRef.current;
        let source: MediaElementAudioSourceNode | null = null;

        if (audioCtx) {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            // Bind audio element to our analyzer
            try {
              source = audioCtx.createMediaElementSource(audio);
              source.connect(analyserRef.current!);
              analyserRef.current!.connect(audioCtx.destination);
            } catch (err) {
              console.warn("Could not bind AudioContext. Visemes will flatline.", err);
            }
        }
        
        const cleanup = () => {
          setIsSpeaking(false);
          playedElevenLabsAudio = true;
          activeAudioRef.current = null;
          if (source && audioCtx) {
             source.disconnect();
          }
          resolve();
        };

        audio.onended = cleanup;
        audio.onerror = cleanup;

        audio
          .play()
          .then(() => undefined)
          .catch(() => {
            cleanup();
          });
      });
      if (playedElevenLabsAudio) return;
    }

    speakWithBrowser(text);
  }, [speakWithBrowser]);

  const stopSpeaking = useCallback(() => {
    if (activeAudioRef.current) {
       activeAudioRef.current.pause();
       activeAudioRef.current.currentTime = 0;
       activeAudioRef.current = null;
    }
    if ("speechSynthesis" in window) {
       window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    speak,
    getAudioVolume,
    stopSpeaking
  };
}
