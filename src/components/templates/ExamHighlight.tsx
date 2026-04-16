'use client';
import { motion } from 'framer-motion';
import type { Flashcard } from '@/types';

interface Props { card: Flashcard; side: 'front' | 'back'; }

export default function ExamHighlight({ card, side }: Props) {
  const text = side === 'front' ? card.front : card.back;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col p-7"
      style={{ background: 'linear-gradient(145deg, #1a1200 0%, #291c00 50%, #1a1200 100%)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-full opacity-10"
          style={{ background: 'radial-gradient(ellipse at 50% 20%, #fbbf24 0%, transparent 60%)' }} />
      </div>

      {/* High-yield badge */}
      <div className="relative flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)' }}>
          <span className="text-sm">⭐</span>
          <span className="text-xs font-black tracking-widest uppercase" style={{ color: '#fbbf24' }}>
            HIGH YIELD
          </span>
        </div>
        <div className="ml-auto flex gap-1">
          {[1,2,3,4,5].map(d => (
            <div key={d} className="w-2 h-2 rounded-full"
              style={{ background: d <= card.difficulty ? '#f59e0b' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
      </div>

      <motion.div className="relative flex-1 flex items-center justify-center"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center">
          {/* Yellow marker highlight effect on back */}
          {side === 'back' ? (
            <p className="text-xl font-bold leading-relaxed px-2 py-1 rounded"
              style={{ color: '#1a1200', background: '#fbbf24', display: 'inline', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}>
              {text}
            </p>
          ) : (
            <p className={`leading-relaxed font-semibold ${text.length > 120 ? 'text-lg' : 'text-2xl'}`}
              style={{ color: '#fef3c7' }}>
              {text}
            </p>
          )}
        </div>
      </motion.div>

      <div className="relative mt-5 flex items-center justify-center gap-2">
        <div className="h-px flex-1" style={{ background: 'rgba(251,191,36,0.2)' }} />
        <span className="text-xs px-2" style={{ color: 'rgba(251,191,36,0.5)' }}>
          {side === 'front' ? '★ Exam Essential — Tap to reveal' : '★ Memorize this'}
        </span>
        <div className="h-px flex-1" style={{ background: 'rgba(251,191,36,0.2)' }} />
      </div>
    </div>
  );
}
