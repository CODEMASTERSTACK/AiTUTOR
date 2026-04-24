"use client";

import React, { useEffect, useRef } from 'react';

export function AvatarInterviewer({ 
  isSpeaking, 
  getAudioVolume 
}: { 
  isSpeaking: boolean;
  getAudioVolume: () => number;
}) {
  const coreRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrame: number;
    let currentScale = 1;
    let currentOpacity = 0.1;
    
    const updateAnimation = () => {
      let targetScale = 1;
      let targetOpacity = 0.1;

      if (isSpeaking && coreRef.current && glowRef.current) {
        const volume = getAudioVolume();
        
        // If volume is flat (e.g., using Browser TTS fallback), simulate dynamic talking volume
        let effectiveVolume = volume;
        if (volume < 5) {
           const time = Date.now() / 150;
           // Creates an erratic speaking-like pulse using overlapping sine waves
           const pulse = (Math.sin(time) + Math.sin(time * 2.2) + Math.sin(time * 3.7)) / 3;
           if (pulse > 0) {
               effectiveVolume = pulse * 100; // Fake amplitude
           }
        }

        // Target calculations
        targetScale = 1 + Math.min(effectiveVolume / 100, 0.4);
        targetOpacity = Math.min(effectiveVolume / 80, 0.7);
      }

      // Smooth LERP (Linear Interpolation) for buttery smooth animation
      currentScale += (targetScale - currentScale) * 0.15;
      currentOpacity += (targetOpacity - currentOpacity) * 0.15;

      if (coreRef.current && glowRef.current) {
        coreRef.current.style.transform = `scale(${currentScale})`;
        glowRef.current.style.transform = `scale(${currentScale * 1.3})`;
        glowRef.current.style.opacity = `${currentOpacity}`;
      }

      animationFrame = requestAnimationFrame(updateAnimation);
    };
    updateAnimation();
    
    return () => cancelAnimationFrame(animationFrame);
  }, [isSpeaking, getAudioVolume]);

  return (
    <div className="w-full h-[300px] md:h-[450px] bg-[#0a0a0a] border border-gray-800 shadow-inner rounded-2xl overflow-hidden relative flex items-center justify-center group">
      
      {/* Decorative AI background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* AI Core Animation */}
      <div className="relative flex items-center justify-center">
        {/* Outer glowing rings (Idle breathing and spinning) */}
        <div className={`absolute w-48 h-48 transition-all duration-1000 ${isSpeaking ? 'scale-110 opacity-80' : 'scale-100 opacity-40'}`}>
           <div className="w-full h-full rounded-full border-2 border-dashed border-[#e36c39]/40 blur-[1px] animate-spin" style={{ animationDuration: '8s' }}></div>
        </div>
        <div className={`absolute w-64 h-64 transition-all duration-1000 ${isSpeaking ? 'scale-110 opacity-50' : 'scale-100 opacity-20'}`}>
           <div className="w-full h-full rounded-full border border-dashed border-[#e36c39]/30 blur-[2px] animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}></div>
        </div>
        
        {/* Dynamic Glow (Responds to volume) */}
        <div 
          ref={glowRef}
          className="absolute w-32 h-32 rounded-full bg-[#e36c39] blur-2xl"
          style={{ opacity: 0.1 }}
        ></div>
        
        {/* Inner Solid Core (Responds to volume) */}
        <div 
          ref={coreRef}
          className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#e36c39] to-[#ffb89e] shadow-[0_0_40px_rgba(227,108,57,0.6)] flex items-center justify-center"
        >
          {/* Inner details */}
          <div className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center">
            <div className={`w-4 h-4 rounded-full bg-white transition-all duration-500 ${isSpeaking ? 'scale-150 shadow-[0_0_15px_white]' : 'scale-100'}`}></div>
          </div>
        </div>
      </div>

      {/* Status Label */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-white/90 border border-white/10 flex items-center gap-2 z-10">
        <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-[#e36c39] animate-pulse shadow-[0_0_8px_#e36c39]' : 'bg-gray-500'}`}></span>
        {isSpeaking ? 'KRISH SPEAKING' : 'IDLE'}
      </div>
    </div>
  );
}
