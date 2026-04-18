'use client';

import { useState, useMemo } from 'react';
import { MascotSubject, Flashcard, DifficultyLevel } from '@/types';
import { Sparkles, HelpCircle, Lightbulb, Zap, Trophy } from 'lucide-react';

interface Props {
  card: Flashcard;
  subject: MascotSubject;
  isFlipped: boolean;
  onFlip: () => void;
  shake?: boolean;
  className?: string;
}

export default function FlashCard3D({ card, subject, isFlipped, onFlip, shake, className = "" }: Props) {
  // Subject Color Mapping
  const themeColors = {
    science:   { primary: '#7c3aed', gradient: 'from-[#1a0f3a] to-[#2d1b69]', glow: 'rgba(139,92,246,.28)' },
    math:      { primary: '#10b981', gradient: 'from-[#0a2c1c] to-[#134e35]', glow: 'rgba(16,185,129,.18)' },
    geography: { primary: '#2563eb', gradient: 'from-[#0c2240] to-[#1e3a5f]', glow: 'rgba(37,99,235,.16)' },
    history:   { primary: '#f59e0b', gradient: 'from-[#2c1000] to-[#4a1c00]', glow: 'rgba(217,119,6,.15)' },
    language:  { primary: '#db2777', gradient: 'from-[#2c0020] to-[#4a0030]', glow: 'rgba(219,39,119,.14)' },
  };

  const theme = themeColors[subject] || themeColors.science;

  // Orbiting Star Positions
  const orbitingStars = useMemo(() => [
    { text: '✦', delay: '0s', inset: '-20px auto auto -20px' },
    { text: '★', delay: '1s', inset: '-30px -30px auto auto' },
    { text: '✧', delay: '2s', inset: 'auto -20px -20px auto' },
    { text: '✦', delay: '1.5s', inset: 'auto auto -30px -30px' },
    { text: '★', delay: '0.5s', inset: '-40px 50% auto auto' },
    { text: '✧', delay: '2.5s', inset: 'auto 50% -40px auto' },
  ], []);

  return (
    <div className={`relative w-full max-w-[440px] h-[300px] animate-float ${className}`}>
      
      {/* 3D Wrapper */}
      <div 
        className={`relative w-full h-full preserve-3d transition-transform duration-700 cursor-pointer ${shake ? 'animate-shake' : ''}`}
        onClick={() => {
          console.log('Card tapped. isFlipped:', isFlipped);
          onFlip();
        }}
        style={{ 
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' 
        }}
      >
        
        {/* HOLO BORDER RING */}
        <div 
          className="absolute inset-[-3px] rounded-[26px] z-[-1] animate-holo"
          style={{ 
            background: 'linear-gradient(270deg, #7c3aed, #06b6d4, #10b981, #f59e0b, #ec4899, #7c3aed)',
            backgroundSize: '400% 400%'
          }}
        />

        {/* CARD GLOW */}
        <div 
          className="absolute inset-[-14px] z-[-2] rounded-[32px] animate-glow"
          style={{ background: `radial-gradient(ellipse, ${theme.glow} 0%, transparent 70%)` }}
        />

        {/* ORBITING DECORATIONS */}
        {orbitingStars.map((star, i) => (
          <span 
            key={i}
            className="absolute text-purple-400/40 text-sm animate-[floatStar_3s_ease-in-out_infinite]"
            style={{ inset: star.inset, animationDelay: star.delay }}
          >
            {star.text}
          </span>
        ))}

        {/* FRONT FACE */}
        <div 
          className={`absolute inset-0 backface-hidden rounded-[24px] p-8 shimmer-effect flex flex-col shadow-2xl overflow-hidden`}
          style={{
            background: `linear-gradient(145deg, ${theme.primary}20, #0f0a1e, #1a1040)`,
            border: `2px solid ${theme.glow.replace('.28', '0.5').replace('.18', '0.5').replace('.16', '0.5').replace('.15', '0.5').replace('.14', '0.5')}`
          }}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="badge flex items-center gap-1.5" style={{ background: theme.glow, color: theme.primary, border: `1px solid ${theme.glow}` }}>
              <Zap className="w-3 h-3" />
              {card.type || 'CONCEPT'}
            </div>
            <div className="flex items-center gap-1 z-10">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${i < (card.difficulty || 3) ? 'bg-amber-400' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 z-10">
            <h3 className="text-xl md:text-2xl font-bold text-white leading-snug">
              {card.front}
            </h3>
            {card.insight && (
               <p className="text-[12px] text-gray-400 italic font-medium leading-relaxed opacity-80">
                Hint: {card.insight}
               </p>
            )}
          </div>

          <div className="mt-6 w-full z-10">
             <div className="xp-bar mb-2">
               <div 
                 className="xp-bar-fill"
                 style={{ width: `${Math.min((card.reviewCount || 0) * 10, 100)}%` }}
               />
             </div>
             <div className="flex justify-between">
               <span className="text-[10px] text-gray-500 uppercase tracking-widest">Mastery</span>
               <span className="text-[10px] font-bold" style={{ color: theme.primary }}>{(card.reviewCount || 0) * 10}%</span>
             </div>
          </div>
          <div className="absolute bottom-4 right-4 text-[36px] opacity-[0.05] font-black z-0">?</div>
        </div>

        {/* BACK FACE */}
        <div 
          className="absolute inset-0 backface-hidden rounded-[24px] p-8 flex flex-col items-center justify-center text-center shadow-2xl overflow-y-auto custom-scrollbar"
          style={{ 
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(145deg, #0a2c1c, #134e35, #065f46)',
            border: '2px solid rgba(16,185,129,0.5)',
          }}
        >
          <div className="text-[11px] font-black tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            ANSWER
          </div>

          <h2 className="text-3xl font-black text-[#6ee7b7] leading-tight drop-shadow-[0_0_15px_rgba(110,231,183,0.4)] mb-4">
            {card.back}
          </h2>
          
          {card.example && (
            <p className="text-[13px] text-emerald-100/70 leading-relaxed max-w-[90%]">
              {card.example}
            </p>
          )}

          <div className="absolute bottom-6 w-full px-8 flex justify-between items-center opacity-50">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{card.level || 'Standard'} LOGIC</span>
            </div>
            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">verified insight</div>
          </div>
        </div>

      </div>

      {/* CARD GROUND SHADOW */}
      <div 
        className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 w-[220px] h-[14px] bg-black/60 rounded-full blur-[10px] animate-[shadowPulse_4s_ease-in-out_infinite] z-[-1]"
      />
    </div>
  );
}
