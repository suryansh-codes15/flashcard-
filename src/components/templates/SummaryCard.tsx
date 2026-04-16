'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, List, Target, Lightbulb, Sparkles } from 'lucide-react';
import type { Flashcard, ClassLevel } from '@/types';

interface Props {
  card: Flashcard;
  level: ClassLevel;
  side: 'front' | 'back';
}

export default function SummaryCard({ card, level, side }: Props) {
  const isJunior = level === 'junior';
  const isSenior = level === 'senior';

  const styles = {
    junior: {
      bg: 'bg-gradient-to-br from-indigo-400/20 via-blue-400/10 to-emerald-500/10',
      border: 'border-indigo-500/30',
      accent: 'text-indigo-400',
      radius: 'rounded-[3rem]',
      emoji: '📚',
    },
    mid: {
      bg: 'bg-white/5',
      border: 'border-white/10',
      accent: 'text-indigo-400',
      radius: 'rounded-[2.5rem]',
      emoji: '📖',
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
        <BookOpen className="w-20 h-20" />
      </div>

      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-white/5">
            <BookOpen className={`w-5 h-5 ${styles.accent}`} />
          </div>
          <span className={`text-xs font-black uppercase tracking-[0.3em] opacity-40 ${styles.accent}`}>Chapter Review</span>
          {isJunior && <span className="text-xl ml-auto">{styles.emoji}</span>}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-8">
           <h2 className={`font-black tracking-tight leading-tight ${isJunior ? 'text-2xl' : isSenior ? 'text-3xl' : 'text-2xl'}`}>
             {card.front}
           </h2>

           {side === 'back' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-4 block">Key Takeaways</span>
                  <div className="space-y-4">
                     {card.back.split('\n').map((line, i) => (
                       <div key={i} className="flex gap-3">
                         <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${styles.accent}`} />
                         <p className="text-sm font-medium leading-relaxed opacity-80">{line.replace(/^[-•]\s*/, '')}</p>
                       </div>
                     ))}
                  </div>
                </div>

                {card.insight && (
                  <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-xs opacity-60 leading-relaxed italic">"{card.insight}"</p>
                  </div>
                )}
             </motion.div>
           )}
        </div>
      </div>
    </div>
  );
}
