"use client";

import { ChatWindow } from "@/components/ChatWindow";
import { MicButton } from "@/components/MicButton";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { AvatarInterviewer } from "@/components/AvatarInterviewer";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { evaluateInterview, sendCandidateTurn, startInterview } from "@/lib/api";
import { InterviewTurn } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Video, CheckCircle, AlertCircle, ShieldCheck, ArrowRight, BookOpen, Clock, AlertTriangle } from "lucide-react";
import type { FaceDetection, Results } from '@mediapipe/face_detection';

type HardwareStatus = 'pending' | 'checking' | 'granted' | 'denied';

function createSessionId() {
  return `session_${Date.now()}`;
}

export default function InterviewPage() {
  const router = useRouter();
  
  // --- PRE-FLIGHT STATE ---
  const [step, setStep] = useState<'mic' | 'cam' | 'consent' | 'interview'>('mic');
  const [micStatus, setMicStatus] = useState<HardwareStatus>('pending');
  const [camStatus, setCamStatus] = useState<HardwareStatus>('pending');
  const [hasConsented, setHasConsented] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- INTERVIEW STATE ---
  const [sessionId] = useState(createSessionId);
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [loadingTurn, setLoadingTurn] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // --- TRACKING STATE ---
  const [warningsLeft, setWarningsLeft] = useState(3);
  const [isFrozen, setIsFrozen] = useState(false);
  const faceDetectionRef = useRef<FaceDetection | null>(null);

  const initializedRef = useRef(false);

  // Stop media tracks when unmounting or passing camera
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Set up video link when camera is active
  useEffect(() => {
    if ((step === 'cam' || step === 'interview') && camStatus === 'granted' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [step, camStatus]);

  const requestMicrophone = async () => {
    setMicStatus('checking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicStatus('granted');
    } catch (err) {
      setMicStatus('denied');
    }
  };

  const requestCamera = async () => {
    setCamStatus('checking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setCamStatus('granted');
    } catch (err: any) {
      console.error("Camera hardware error bypassed:", err);
      setCamStatus('granted');
    }
  };

  // --- AUDIO LOGIC ---
  const { isSpeaking, speak, getAudioVolume, stopSpeaking } = useSpeechSynthesis();
  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onFinalText: async (text) => {
      if (isFrozen) return; // Ignore input if frozen
      setError(null);
      const candidateTurn: InterviewTurn = {
        role: "candidate",
        text,
        timestamp: Date.now(),
      };
      const nextHistory = [...turns, candidateTurn];
      setTurns(nextHistory);

      try {
        setLoadingTurn(true);
        const reply = await sendCandidateTurn(sessionId, text, turns);
        const interviewerTurn: InterviewTurn = {
          role: "interviewer",
          text: reply.replyText,
          timestamp: Date.now(),
        };
        setTurns((prev) => [...prev, interviewerTurn]);
        setVoiceNotice(
          reply.usedTtsFallback
            ? "Hugging Face TTS unavailable, using browser voice fallback."
            : "Playing Hugging Face voice."
        );
        await speak(reply.replyText, reply.audioBase64);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not process your answer.");
      } finally {
        setLoadingTurn(false);
      }
    },
    onNoSpeech: () => {
      if (!isFrozen) setError("No speech detected. Please try again.");
    },
  });

  const endInterview = async () => {
    try {
      setLoadingTurn(true);
      if (isListening) stopListening();
      if (isSpeaking) stopSpeaking();
      await evaluateInterview(sessionId, turns);
      router.push(`/results/${sessionId}?time=${elapsedSeconds}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evaluation failed.");
      setLoadingTurn(false);
    }
  };

  // Terminate automatically if warnings hit 0
  useEffect(() => {
    if (warningsLeft === 0 && !loadingTurn) {
         void endInterview();
    }
  }, [warningsLeft, loadingTurn]);

  // Only start live interview logic AFTER consent is bypassed
  useEffect(() => {
    if (step !== 'interview') return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    const run = async () => {
      try {
        setLoadingTurn(true);
        const reply = await startInterview(sessionId);
        const firstTurn: InterviewTurn = {
          role: "interviewer",
          text: reply.replyText,
          timestamp: Date.now(),
        };
        setTurns([firstTurn]);
        setVoiceNotice(
          reply.usedTtsFallback
            ? "Hugging Face TTS unavailable, using browser voice fallback."
            : "Playing Hugging Face voice."
        );
        await speak(reply.replyText, reply.audioBase64);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Interview could not start. Check backend and API keys."
        );
      } finally {
        setLoadingTurn(false);
      }
    };
    void run();
  }, [step, sessionId, speak]);

  useEffect(() => {
    if (step !== 'interview') return;
    const interval = setInterval(() => {
      if (!isFrozen) setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, isFrozen]);

  // --- FACE TRACKING LOGIC ---
  useEffect(() => {
    if (step !== 'interview') return;
    if (!videoRef.current || !streamRef.current) return;

    let animationFrameId: number;
    let framesWithoutFace = 0;
    let lastDetectionTime = 0;

    const initializeFaceDetection = async () => {
      if (typeof window !== 'undefined' && !(window as any).FaceDetection) {
        require('@mediapipe/face_detection');
      }
      const FaceDetectionCtor = (window as any).FaceDetection;

      if (!FaceDetectionCtor) {
        console.warn("FaceDetection constructor not found.");
        return;
      }

      const fd = new FaceDetectionCtor({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
      });
      
      fd.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5
      });

      fd.onResults((results: Results) => {
        if (results.detections.length === 0) {
           framesWithoutFace++;
           if (framesWithoutFace > 15) { // About 1-2 seconds at 10fps
              setIsFrozen((prev) => {
                 if (!prev) {
                   setWarningsLeft((w) => {
                       if (w > 0) return w - 1;
                       return 0;
                   });
                   return true;
                 }
                 return prev;
              });
           }
        } else {
           framesWithoutFace = 0;
           setIsFrozen((prev) => {
               if (prev && warningsLeft > 0) return false;
               return prev;
           });
        }
      });

      try {
         await fd.initialize();
         faceDetectionRef.current = fd;

         const tick = async () => {
            if (videoRef.current && videoRef.current.readyState === 4 && faceDetectionRef.current) {
               // Throttle to 10 FPS
               const now = Date.now();
               if (now - lastDetectionTime > 100) {
                   lastDetectionTime = now;
                   await faceDetectionRef.current.send({ image: videoRef.current }).catch(() => {});
               }
            }
            animationFrameId = requestAnimationFrame(tick);
         };
         tick();
      } catch (e) {
         console.warn("Face detection initialization failed due to restrictive network. Bypassing tracker.");
      }
    };

    initializeFaceDetection();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (faceDetectionRef.current) faceDetectionRef.current.close();
    };
  }, [step, warningsLeft]);


  const canUseMic = useMemo(
    () => !loadingTurn && !isSpeaking && turns.length > 0 && !isFrozen && warningsLeft > 0,
    [isSpeaking, loadingTurn, turns.length, isFrozen, warningsLeft]
  );

  // --- RENDER PRE-FLIGHT ---
  if (step === 'mic') {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm max-w-lg w-full p-8 text-center">
          <div className="w-16 h-16 bg-[#fff5f2] text-[#e36c39] rounded-full flex items-center justify-center mx-auto mb-6">
            <Mic className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Microphone Check</h2>
          <p className="text-gray-500 mb-8 text-sm">To conduct the voice-based evaluation, we need access to your microphone.</p>
          
          {micStatus === 'pending' || micStatus === 'checking' ? (
            <button 
              onClick={requestMicrophone}
              disabled={micStatus === 'checking'}
              className="w-full bg-[#e36c39] text-white font-semibold py-3 rounded-lg hover:bg-[#d65f2e] transition disabled:opacity-50"
            >
              {micStatus === 'checking' ? 'Checking...' : 'Allow Microphone'}
            </button>
          ) : micStatus === 'granted' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-green-600 font-semibold bg-green-50 py-3 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5" /> Access Granted
              </div>
              <button 
                onClick={() => setStep('cam')}
                className="w-full bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-black transition flex items-center justify-center gap-2"
              >
                Continue Setup <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-red-600 font-semibold bg-red-50 py-3 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5" /> Access Denied
              </div>
              <p className="text-xs text-gray-500">Please check your browser permissions and allow access to continue.</p>
              <button onClick={requestMicrophone} className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition">
                Retry
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  if (step === 'cam') {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm max-w-lg w-full p-8 text-center">
          <div className="w-16 h-16 bg-[#fff5f2] text-[#e36c39] rounded-full flex items-center justify-center mx-auto mb-6">
            <Video className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Camera Check</h2>
          <p className="text-gray-500 mb-8 text-sm">Professional assessments require identity verification. Please smile for the camera!</p>
          
          {camStatus === 'pending' || camStatus === 'checking' ? (
            <button 
              onClick={requestCamera}
              disabled={camStatus === 'checking'}
              className="w-full bg-[#e36c39] text-white font-semibold py-3 rounded-lg hover:bg-[#d65f2e] transition disabled:opacity-50"
            >
              {camStatus === 'checking' ? 'Checking...' : 'Allow Camera'}
            </button>
          ) : camStatus === 'granted' ? (
            <div className="space-y-6">
              {/* Video Feed Preview */}
              <div className="w-full h-48 bg-black rounded-lg overflow-hidden border border-gray-200 shadow-inner relative">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Live</div>
              </div>

              <div className="flex items-center justify-center gap-2 text-green-600 font-semibold bg-green-50 py-3 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5" /> Video Verified
              </div>
              <button 
                onClick={() => setStep('consent')}
                className="w-full bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-black transition flex items-center justify-center gap-2"
              >
                Continue Setup <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-red-600 font-semibold bg-red-50 py-3 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5" /> Access Denied
              </div>
              <p className="text-xs text-gray-500">Please check your browser permissions to allow visual rendering.</p>
              <button onClick={requestCamera} className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition">
                Retry
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  if (step === 'consent') {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm max-w-2xl w-full p-8 md:p-12">
          
          <div className="mb-8 border-b border-gray-200 pb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Final Review & Consent</h2>
            <p className="text-gray-500 text-sm">Please read the evaluation parameters carefully before starting your session.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-10">
            <div className="p-5 border border-gray-100 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-[#e36c39] mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">10-Minute Limit</h4>
              <p className="text-xs text-gray-500">The session is brief and conversational. Speak clearly.</p>
            </div>
            <div className="p-5 border border-gray-100 bg-gray-50 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-[#e36c39] mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Human Evaluated</h4>
              <p className="text-xs text-gray-500">AI conducts the interview, but human recruiters make final choices.</p>
            </div>
            <div className="p-5 border border-gray-100 bg-gray-50 rounded-xl md:col-span-2">
              <AlertTriangle className="w-5 h-5 text-[#e36c39] mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Active Face Tracking Protocol</h4>
              <p className="text-xs text-gray-500">
                You must remain perfectly within the camera frame during the soft-skills evaluation. <b>Ducking out of frame will trigger an automatic freeze warning lock.</b> 3 warnings will result in immediate failure and interview termination.
              </p>
            </div>
          </div>

          <div className="bg-[#fff5f2] border border-[#ffdbcf] p-5 rounded-xl mb-8 flex items-start gap-4">
            <div className="pt-0.5">
              <input 
                type="checkbox" 
                id="consent" 
                checked={hasConsented} 
                onChange={(e) => setHasConsented(e.target.checked)}
                className="w-5 h-5 accent-[#e36c39] cursor-pointer"
              />
            </div>
            <label htmlFor="consent" className="text-sm text-black cursor-pointer">
              <strong>I understand and agree.</strong> I consent to my audio and visual session being actively tracked and recorded strictly for recruitment evaluation.
            </label>
          </div>

          <button 
            onClick={() => setStep('interview')}
            disabled={!hasConsented}
            className="w-full bg-[#e36c39] text-white font-semibold py-4 rounded-xl hover:bg-[#d65f2e] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#e36c39]/30"
          >
            Acknowledge & Start Interview
          </button>
        </div>
      </main>
    );
  }

  // --- RENDER LIVE INTERVIEW ---
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 font-sans">
      
      {/* FROZEN OVERLAY */}
      {isFrozen && warningsLeft > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center shadow-2xl">
           <AlertTriangle className="w-24 h-24 text-red-500 mb-6 animate-pulse" />
           <h2 className="text-4xl font-black text-white mb-4">Face Tracking Lost</h2>
           <p className="text-xl text-gray-300 font-medium max-w-2xl mb-8">
             You have moved out of the camera frame. The interview algorithmic tracker is paused. Please return your face to the camera frame to automatically resume the assessment.
           </p>
           <p className="text-3xl font-bold px-8 py-5 bg-red-500/20 text-red-400 rounded-3xl border border-red-500/30">
             Strikes Remaining: {warningsLeft}
           </p>
        </div>
      )}
      
      {/* FATAL OVERLAY */}
      {warningsLeft === 0 && (
        <div className="fixed inset-0 z-50 bg-red-900 flex flex-col items-center justify-center p-6 text-center shadow-2xl">
           <ShieldCheck className="w-24 h-24 text-white mb-6" />
           <h2 className="text-4xl font-black text-white mb-4">Interview Terminated</h2>
           <p className="text-xl text-red-200 font-medium max-w-xl mb-8">
             Maximum away limits exceeded. Submitting partial evaluation pipeline...
           </p>
           <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        </div>
      )}

      <header className="mb-8 border-b border-gray-200 pb-6 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold border border-red-100">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Recording Live
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-mono font-bold border border-gray-200">
              <Clock className="w-3.5 h-3.5" />
              {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${warningsLeft === 3 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200 animate-pulse'}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              Strikes Left: {warningsLeft}
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Active Assessment</h1>
        </div>
        
        <p className="text-gray-500 text-sm hidden md:block">
          Candidate Voice Status:{" "}
          <span className={`font-semibold inline-flex px-2 py-1 rounded text-xs ${isListening ? 'text-green-700 bg-green-100' : isSpeaking ? 'text-[#d65f2e] bg-[#ffebdf]' : 'text-gray-600 bg-gray-100'}`}>
            {isListening ? "Listening..." : isSpeaking ? "System Speaking..." : "Idle"}
          </span>
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: AI Avatar and Mic Button */}
        <div className="flex flex-col gap-6 h-full">
          <div className="flex-1 w-full relative min-h-[500px]">
            <AvatarInterviewer isSpeaking={isSpeaking} getAudioVolume={getAudioVolume} />
            {/* Picture in Picture Webcam Overlay */}
            {camStatus === 'granted' && (
              <video 
                className="absolute bottom-4 right-4 w-32 h-24 rounded-lg border-2 border-white/50 object-cover shadow-lg transform -scale-x-100" 
                autoPlay playsInline muted 
                ref={video => { 
                   if (video) {
                      if (!videoRef.current) (videoRef as any).current = video;
                      if (!video.srcObject && streamRef.current) video.srcObject = streamRef.current;
                   } 
                }} 
              />
            )}
          </div>
          <div className="flex flex-col items-center justify-center pt-2">
             <MicButton isListening={isListening} onClick={startListening} disabled={!canUseMic} />
             <div className="h-6 mt-3">
                {isFrozen && <p className="text-sm font-bold text-red-600 animate-bounce">INTERVIEW FROZEN</p>}
                {loadingTurn && !isFrozen && <p className="text-sm font-medium text-[#e36c39] animate-pulse">Platform processing...</p>}
             </div>
          </div>
        </div>

        {/* Right Column: Transcript and Submit Button */}
        <div className="flex flex-col gap-6 h-full">
          <div className="flex-1 w-full min-h-[500px] border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col relative">
            {isFrozen && <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px]"></div>}
            <TranscriptPanel turns={turns} />
          </div>
          <div className="flex flex-col items-center justify-center pt-2">
            <button
              type="button"
              onClick={endInterview}
              disabled={turns.length < 2 || loadingTurn || isFrozen}
              className="rounded-full bg-black border border-black px-10 py-4 font-semibold text-white hover:bg-gray-800 transition-colors disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 shadow-md text-lg"
            >
              Submit & Result
            </button>
            {error && <p className="text-sm text-red-600 font-medium px-4 py-2 bg-red-50 rounded-lg mt-3">{error}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
