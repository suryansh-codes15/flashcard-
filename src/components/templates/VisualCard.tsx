'use client';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Sparkles, Move, Maximize2 } from 'lucide-react';
import type { Flashcard, ClassLevel } from '@/types';

interface Props {
  card: Flashcard;
  level: ClassLevel;
  side: 'front' | 'back';
}

export default function VisualCard({ card, level, side }: Props) {
  const isJunior = level === 'junior';
  const isSenior = level === 'senior';

  const styles = {
    junior: {
      bg: 'bg-gradient-to-br from-purple-400/20 via-pink-400/10 to-blue-500/10',
      border: 'border-purple-500/30',
      accent: 'text-purple-400',
      radius: 'rounded-[3rem]',
      emoji: '🎨',
    },
    mid: {
      bg: 'bg-white/5',
      border: 'border-white/10',
      accent: 'text-purple-400',
      radius: 'rounded-[2.5rem]',
      emoji: '🖼️',
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
        <ImageIcon className="w-20 h-20" />
      </div>

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-white/5">
            <ImageIcon className={`w-5 h-5 ${styles.accent}`} />
          </div>
          <span className={`text-xs font-black uppercase tracking-[0.3em] opacity-40 ${styles.accent}`}>Mental Visualization</span>
          {isJunior && <span className="text-xl ml-auto">{styles.emoji}</span>}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center">
           <div className="space-y-6">
             <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 border-dashed flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <Move className="w-6 h-6 opacity-40" />
                </div>
                <p className="text-center text-sm font-black uppercase tracking-widest opacity-20">Visualize this structure</p>
             </div>

             <h2 className={`font-black tracking-tight leading-tight text-center ${isJunior ? 'text-2xl' : isSenior ? 'text-3xl' : 'text-2xl'}`}>
               {card.front}
             </h2>

             {side === 'back' && (
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="pt-6 border-t border-white/10">
                  <div className="p-6 rounded-3xl bg-white/5">
                    <p className={`font-bold leading-relaxed text-center italic ${isJunior ? 'text-lg' : 'text-xl'} opacity-90`}>
                      {card.back}
                    </p>
                  </div>
               </motion.div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
