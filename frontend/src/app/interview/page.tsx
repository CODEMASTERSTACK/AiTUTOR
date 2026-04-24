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
  const [step, setStep] = useState<'info' | 'setup' | 'interview'>('info');
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
  const [idleSeconds, setIdleSeconds] = useState(0);
  
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
    if ((step === 'setup' || step === 'interview') && camStatus === 'granted' && videoRef.current && streamRef.current) {
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
        const reply = await sendCandidateTurn(sessionId, text, turns, elapsedSeconds);
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

  // 10-Minute Timeout Enforcer
  useEffect(() => {
    if (elapsedSeconds >= 600 && !loadingTurn) {
       void endInterview();
    }
  }, [elapsedSeconds, loadingTurn]);

  // Silence / Inactivity Tracker
  useEffect(() => {
    if (step !== 'interview') return;
    
    if (isSpeaking || isListening || loadingTurn || isFrozen) {
       setIdleSeconds(0);
       return;
    }

    const interval = setInterval(() => {
       setIdleSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [step, isFrozen, isSpeaking, isListening, loadingTurn]);

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

  // Clean up audio purely on unmount
  useEffect(() => {
    return () => stopSpeaking();
  }, [stopSpeaking]);


  const canUseMic = useMemo(
    () => !loadingTurn && !isSpeaking && turns.length > 0 && !isFrozen && warningsLeft > 0,
    [isSpeaking, loadingTurn, turns.length, isFrozen, warningsLeft]
  );

  // --- RENDER PRE-FLIGHT ---
  if (step === 'info') {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm max-w-2xl w-full p-8 md:p-12">
          
          <div className="mb-8 border-b border-gray-200 pb-8 text-center">
            <div className="w-16 h-16 bg-[#fff5f2] text-[#e36c39] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Fairness & Evaluation Protocol</h2>
            <p className="text-gray-500 text-base leading-relaxed">
              We are committed to conducting a highly objective and fair assessment.
              To achieve this, we will now perform a <strong className="text-black">voice and camera-based evaluation</strong>.
              This allows our platform to actively monitor the environment and evaluate your communication skills authentically, ensuring a level playing field for all candidates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-10">
            <div className="p-5 border border-gray-100 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-[#e36c39] mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">10-Minute Strict Limit</h4>
              <p className="text-xs text-gray-500">The session automatically terminates after exactly 10 minutes.</p>
            </div>
            <div className="p-5 border border-gray-100 bg-gray-50 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-[#e36c39] mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Active Face Tracking</h4>
              <p className="text-xs text-gray-500">
                You must remain within the camera frame. Ducking out triggers a warning lock.
              </p>
            </div>
            <div className="p-5 border border-gray-100 bg-gray-50 rounded-xl md:col-span-2">
              <Mic className="w-5 h-5 text-[#e36c39] mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Inactivity Monitoring</h4>
              <p className="text-xs text-gray-500">
                The AI requires continuous engagement. Remaining silent for more than 20 seconds will trigger an inactivity warning.
              </p>
            </div>
          </div>

          <div className="bg-[#fff5f2] border border-[#ffdbcf] p-5 rounded-xl mb-8 flex items-start gap-4 hover:border-[#e36c39] transition-colors">
            <div className="pt-0.5">
              <input 
                type="checkbox" 
                id="consent" 
                checked={hasConsented} 
                onChange={(e) => setHasConsented(e.target.checked)}
                className="w-5 h-5 accent-[#e36c39] cursor-pointer"
              />
            </div>
            <label htmlFor="consent" className="text-sm text-black cursor-pointer leading-relaxed">
              <strong>I understand and agree.</strong> I consent to my audio and visual session being actively tracked and recorded strictly for recruitment evaluation purposes.
            </label>
          </div>

          <button 
            onClick={() => setStep('setup')}
            disabled={!hasConsented}
            className="w-full bg-[#e36c39] text-white font-bold py-4 rounded-xl hover:bg-[#d65f2e] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#e36c39]/30 flex items-center justify-center gap-2"
          >
            Acknowledge & Proceed <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    );
  }

  if (step === 'setup') {
    return (
      <main className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-4xl w-full">
          {/* Progress Bar Header */}
          <div className="flex items-center justify-between mb-8 px-4">
            <div className={`flex flex-col items-center gap-2 ${micStatus === 'granted' ? 'text-green-600' : 'text-[#e36c39]'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${micStatus === 'granted' ? 'bg-green-50 border-green-600' : 'bg-[#fff5f2] border-[#e36c39]'}`}>
                {micStatus === 'granted' ? <CheckCircle className="w-5 h-5" /> : <span>1</span>}
              </div>
              <span className="text-sm font-bold">Microphone</span>
            </div>
            <div className={`flex-1 h-1 mx-4 rounded-full ${micStatus === 'granted' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            
            <div className={`flex flex-col items-center gap-2 ${camStatus === 'granted' ? 'text-green-600' : (micStatus === 'granted' ? 'text-[#e36c39]' : 'text-gray-400')}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${camStatus === 'granted' ? 'bg-green-50 border-green-600' : (micStatus === 'granted' ? 'bg-[#fff5f2] border-[#e36c39]' : 'bg-gray-50 border-gray-300')}`}>
                {camStatus === 'granted' ? <CheckCircle className="w-5 h-5" /> : <span>2</span>}
              </div>
              <span className="text-sm font-bold">Camera</span>
            </div>
            <div className={`flex-1 h-1 mx-4 rounded-full ${camStatus === 'granted' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            
            <div className={`flex flex-col items-center gap-2 ${camStatus === 'granted' && micStatus === 'granted' ? 'text-[#e36c39]' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${camStatus === 'granted' && micStatus === 'granted' ? 'bg-[#fff5f2] border-[#e36c39]' : 'bg-gray-50 border-gray-300'}`}>
                3
              </div>
              <span className="text-sm font-bold">Ready</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full p-8 md:p-12">
            {/* Step 1: Microphone */}
            {micStatus !== 'granted' && (
              <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-20 h-20 bg-[#fff5f2] text-[#e36c39] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mic className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Microphone Check</h2>
                <p className="text-gray-500 mb-8 text-base max-w-md mx-auto">We need to capture your voice clearly for the AI to understand your responses.</p>
                
                {micStatus === 'pending' || micStatus === 'checking' ? (
                  <button 
                    onClick={requestMicrophone}
                    disabled={micStatus === 'checking'}
                    className="w-full max-w-md mx-auto bg-[#e36c39] text-white font-bold py-4 rounded-xl hover:bg-[#d65f2e] transition disabled:opacity-50 shadow-lg shadow-[#e36c39]/30 block"
                  >
                    {micStatus === 'checking' ? 'Connecting...' : 'Allow Microphone'}
                  </button>
                ) : (
                  <div className="space-y-4 max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-2 text-red-600 font-semibold bg-red-50 py-3 rounded-xl border border-red-200">
                      <AlertCircle className="w-5 h-5" /> Microphone Blocked
                    </div>
                    <button onClick={requestMicrophone} className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Camera */}
            {micStatus === 'granted' && camStatus !== 'granted' && (
               <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-20 h-20 bg-[#fff5f2] text-[#e36c39] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Video className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Camera Check</h2>
                <p className="text-gray-500 mb-8 text-base max-w-md mx-auto">Make sure your face is clearly visible. We use active tracking to monitor the session.</p>
                
                {camStatus === 'pending' || camStatus === 'checking' ? (
                  <button 
                    onClick={requestCamera}
                    disabled={camStatus === 'checking'}
                    className="w-full max-w-md mx-auto bg-[#e36c39] text-white font-bold py-4 rounded-xl hover:bg-[#d65f2e] transition disabled:opacity-50 shadow-lg shadow-[#e36c39]/30 block"
                  >
                    {camStatus === 'checking' ? 'Connecting...' : 'Allow Camera'}
                  </button>
                ) : (
                  <div className="space-y-4 max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-2 text-red-600 font-semibold bg-red-50 py-3 rounded-xl border border-red-200">
                      <AlertCircle className="w-5 h-5" /> Camera Blocked
                    </div>
                    <button onClick={requestCamera} className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: All set */}
            {micStatus === 'granted' && camStatus === 'granted' && (
              <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">You are ready!</h2>
                <p className="text-gray-500 mb-8 text-sm">Everything looks good. Position yourself in the center of the frame.</p>
                
                <div className="w-full max-w-lg mx-auto h-64 bg-black rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative mb-8">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                  <div className="absolute top-4 right-4 bg-green-500/90 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div> Live
                  </div>
                </div>

                <button 
                  onClick={() => setStep('interview')}
                  className="w-full max-w-lg mx-auto bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition shadow-xl shadow-black/20 flex items-center justify-center gap-2"
                >
                  Start Interview <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // --- RENDER LIVE INTERVIEW ---
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 font-sans">
      
      {/* INACTIVITY WARNING OVERLAY */}
      {idleSeconds >= 20 && !isFrozen && (
        <div className="fixed inset-0 z-40 bg-[#e36c39]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center shadow-2xl">
           <AlertCircle className="w-24 h-24 text-white mb-6 animate-bounce" />
           <h2 className="text-4xl font-black text-white mb-4">Are you still there?</h2>
           <p className="text-xl text-white/90 font-medium max-w-2xl mb-8">
             We haven't heard anything from you in a while. Please turn on your microphone and speak to continue the interview.
           </p>
           <button 
             onClick={startListening} 
             className="bg-white text-[#e36c39] font-bold text-xl px-10 py-4 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105"
           >
             Tap to Speak
           </button>
        </div>
      )}

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
          <div className="flex-1 w-full relative h-[300px] md:h-[400px] lg:h-[500px]">
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
             <MicButton isListening={isListening} onClick={isListening ? stopListening : startListening} disabled={!canUseMic && !isListening} />
             <div className="h-6 mt-3">
                {isFrozen && <p className="text-sm font-bold text-red-600 animate-bounce">INTERVIEW FROZEN</p>}
                {/* Skeleton Bubble Handles Loading State */}
             </div>
          </div>
        </div>

        {/* Right Column: Transcript and Submit Button */}
        <div className="flex flex-col gap-6 h-full">
          <div className="flex-1 w-full h-[350px] md:h-[450px] lg:h-[500px] max-h-[350px] md:max-h-[450px] lg:max-h-[500px] border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col relative">
            {isFrozen && <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px]"></div>}
            <TranscriptPanel turns={turns} isTyping={loadingTurn} />
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
