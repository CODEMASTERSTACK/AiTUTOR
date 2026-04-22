"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarProps {
  speakingVolume: number;
  isSpeaking: boolean;
}

// Replacing the external RPM GLB with a robust Procedural Native Component 
// due to network DNS resolution failures on models.readyplayer.me in the host OS.
function AvatarModel({ speakingVolume, isSpeaking }: AvatarProps) {
  const timeRef = useRef(0);
  
  // References applied to our primitive meshes to animate them mathematically 
  // without relying on pre-baked blendshapes.
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    // --- 1. Life Micro-Animations ---
    if (groupRef.current) {
      // Gentle sine wave breathing/floating logic
      groupRef.current.position.y = Math.sin(timeRef.current * 1.5) * 0.05 - 0.4;
      
      // Head bobbing when speaking
      const bobTarget = isSpeaking ? Math.sin(timeRef.current * 8) * 0.03 : Math.sin(timeRef.current * 0.5) * 0.01;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, bobTarget, 0.1);
      
      // Look slightly side to side when idle
      const lookTarget = isSpeaking ? 0 : Math.sin(timeRef.current * 0.3) * 0.1;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, lookTarget, 0.05);
    }

    // Occasional, randomized blinking (snaps scale Y to 0.1)
    const blinkTrigger = Math.sin(timeRef.current * 3.5) > 0.98;
    const eyeScaleY = blinkTrigger ? 0.05 : 1;
    
    if (leftEyeRef.current && rightEyeRef.current) {
       leftEyeRef.current.scale.setY(THREE.MathUtils.lerp(leftEyeRef.current.scale.y, eyeScaleY, 0.5));
       rightEyeRef.current.scale.setY(THREE.MathUtils.lerp(rightEyeRef.current.scale.y, eyeScaleY, 0.5));
    }

    // --- 2. Expressions & Lip Sync via Algorithm ---
    // The WebAudio Analyzer normally returns volumes between 0-255.
    const rawMouthOpen = Math.min(1.0, speakingVolume / 60.0);
    const smoothedMouthOpen = THREE.MathUtils.lerp(0, rawMouthOpen, 0.4);

    if (mouthRef.current) {
      // When talking, scale the mouth vertically to match volume
      const mouthY = isSpeaking && smoothedMouthOpen > 0 ? smoothedMouthOpen * 0.8 : 0.05;
      mouthRef.current.scale.setY(THREE.MathUtils.lerp(mouthRef.current.scale.y, Math.max(0.05, mouthY), 0.5));
      
      // Smile logic: mouth widens slightly and curves up (simulated by positioning)
      const targetSmileWidth = isSpeaking ? 1.2 : 0.8;
      mouthRef.current.scale.setX(THREE.MathUtils.lerp(mouthRef.current.scale.x, targetSmileWidth, 0.1));
    }
  });

  return (
    <group ref={groupRef}>
      {/* Torso / Suit */}
      <mesh position={[0, -1.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 0.9, 1.5, 32]} />
        <meshStandardMaterial color="#1f2937" roughness={0.8} /> {/* Dark professional suit */}
      </mesh>
      
      {/* Shoulders */}
      <mesh position={[0, -1.1, 0.1]} castShadow>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshStandardMaterial color="#1f2937" roughness={0.8} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, -0.7, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 0.6, 32]} />
        <meshStandardMaterial color="#fce2c4" roughness={0.4} /> {/* Light skin tone */}
      </mesh>

      {/* Shirt Collar */}
      <mesh position={[0, -0.9, 0.15]} rotation={[0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 0.2, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} /> 
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.7, 32, 32]} />
        {/* Scale the sphere slightly to make an oval face shape */}
        <meshStandardMaterial color="#fce2c4" roughness={0.4} />
      </mesh>

      {/* Hair (Simple clean cut) */}
      <mesh position={[0, 0.4, -0.1]} castShadow>
        <sphereGeometry args={[0.72, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#2d1b0e" roughness={0.9} /> {/* Dark brown hair */}
      </mesh>

      {/* Left Eye */}
      <mesh ref={leftEyeRef} position={[-0.25, 0.15, 0.64]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#111827" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Right Eye */}
      <mesh ref={rightEyeRef} position={[0.25, 0.15, 0.64]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#111827" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Mouth Sync Interface */}
      <mesh ref={mouthRef} position={[0, -0.3, 0.65]}>
        {/* A thin oval for the mouth */}
        <planeGeometry args={[0.25, 0.1]} />
        <meshStandardMaterial color="#3a1c1d" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Procedural avatar requires no external preload
function AnimatedAvatarWrapper({ 
  isSpeaking, 
  getAudioVolume 
}: { 
  isSpeaking: boolean, 
  getAudioVolume: () => number 
}) {
  const [volume, setVolume] = useState(0);

  // Poll the Web Audio API natively at 60fps
  useFrame(() => {
    if (isSpeaking) {
      setVolume(getAudioVolume());
    } else {
      setVolume(0);
    }
  });

  return <AvatarModel speakingVolume={volume} isSpeaking={isSpeaking} />;
}


// 3. The Main Exported Canvas Wrapper
export function AvatarInterviewer({ 
  isSpeaking, 
  getAudioVolume 
}: { 
  isSpeaking: boolean;
  getAudioVolume: () => number;
}) {
  return (
    <div className="w-full h-[300px] md:h-[450px] bg-gradient-to-b from-[#f3f4f6] to-[#fff] border border-gray-200 shadow-inner rounded-2xl overflow-hidden relative group">
      
      {/* 3D Context Window */}
      <Canvas camera={{ position: [0, 1.4, 2.5], fov: 40 }}>
        {/* Soft studio lighting */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[2, 2, 5]} intensity={1.2} color="#fff6f2" />
        <directionalLight position={[-2, 2, -5]} intensity={0.5} color="#eef5ff" />
        
        {/* The active Avatar instance */}
        <AnimatedAvatarWrapper isSpeaking={isSpeaking} getAudioVolume={getAudioVolume} />
        
        {/* Ambient grounding shadow */}
        <ContactShadows position={[0, -1.4, 0]} opacity={0.5} scale={5} blur={1.5} />
      </Canvas>

      {/* Decorative Recording UI */}
      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-800 border border-black/10 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
        {isSpeaking ? 'AI ANALYZING' : 'IDLE'}
      </div>
    </div>
  );
}
