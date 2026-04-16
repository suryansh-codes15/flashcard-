'use client';
import { motion } from 'framer-motion';
import { Sparkles, Laugh, Star, PartyPopper, Heart } from 'lucide-react';
import type { Flashcard, ClassLevel } from '@/types';

interface Props {
  card: Flashcard;
  level: ClassLevel;
  side: 'front' | 'back';
}

export default function FunCard({ card, level, side }: Props) {
  const isJunior = level === 'junior';
  const isSenior = level === 'senior';

  // FunCard is specifically for Junior, but we provide a premium fallback for others
  const styles = {
    junior: {
      bg: 'bg-gradient-to-br from-pink-400/30 via-yellow-400/20 to-blue-500/10',
      border: 'border-pink-500/40',
      accent: 'text-pink-500',
      radius: 'rounded-[3rem]',
      emoji: '🌈',
      icon: Laugh,
    },
    mid: {
      bg: 'bg-white/5',
      border: 'border-white/10',
      accent: 'text-amber-400',
      radius: 'rounded-[2.5rem]',
      emoji: '💡',
      icon: Sparkles,
    },
    senior: {
      bg: 'bg-black/80',
      border: 'border-white/5',
      accent: 'text-white',
      radius: 'rounded-[1.5rem]',
      emoji: '✧',
      icon: Star,
    },
  }[level];

  const Icon = styles.icon;

  return (
    <div className={`w-full h-full relative p-10 backface-hidden ${styles.bg} backdrop-blur-3xl border ${styles.border} ${styles.radius} overflow-hidden shadow-2xl`}>
      <div className="absolute -top-10 -right-10 p-8 opacity-20 rotate-12">
        <PartyPopper className="w-40 h-40" />
      </div>

      <div className="flex flex-col h-full items-center justify-center text-center">
        {/* Header */}
        <div className="absolute top-10 left-10 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/5">
            <Icon className={`w-5 h-5 ${styles.accent}`} />
          </div>
          <span className={`text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ${styles.accent}`}>Brain Break</span>
        </div>

        {/* Content */}
        <div className="space-y-12">
           <div className="space-y-6">
              {isJunior && <span className="text-6xl block transform hover:scale-125 transition-transform">{styles.emoji}</span>}
              <h2 className={`font-black tracking-tight leading-tight ${isJunior ? 'text-3xl' : isSenior ? 'text-4xl' : 'text-3xl'}`}>
                {card.front}
              </h2>
           </div>

           {side === 'back' && (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="p-8 rounded-[3rem] bg-white/10 border border-white/10 relative">
                   <div className="absolute -top-4 -right-4 bg-pink-500 text-white p-2 rounded-full shadow-lg">
                      <Heart className="w-4 h-4 fill-current" />
                   </div>
                   <p className={`font-bold leading-relaxed ${isJunior ? 'text-xl' : 'text-2xl'} opacity-90`}>
                     {card.back}
                   </p>
                </div>

                {card.insight && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Did you know?</p>
                  </div>
                )}
             </motion.div>
           )}
        </div>

        {/* Floating elements for Junior */}
        {isJunior && (
          <div className="absolute inset-0 pointer-events-none opacity-20">
             <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-1/4 left-10 text-2xl">🍬</motion.div>
             <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute bottom-1/4 right-10 text-2xl">🐱</motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
