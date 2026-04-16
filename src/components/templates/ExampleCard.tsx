'use client';
import { Lightbulb, Zap, ArrowRight, Sparkles } from 'lucide-react';
import type { Flashcard, ClassLevel } from '@/types';

interface Props {
  card: Flashcard;
  level: ClassLevel;
  side: 'front' | 'back';
}

export default function ExampleCard({ card, level, side }: Props) {
  const isJunior = level === 'junior';
  const isSenior = level === 'senior';

  const styles = {
    junior: {
      bg: 'bg-gradient-to-br from-emerald-400/20 via-blue-400/10 to-indigo-500/10',
      border: 'border-emerald-500/30',
      accent: 'text-emerald-400',
      radius: 'rounded-[3rem]',
      emoji: '💡',
    },
    mid: {
      bg: 'bg-white/5',
      border: 'border-white/10',
      accent: 'text-emerald-400',
      radius: 'rounded-[2.5rem]',
      emoji: '🌱',
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
    <div className={`w-full h-full relative p-10 backface-hidden ${styles.bg} backdrop-blur-3xl border ${styles.border} ${styles.radius} overflow-hidden shadow-2xl`}>
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Zap className="w-20 h-20" />
      </div>

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-white/5">
            <Zap className={`w-5 h-5 ${styles.accent}`} />
          </div>
          <span className={`text-xs font-black uppercase tracking-[0.3em] opacity-40 ${styles.accent}`}>Real-World Example</span>
          {isJunior && <span className="text-xl ml-auto">{styles.emoji}</span>}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-30">The Scenario</span>
              <h2 className={`font-black tracking-tight leading-tight ${isJunior ? 'text-2xl' : isSenior ? 'text-3xl' : 'text-2xl'}`}>
                {card.front}
              </h2>
            </div>

            {side === 'back' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 pt-6 border-t border-white/10">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-30">The Connection</span>
                  <p className={`font-medium leading-relaxed ${isJunior ? 'text-lg' : 'text-xl'}`}>
                    {card.back}
                  </p>
                </div>
                
                {card.insight && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                    <p className="text-sm opacity-60 italic">"{card.insight}"</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { motion } from 'framer-motion';
