'use client';
import { motion } from 'framer-motion';
import type { Flashcard } from '@/types';

interface Props { card: Flashcard; side: 'front' | 'back'; }

export default function WarningEdge({ card, side }: Props) {
  const text = side === 'front' ? card.front : card.back;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col p-7"
      style={{ background: 'linear-gradient(145deg, #1a0508 0%, #2d0a0f 50%, #1a040a 100%)' }}>
      {/* Warning glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full opacity-10"
          style={{ background: 'radial-gradient(ellipse at 80% 20%, #ef4444 0%, transparent 60%)' }} />
      </div>

      {/* Warning header */}
      <div className="relative flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
          style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
          ⚠️
        </div>
        <div>
          <p className="text-xs font-black tracking-widest uppercase" style={{ color: '#f87171' }}>
            Edge Case / Exception
          </p>
          <p className="text-xs" style={{ color: 'rgba(248,113,113,0.5)' }}>Common mistake zone</p>
        </div>
        <div className="ml-auto flex gap-1">
          {[1,2,3,4,5].map(d => (
            <div key={d} className="w-1.5 h-1.5 rounded-full"
              style={{ background: d <= card.difficulty ? '#ef4444' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
      </div>

      <motion.div className="relative flex-1 flex items-center"
        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <p className={`leading-relaxed ${text.length > 150 ? 'text-base' : 'text-xl font-semibold'}`}
          style={{ color: '#fef2f2' }}>
          {text}
        </p>
      </motion.div>

      <div className="relative mt-4 flex items-center gap-2">
        <div className="flex-1 h-px" style={{ background: 'rgba(239,68,68,0.2)' }} />
        <span className="text-xs" style={{ color: 'rgba(248,113,113,0.4)' }}>
          {side === 'front' ? 'Tap to reveal the exception →' : '⚠ Remember this edge case'}
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(239,68,68,0.2)' }} />
      </div>
    </div>
  );
}
