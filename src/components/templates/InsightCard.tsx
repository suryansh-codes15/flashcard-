'use client';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles, Globe, Target } from 'lucide-react';
import type { Flashcard, ClassLevel } from '@/types';

interface Props {
  card: Flashcard;
  level: ClassLevel;
  side: 'front' | 'back';
}

export default function InsightCard({ card, level, side }: Props) {
  const isJunior = level === 'junior';
  const isSenior = level === 'senior';

  const styles = {
    junior: {
      bg: 'bg-gradient-to-br from-yellow-400/20 via-pink-400/10 to-indigo-500/10',
      border: 'border-yellow-500/30',
      accent: 'text-yellow-400',
      radius: 'rounded-[3rem]',
      emoji: '✨',
    },
    mid: {
      bg: 'bg-white/5',
      border: 'border-white/10',
      accent: 'text-amber-400',
      radius: 'rounded-[2.5rem]',
      emoji: '💡',
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
    <div className={`w-full h-full relative p-10 backface-hidden ${styles.bg} backdrop-blur-3xl border ${styles.border} ${styles.radius} overflow-hidden shadow-2xl`}>
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Sparkles className="w-20 h-20" />
      </div>

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-white/5">
            <Lightbulb className={`w-5 h-5 ${styles.accent}`} />
          </div>
          <span className={`text-xs font-black uppercase tracking-[0.3em] opacity-40 ${styles.accent}`}>Hidden Insight</span>
          {isJunior && <span className="text-xl ml-auto">{styles.emoji}</span>}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="space-y-6">
            <h2 className={`font-black tracking-tight leading-tight italic ${isJunior ? 'text-2xl' : isSenior ? 'text-4xl' : 'text-3xl'}`}>
              "{card.front}"
            </h2>
            
            {side === 'back' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-6 border-t border-white/10">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Perspective</span>
                  <p className={`font-medium leading-relaxed italic ${isJunior ? 'text-lg' : 'text-xl'} opacity-80`}>
                    {card.back}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 mt-8 opacity-40">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Global Context</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Deep Logic</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
