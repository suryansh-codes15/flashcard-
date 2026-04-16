'use client';
import { motion } from 'framer-motion';
import type { Flashcard } from '@/types';

interface Props { card: Flashcard; side: 'front' | 'back'; }

export default function MinimalDark({ card, side }: Props) {
  const text = side === 'front' ? card.front : card.back;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col justify-between p-8"
      style={{ background: '#09090b' }}>
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-1 rounded-md text-xs font-mono"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {card.type.replace('_', ' ')}
        </span>
        <div className="flex gap-1">
          {[1,2,3,4,5].map(d => (
            <div key={d} className="w-1.5 h-1.5 rounded-full"
              style={{ background: d <= card.difficulty ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
      </div>

      <motion.div className="flex-1 flex items-center justify-center py-8"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <p className={`text-center leading-relaxed font-medium ${text.length > 150 ? 'text-base' : text.length > 80 ? 'text-xl' : 'text-2xl'}`}
          style={{ color: side === 'front' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.75)' }}>
          {text}
        </p>
      </motion.div>

      <div className="flex items-center justify-between">
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="px-4 text-xs font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {side === 'front' ? '→' : '✓'}
        </span>
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>
    </div>
  );
}
