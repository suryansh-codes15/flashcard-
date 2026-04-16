'use client';
import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';
import type { Flashcard, ClassLevel } from '@/types';

interface Props {
  card: Flashcard;
  level: ClassLevel;
  side: 'front' | 'back';
}

export default function ConceptCard({ card, level, side }: Props) {
  const isJunior = level === 'junior';
  const isSenior = level === 'senior';

  const styles = {
    junior: {
      bg: 'bg-gradient-to-br from-pink-400/20 via-orange-400/10 to-indigo-500/10',
      border: 'border-pink-500/30',
      accent: 'text-pink-400',
      radius: 'rounded-[3rem]',
      emoji: '🎈',
    },
    mid: {
      bg: 'bg-white/5',
      border: 'border-white/10',
      accent: 'text-indigo-400',
      radius: 'rounded-[2.5rem]',
      emoji: '🧠',
    },
    senior: {
      bg: 'bg-black/40',
      border: 'border-white/5',
      accent: 'text-white',
      radius: 'rounded-[1.5rem]',
      emoji: '✧',
    },
  }[level];

  return (
    <div className={`w-full h-full relative p-10 ${styles.bg} backdrop-blur-3xl border ${styles.border} ${styles.radius} overflow-hidden shadow-2xl`}>
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <BrainCircuit className="w-20 h-20" />
      </div>

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`p-2 rounded-xl bg-white/5 ${styles.accent}`}>
            <BrainCircuit className="w-5 h-5" />
          </div>
          <span className={`text-xs font-black uppercase tracking-[0.3em] opacity-40 ${styles.accent}`}>Concept</span>
          {isJunior && <span className="text-xl ml-auto">{styles.emoji}</span>}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className={`font-black tracking-tight leading-tight ${isJunior ? 'text-3xl' : isSenior ? 'text-4xl' : 'text-3xl'}`}>
            {side === 'front' ? card.front : card.back}
          </h2>
        </div>

        {/* Footer Meta (Back only) */}
        {side === 'back' && (
          <div className="mt-8 grid grid-cols-2 gap-4">
            {card.insight && (
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Insight</span>
                </div>
                <p className="text-xs leading-relaxed opacity-60 line-clamp-2">{card.insight}</p>
              </div>
            )}
            {card.mistake && (
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Avoid</span>
                </div>
                <p className="text-xs leading-relaxed opacity-60 line-clamp-2">{card.mistake}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
