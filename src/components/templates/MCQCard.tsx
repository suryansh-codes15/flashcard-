'use client';
import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import type { Flashcard } from '@/types';

interface Props { 
  card: Flashcard; 
  side: 'front' | 'back'; 
  selectedOption?: string | null;
  onSelect?: (option: string) => void;
}

export default function MCQCard({ card, side, selectedOption, onSelect }: Props) {
  const isSelected = !!selectedOption;
  const isCorrect = selectedOption === card.correctAnswer;

  if (side === 'back') {
    return (
      <div className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col p-8"
        style={{ background: 'linear-gradient(135deg, #09090b 0%, #111827 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-1.5 rounded-lg ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </div>
          <span className={`text-xs font-black uppercase tracking-widest ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isCorrect ? 'Correct Analysis' : 'Misconception Found'}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Explanation</h4>
            <p className="text-base text-white/90 leading-relaxed font-medium">{card.back}</p>
          </div>

          {(card.insight || card.mistake) && (
            <div className="grid grid-cols-1 gap-3 pt-4 border-t border-white/5">
              {card.insight && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Elite Insight</span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed italic">"{card.insight}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex justify-center">
            <span className="text-[10px] font-bold text-white/20 tracking-[0.2em] uppercase">FlashForge Engine</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col p-8"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)', border: '1px solid rgba(255,255,255,0.05)' }}>
      
      {/* Question section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Smart MCQ
          </span>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(d => (
              <div key={d} className="w-1.5 h-1.5 rounded-full"
                style={{ background: d <= card.difficulty ? '#6366f1' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
        </div>
        <p className="text-xl font-bold text-white leading-snug">{card.front}</p>
      </div>

      {/* Options grid */}
      <div className="flex-1 flex flex-col gap-3">
        {card.options?.map((option, idx) => {
          const isThisSelected = selectedOption === option;
          const isThisCorrect = option === card.correctAnswer;
          
          return (
            <button
              key={idx}
              disabled={isSelected}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(option);
              }}
              className={`
                group relative w-full p-4 rounded-xl text-left transition-all duration-300
                ${isSelected 
                  ? isThisCorrect 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : isThisSelected 
                      ? 'bg-rose-500/10 border-rose-500/30' 
                      : 'bg-white/5 border-white/10 opacity-40'
                  : 'bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20 hover:translate-x-1'
                }
                border
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors
                  ${isSelected
                    ? isThisCorrect
                      ? 'bg-emerald-500 text-white'
                      : isThisSelected
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/10 text-white/30'
                    : 'bg-white/5 text-white/40 group-hover:bg-indigo-500/20 group-hover:text-indigo-400'
                  }
                `}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className={`text-sm font-medium ${isSelected && !isThisCorrect && !isThisSelected ? 'text-white/30' : 'text-white/90'}`}>
                  {option}
                </span>
                
                {isSelected && isThisCorrect && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-emerald-500">
                    <Check className="w-5 h-5" />
                  </motion.div>
                )}
                {isSelected && isThisSelected && !isThisCorrect && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-rose-500">
                    <X className="w-5 h-5" />
                  </motion.div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic flex items-center gap-2">
            Selection Haptics Active
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
    </div>
  );
}
