'use client';
import { motion } from 'framer-motion';
import type { Flashcard } from '@/types';

interface Props { card: Flashcard; side: 'front' | 'back'; }

export default function TimelineSteps({ card, side }: Props) {
  const text = side === 'front' ? card.front : card.back;
  // Parse numbered or bullet steps from back content
  const lines = text.split(/\n/).filter(l => l.trim());
  const isStepList = lines.length > 2 && side === 'back';

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col p-7"
      style={{ background: 'linear-gradient(160deg, #071422 0%, #0d2137 60%, #071422 100%)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-8 top-0 bottom-0 w-px opacity-20"
          style={{ background: 'linear-gradient(180deg, transparent, #10b981 30%, #10b981 70%, transparent)' }} />
      </div>

      <div className="relative flex items-center gap-2 mb-5">
        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
          style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}>
          {card.type.replace('_', ' ')}
        </span>
      </div>

      {isStepList ? (
        <div className="relative flex-1 overflow-auto space-y-3">
          {lines.map((line, i) => (
            <motion.div key={i} className="flex items-start gap-4"
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
              <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.4)' }}>
                {i + 1}
              </div>
              <p className="text-sm leading-relaxed pt-1" style={{ color: '#e2e8f0' }}>
                {line.replace(/^\d+[\.\)]\s*/, '').replace(/^[-•*]\s*/, '')}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div className="relative flex-1 flex items-center justify-center"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className={`text-center leading-relaxed font-semibold ${text.length > 120 ? 'text-lg' : 'text-2xl'}`}
            style={{ color: '#f1f5f9' }}>
            {text}
          </p>
        </motion.div>
      )}

      <div className="relative mt-4 text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {side === 'front' ? 'Tap for steps →' : `${lines.length} steps`}
      </div>
    </div>
  );
}
