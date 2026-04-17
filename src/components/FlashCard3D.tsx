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
        <div className={`absolute inset-0 backface-hidden rounded-[24px] bg-gradient-to-br ${theme.gradient} p-8 border border-white/5 flex flex-col shadow-2xl overflow-y-auto custom-scrollbar`}>
          <div className="flex justify-between items-start mb-6">
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase text-purple-300 tracking-[0.2em] flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              {card.type || 'CONCEPT'}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${i < (card.difficulty || 3) ? 'bg-amber-400' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-start text-center gap-4 pt-4">
            <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed line-clamp-4">
              {card.front}
            </h3>
            {card.insight && (
               <p className="text-[11px] text-gray-400 italic font-medium leading-relaxed opacity-60">
                "{card.insight}"
               </p>
            )}
          </div>

          <div className="mt-6 flex justify-between items-end">
            <HelpCircle className="w-7 h-7 text-white/5" />
            <div className="w-full max-w-[120px] space-y-1.5">
               <div className="flex justify-between text-[8px] font-black text-white/20 uppercase tracking-widest">
                 <span>Mastery</span>
                 <span>{(card.reviewCount || 0) * 10}%</span>
               </div>
               <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                   style={{ width: `${Math.min((card.reviewCount || 0) * 10, 100)}%` }}
                 />
               </div>
            </div>
          </div>
        </div>

        {/* BACK FACE */}
        <div 
          className="absolute inset-0 backface-hidden rounded-[24px] bg-gradient-to-br from-[#0a0616] to-[#0f0a1e] p-8 border-2 border-emerald-500/30 flex flex-col shadow-2xl overflow-y-auto custom-scrollbar"
          style={{ transform: 'rotateY(180deg)' }}
        >
          {/* Subtle Back Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          
          <div className="relative flex justify-between items-start mb-4">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">The Answer</span>
            <Trophy className="w-4 h-4 text-emerald-400/40" />
          </div>

          <div className="relative flex-1 flex flex-col items-center justify-start text-center gap-3 pt-6">
            <h2 className="text-2xl md:text-3xl font-black text-[#6ee7b7] leading-tight drop-shadow-[0_0_15px_rgba(110,231,183,0.4)]">
              {card.back}
            </h2>
            {card.example && (
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 max-w-[280px]">
                <p className="text-[10px] text-emerald-400/60 leading-relaxed italic">
                  Example: {card.example}
                </p>
              </div>
            )}
          </div>

          <div className="relative mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{card.level || 'Standard'} LOGIC</span>
            </div>
            <div className="text-[10px] font-black text-emerald-400/20 uppercase tracking-widest">verified insight</div>
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
