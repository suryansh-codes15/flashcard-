'use client';
import { motion } from 'framer-motion';
import type { Flashcard } from '@/types';

interface Props { card: Flashcard; side: 'front' | 'back'; }

export default function ComparisonSplit({ card, side }: Props) {
  const text = side === 'front' ? card.front : card.back;
  // Try to split on vs/versus/compared to/vs.
  const splitParts = text.split(/\s+vs\.?\s+|\s+versus\s+/i);
  const isSplit = splitParts.length === 2 && side === 'back';

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col p-6"
      style={{ background: 'linear-gradient(135deg, #050d1f 0%, #0a1628 100%)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-full opacity-15"
          style={{ background: 'linear-gradient(180deg, #06b6d4 0%, transparent 100%)' }} />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-15"
          style={{ background: 'linear-gradient(180deg, #8b5cf6 0%, transparent 100%)' }} />
        <div className="absolute inset-y-0 left-1/2 w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
      </div>

      <div className="relative flex items-center gap-2 mb-4">
        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
          style={{ background: 'rgba(6,182,212,0.2)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.3)' }}>
          {card.type.replace('_', ' ')}
        </span>
      </div>

      {isSplit ? (
        <div className="relative flex-1 grid grid-cols-2 gap-4">
          {splitParts.map((part, i) => (
            <motion.div key={i} className="flex flex-col items-center justify-center p-4 rounded-xl text-center"
              initial={{ opacity: 0, x: i === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
              style={{ background: i === 0 ? 'rgba(6,182,212,0.1)' : 'rgba(139,92,246,0.1)', border: `1px solid ${i === 0 ? 'rgba(6,182,212,0.25)' : 'rgba(139,92,246,0.25)'}` }}>
              <p className="text-sm font-medium" style={{ color: i === 0 ? '#67e8f9' : '#c4b5fd' }}>{part.trim()}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div className="relative flex-1 flex items-center justify-center"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className={`text-center leading-relaxed font-semibold ${text.length > 120 ? 'text-base' : 'text-xl'}`}
            style={{ color: '#f1f5f9' }}>
            {text}
          </p>
        </motion.div>
      )}

      <div className="relative mt-4 text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {side === 'front' ? 'Tap to compare →' : '↔ Comparison'}
      </div>
    </div>
  );
}
