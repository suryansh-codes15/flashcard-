'use client';

import { useState } from 'react';
import MascotCharacter, { MascotSubject } from './MascotCharacter';

interface Props {
  subject: MascotSubject;
  question: string;
  answer: string;
  isFlipped: boolean;
  onFlip: () => void;
  className?: string;
}

export default function FlashCard({ subject, question, answer, isFlipped, onFlip, className = "" }: Props) {
  return (
    <div className={`flip-card-container w-full max-w-[420px] h-[280px] animate-antigravity cursor-pointer ${className}`}>
      <div 
        onClick={onFlip}
        className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}
      >
        {/* FRONT FACE */}
        <div className="flip-card-front bg-gradient-to-br from-[#1a1040] to-[#2d1b69] border-2 border-purple-500/30 p-8 flex flex-col justify-between shadow-2xl">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-black text-purple-300/50 uppercase tracking-[0.2em]">Question</span>
            <span className="text-[10px] font-black text-purple-300/30 uppercase tracking-widest animate-pulse">tap to flip</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center text-center px-4 overflow-y-auto custom-scrollbar">
            <h3 className="text-xl font-bold text-white leading-relaxed">
              {question}
            </h3>
          </div>

          <div className="flex justify-end pr-2">
            <MascotCharacter subject={subject} className="w-16 h-16 opacity-80" />
          </div>
        </div>

        {/* BACK FACE */}
        <div className="flip-card-back bg-gradient-to-br from-[#051a10] to-[#062b18] border-2 border-emerald-500/30 p-8 flex flex-col justify-between shadow-2xl">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-black text-emerald-400/50 uppercase tracking-[0.2em]">The Answer Is</span>
            <div className="w-4 h-4 rounded-full border border-emerald-400/20 animate-spin" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-black text-[#6ee7b7] leading-tight mb-2 drop-shadow-[0_0_10px_rgba(110,231,183,0.3)]">
              {answer}
            </h2>
            <p className="text-[11px] text-emerald-400/40 uppercase font-bold tracking-widest">Mastered insight</p>
          </div>

          <div className="flex justify-between items-end">
            <div className="text-2xl">✨</div>
            <div className="text-[10px] font-black text-emerald-400/20 uppercase">Forge Result</div>
          </div>
        </div>
      </div>
    </div>
  );
}
