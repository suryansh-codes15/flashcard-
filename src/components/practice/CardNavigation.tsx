'use client';

import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function CardNavigation({ current, total, onPrev, onNext }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only fire if no modifier keys and not focused on a button that handles ratings
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key === 'ArrowLeft')  onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onPrev, onNext]);

  const isPrevDisabled = current === 0;
  const isNextDisabled = current === total - 1;

  return (
    <div className="flex items-center justify-center gap-6 mt-4">
      <button
        onClick={onPrev}
        disabled={isPrevDisabled}
        className={`group flex items-center gap-2 px-5 py-2.5 rounded-2xl border transition-all text-sm font-bold backdrop-blur-md
          ${isPrevDisabled
            ? 'border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed'
            : 'border-purple-500/30 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400/50 active:scale-95'
          }`}
        aria-label="Previous card (←)"
      >
        <ChevronLeft className={`w-4 h-4 transition-transform ${!isPrevDisabled ? 'group-hover:-translate-x-0.5' : ''}`} />
        <span className="hidden sm:inline uppercase tracking-wider text-[10px] font-black">Prev</span>
        <kbd className="hidden sm:inline text-[9px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono opacity-60">←</kbd>
      </button>

      {/* Counter pill */}
      <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
        <span className="text-purple-300 font-black text-sm">{current + 1}</span>
        <span className="text-purple-500/60 text-xs font-bold">/</span>
        <span className="text-purple-500/60 font-bold text-sm">{total}</span>
      </div>

      <button
        onClick={onNext}
        disabled={isNextDisabled}
        className={`group flex items-center gap-2 px-5 py-2.5 rounded-2xl border transition-all text-sm font-bold backdrop-blur-md
          ${isNextDisabled
            ? 'border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed'
            : 'border-purple-500/30 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400/50 active:scale-95'
          }`}
        aria-label="Next card (→)"
      >
        <kbd className="hidden sm:inline text-[9px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono opacity-60">→</kbd>
        <span className="hidden sm:inline uppercase tracking-wider text-[10px] font-black">Next</span>
        <ChevronRight className={`w-4 h-4 transition-transform ${!isNextDisabled ? 'group-hover:translate-x-0.5' : ''}`} />
      </button>
    </div>
  );
}
