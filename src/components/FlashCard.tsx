'use client';

import { useState, useEffect } from 'react';
import MascotSVG from './MascotSVG';

type Subject = 'math' | 'science' | 'geography' | 'history' | 'language';

interface Props {
  subject: Subject;
  question: string;
  answer: string;
  mastery?: number;
  delay?: number;
  onRate?: (rating: 'easy' | 'medium' | 'hard') => void;
}

export default function FlashCard({ subject, question, answer, mastery = 0, delay = 0, onRate }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimate, setIsAnimate] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState<'green' | 'red' | null>(null);

  const configs = {
    math: { bg: 'from-orange-100 to-orange-200', text: 'text-orange-600', border: 'border-orange-300', shadow: 'hover:shadow-orange-200/50', label: 'Math' },
    science: { bg: 'from-purple-100 to-purple-200', text: 'text-purple-600', border: 'border-purple-300', shadow: 'hover:shadow-purple-200/50', label: 'Science' },
    geography: { bg: 'from-blue-100 to-blue-200', text: 'text-blue-600', border: 'border-blue-300', shadow: 'hover:shadow-blue-200/50', label: 'Geography' },
    history: { bg: 'from-yellow-100 to-yellow-200', text: 'text-yellow-600', border: 'border-yellow-300', shadow: 'hover:shadow-yellow-200/50', label: 'History' },
    language: { bg: 'from-pink-100 to-pink-200', text: 'text-pink-600', border: 'border-pink-300', shadow: 'hover:shadow-pink-200/50', label: 'Language' },
  };

  const config = configs[subject] || configs.math;

  const handleCorrect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimate(true);
    setFlash('green');
    setShowXP(true);
    // Beep placeholder logic
    console.log('Audio API: Beep (Success)');
    
    setTimeout(() => {
      setIsAnimate(false);
      setFlash(null);
      setShowXP(false);
      onRate?.('easy');
    }, 1000);
  };

  const handleWrong = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShake(true);
    setFlash('red');
    // Beep placeholder logic
    console.log('Audio API: Beep (Fail)');
    
    setTimeout(() => {
      setShake(false);
      setFlash(null);
      onRate?.('hard');
    }, 400);
  };

  return (
    <div 
      className={`card-antigravity relative w-full h-[380px] perspective-1000 transition-all duration-500 ${shake ? 'shake-card' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className={`relative w-full h-full duration-700 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* FRONT SIDE */}
        <div className={`absolute inset-0 w-full h-full backface-hidden rounded-[20px] border-4 p-8 bg-gradient-to-br ${config.bg} ${config.border} shadow-xl ${config.shadow} hover:scale-105 transition-transform overflow-hidden`}>
          {/* Sparkle Dots */}
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="sparkle-dot w-2 h-2 opacity-30" 
              style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animation: `particlePulse ${2 + Math.random() * 2}s infinite` }} 
            />
          ))}

          <div className="flex flex-col h-full uppercase tracking-tighter">
            {/* Header: Subject Badge */}
            <div className="flex justify-between items-start mb-4">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black ${config.bg} ${config.text} border-2 ${config.border} shadow-sm`}>
                {config.label}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-black text-black/40">MASTERED</span>
                <span className="text-sm font-black text-black">{mastery}%</span>
              </div>
            </div>

            {/* Mastery Bar */}
            <div className="h-4 w-full bg-white/40 rounded-full mb-8 overflow-hidden border-2 border-white/60">
              <div 
                className={`h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 ease-out`}
                style={{ width: `${mastery}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="flex-1 flex items-center justify-center text-center overflow-y-auto custom-scrollbar px-2 mb-4">
              <h3 className="text-xl font-black text-slate-800 leading-tight">
                {question}
              </h3>
            </div>

            {/* Floating Mascot */}
            <MascotSVG 
              subject={subject} 
              className="absolute bottom-4 right-4 w-28 h-28 transform"
            />
          </div>
        </div>

        {/* BACK SIDE (Answer) */}
        <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[20px] border-4 p-8 bg-white ${config.border} shadow-2xl overflow-hidden`}>
          {/* XP FLOAT EFFECT */}
          {showXP && (
            <div className="xp-float absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-emerald-500 font-extrabold text-3xl">
              +10 XP
            </div>
          )}

          {/* FLASH OVERLAY */}
          {flash === 'green' && <div className="absolute inset-0 bg-emerald-400/20 z-10" />}
          {flash === 'red' && <div className="absolute inset-0 bg-rose-400/20 z-10" />}

          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center text-center overflow-y-auto custom-scrollbar px-2 mb-4">
              <span className="text-xs font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">The Answer Is</span>
              <h2 className={`text-xl font-black ${config.text} leading-snug`}>
                {answer}
              </h2>
              {isAnimate && (
                <div className="coin-anim text-5xl mt-2">💰</div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleWrong}
                className="py-4 rounded-2xl bg-slate-100 text-slate-400 font-black text-sm uppercase hover:bg-rose-500 hover:text-white transition-all active:scale-95"
              >
                Not Yet
              </button>
              <button 
                onClick={handleCorrect}
                className="py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm uppercase shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all active:scale-95"
              >
                I Got It!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
