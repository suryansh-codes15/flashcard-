'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, BrainCircuit, Target, Lightbulb, AlertTriangle } from 'lucide-react';
import type { Flashcard, ClassLevel } from '@/types';

interface Props {
  card: Flashcard;
  level: ClassLevel;
  side: 'front' | 'back';
  selectedOption?: string | null;
  onSelect?: (option: string) => void;
}

export default function MCQCard({ card, level, side, selectedOption, onSelect }: Props) {
  const { options, correctAnswer, insight, mistake } = card;
  const isCorrect = selectedOption === correctAnswer;
  const isJunior = level === 'junior';
  const isSenior = level === 'senior';

  const styles = {
    junior: {
      bg: 'bg-gradient-to-br from-blue-400/20 via-emerald-400/10 to-pink-500/10',
      border: 'border-blue-500/30',
      option: 'rounded-3xl',
      radius: 'rounded-[3rem]',
      emoji: '🌟',
    },
    mid: {
      bg: 'bg-white/5',
      border: 'border-white/10',
      option: 'rounded-2xl',
      radius: 'rounded-[2.5rem]',
      emoji: '🎯',
    },
    senior: {
      bg: 'bg-black/60',
      border: 'border-white/5',
      option: 'rounded-xl',
      radius: 'rounded-[1.5rem]',
      emoji: '✧',
    },
  }[level];

  return (
    <div className={`w-full h-full relative p-10 backface-hidden ${styles.bg} backdrop-blur-3xl border ${styles.border} ${styles.radius} overflow-hidden shadow-2xl overflow-y-auto custom-scrollbar`}>
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Target className="w-20 h-20" />
      </div>

      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-white/5">
            <Target className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.3em] opacity-40 text-emerald-400">Knowledge Challenge</span>
          {isJunior && <span className="text-xl ml-auto">{styles.emoji}</span>}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h2 className={`font-black tracking-tight leading-tight mb-8 ${isJunior ? 'text-2xl' : isSenior ? 'text-3xl' : 'text-2xl'}`}>
            {card.front}
          </h2>

          <div className="grid gap-3">
            {options?.map((option, i) => {
              const isSelected = selectedOption === option;
              const isAnswer = option === correctAnswer;
              const showResult = selectedOption !== null;

              return (
                <button
                  key={i}
                  disabled={showResult}
                  onClick={() => onSelect?.(option)}
                  className={`w-full p-4 text-left border transition-all duration-300 relative overflow-hidden ${styles.option} ${
                    showResult
                      ? isAnswer
                        ? 'bg-emerald-500/20 border-emerald-500/40'
                        : isSelected
                        ? 'bg-rose-500/20 border-rose-500/40'
                        : 'bg-white/5 border-white/5 opacity-40'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      showResult
                        ? isAnswer
                          ? 'border-emerald-400 bg-emerald-400'
                          : isSelected
                          ? 'border-rose-400 bg-rose-400'
                          : 'border-white/10'
                        : 'border-white/20'
                    }`}>
                      {showResult && isAnswer && <CheckCircle2 className="w-4 h-4 text-white" />}
                      {showResult && isSelected && !isAnswer && <XCircle className="w-4 h-4 text-white" />}
                      {!showResult && <span className="text-[10px] font-black">{String.fromCharCode(65 + i)}</span>}
                    </div>
                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-white/70'}`}>
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback (revealed after selection) */}
        <AnimatePresence>
          {selectedOption && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 pt-8 border-t border-white/10 space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-30">The Logic</span>
                <p className="text-sm leading-relaxed font-bold text-white/90">{card.back}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Insight</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-60 italic">"{insight || 'Master this concept to unlock deeper understandings.'}"</p>
                </div>
                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Common Trap</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-60 italic">"{mistake || 'Watch out for misinterpreting the core relationship.'}"</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
