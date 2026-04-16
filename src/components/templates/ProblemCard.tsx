'use client';
import { motion } from 'framer-motion';
import { Zap, Target, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import type { Flashcard, ClassLevel } from '@/types';

interface Props {
  card: Flashcard;
  level: ClassLevel;
  side: 'front' | 'back';
}

export default function ProblemCard({ card, level, side }: Props) {
  const isJunior = level === 'junior';
  const isSenior = level === 'senior';

  const styles = {
    junior: {
      bg: 'bg-gradient-to-br from-rose-400/20 via-orange-400/10 to-indigo-500/10',
      border: 'border-rose-500/30',
      accent: 'text-rose-400',
      radius: 'rounded-[3rem]',
      emoji: '🚧',
    },
    mid: {
      bg: 'bg-white/5',
      border: 'border-white/10',
      accent: 'text-rose-400',
      radius: 'rounded-[2.5rem]',
      emoji: '⚡',
    },
    senior: {
      bg: 'bg-black/60',
      border: 'border-white/5',
      accent: 'text-white',
      radius: 'rounded-[1.5rem]',
      emoji: '✧',
    },
  }[level];

  return (
    <div className={`w-full h-full relative p-10 backface-hidden ${styles.bg} backdrop-blur-3xl border ${styles.border} ${styles.radius} overflow-hidden shadow-2xl overflow-y-auto custom-scrollbar`}>
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Zap className="w-20 h-20" />
      </div>

      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-white/5">
            <Zap className={`w-5 h-5 ${styles.accent}`} />
          </div>
          <span className={`text-xs font-black uppercase tracking-[0.3em] opacity-40 ${styles.accent}`}>Challenge Scenario</span>
          {isJunior && <span className="text-xl ml-auto">{styles.emoji}</span>}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
            <h2 className={`font-black tracking-tight leading-loose ${isJunior ? 'text-xl' : isSenior ? 'text-2xl' : 'text-xl'} opacity-90`}>
              {card.front}
            </h2>
          </div>

          {side === 'back' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2 block">Step-By-Step Solution</span>
                <p className={`font-bold leading-relaxed ${isJunior ? 'text-lg' : 'text-xl'}`}>
                  {card.back}
                </p>
              </div>

              {card.mistake && (
                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Common Pitfall</span>
                    <p className="text-xs opacity-60 leading-relaxed font-medium">"{card.mistake}"</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
