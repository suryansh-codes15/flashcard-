'use client';

import { useState, useEffect, useRef } from 'react';
import { DifficultyLevel } from '@/types';

interface Props {
  front: string;
  back: string;
  subject?: string;
  hint?: string;
  explanation?: string;
  mastery?: number;
  onRate: (rating: DifficultyLevel) => void;
  flipped: boolean;
  onFlip: () => void;
  isFlippedManually: boolean;
}

export default function FlashCard3D({
  front,
  back,
  subject = "Science",
  hint,
  explanation,
  mastery = 0,
  onRate,
  flipped,
  onFlip,
  isFlippedManually
}: Props) {
  
  const stars = ['✦', '★', '✧', '·', '✦', '★'];

  return (
    <div className="relative flex items-center justify-center p-12">
      
      {/* 🔮 LAYER 1 & 4 (Glow + Shadow) */}
      <div 
        className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[240px] h-[22px] bg-black/50 blur-xl rounded-[50%] animate-[shadowPulse_4.5s_ease-in-out_infinite]"
        style={{ zIndex: 0 }}
      />
      
      {/* 🌌 LAYER 5: Orbiting Stars */}
      <div className="absolute inset-0 pointer-events-none z-10 hidden sm:block">
        {stars.map((star, i) => (
          <div 
            key={i}
            className="absolute top-1/2 left-1/2 text-white/40 animate-float-star font-serif"
            style={{
              fontSize: i % 2 === 0 ? '18px' : '14px',
              transform: `rotate(${i * 60}deg) translateY(-210px)`,
              animationDelay: `${i * 0.7}s`,
            }}
          >
            {star}
          </div>
        ))}
      </div>

      {/* 🃏 LAYER 3 (Card Wrapper) */}
      <div 
        className={`relative w-full min-h-[440px] cursor-pointer preserve-3d transition-transform duration-[700ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${flipped ? 'rotate-y-180' : ''}`}
        onClick={onFlip}
        style={{
          animation: flipped ? 'none' : 'cardFloat 4.5s ease-in-out infinite'
        }}
      >
        
        {/* 🟣 LAYER 1: Glow Aura */}
        <div 
          className="absolute inset-[-20px] rounded-[32px] animate-glow pointer-events-none z-0"
          style={{ 
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.3) 0%, transparent 70%)',
            transform: 'translateZ(-20px)'
          }}
        />

        {/* 🌈 LAYER 2: Holo Border Ring */}
        <div 
          className="absolute inset-[-4px] rounded-[28px] animate-holo pointer-events-none z-0"
          style={{ 
            background: 'linear-gradient(270deg, #7c3aed, #06b6d4, #10b981, #f59e0b, #ec4899, #7c3aed)',
            backgroundSize: '400% 400%',
            transform: 'translateZ(-5px)'
          }}
        />

        {/* 🟦 FRONT FACE */}
        <div 
          className="absolute inset-0 backface-hidden preserve-3d bg-gradient-to-br from-[#1a0f3a] via-[#241452] to-[#1a1040] rounded-[24px] border border-white/10 shadow-2xl flex flex-col p-6 sm:p-8 z-10"
          style={{ transform: 'rotateY(0deg) translateZ(10px)' }}
        >
          {/* Decorative Corner */}
          <div className="absolute bottom-[-10px] right-[-10px] text-[80px] font-black text-white/[0.04] select-none pointer-events-none">?</div>
          
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none">
              {subject}
            </span>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest hidden sm:block">tap to flip ↕</span>
          </div>

          <div className="flex-1 flex flex-col justify-start pt-4 gap-4 sm:gap-6 relative z-20 overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              <div className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em]">Question</div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-lg">
                {front}
              </h2>
            </div>
            
            {hint && (
              <p className="text-[13px] sm:text-[14px] text-white/50 italic font-medium leading-relaxed">
                {hint}
              </p>
            )}
          </div>

          <div className="mt-6 sm:mt-8 space-y-2 relative z-20">
            <div className="flex justify-between items-end px-1">
              <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Mastery</span>
              <span className="text-[10px] font-black text-white/60">{mastery}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-1000 ease-out"
                style={{ width: `${mastery}%` }}
              />
            </div>
          </div>
        </div>

        {/* 🟩 BACK FACE */}
        <div 
          className="absolute inset-0 backface-hidden preserve-3d bg-gradient-to-br from-[#0a2c1c] via-[#0d3b26] to-[#041a10] rounded-[24px] border border-emerald-500/30 shadow-2xl flex flex-col p-6 sm:p-8 z-10"
          style={{ transform: 'rotateY(180deg) translateZ(10px)' }}
        >
          <div className="flex-1 px-2 sm:px-4 py-6 flex flex-col items-center justify-start text-center relative z-20 overflow-y-auto custom-scrollbar">
            <div className="w-full flex flex-col items-center gap-6 sm:gap-8 pt-4">
              <div className="space-y-4 w-full">
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Answer ✅</div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-[#6ee7b7] leading-relaxed max-w-[95%] mx-auto drop-shadow-[0_0_15px_rgba(110,231,183,0.3)]">
                  {back}
                </h2>
              </div>
              
              {explanation && (
                <p className="text-[13px] sm:text-[14px] text-emerald-100/60 font-medium leading-relaxed max-w-[95%] animate-fade-in">
                  {explanation}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 pb-2 text-[9px] font-black text-white/20 text-center uppercase tracking-widest pointer-events-none hidden sm:block relative z-20">
            Space to flip · 1-4 to rate
          </div>
        </div>

      </div>
    </div>
  );
}
