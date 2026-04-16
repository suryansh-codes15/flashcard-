'use client';
import { motion } from 'framer-motion';
import type { Flashcard } from '@/types';

interface Props { card: Flashcard; side: 'front' | 'back'; }

export default function Checklist({ card, side }: Props) {
  const text = side === 'front' ? card.front : card.back;
  const lines = text.split('\n').filter(l => l.trim());
  const isChecklist = lines.length > 2 && side === 'back';

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col p-7"
      style={{ background: 'linear-gradient(145deg, #051a10 0%, #062b18 50%, #051a10 100%)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-2/3 h-2/3 opacity-15"
          style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div className="relative flex items-center gap-2 mb-5">
        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
          style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}>
          {card.type.replace('_', ' ')}
        </span>
      </div>

      {isChecklist ? (
        <div className="relative flex-1 overflow-auto space-y-2.5">
          {lines.map((line, i) => (
            <motion.div key={i} className="flex items-start gap-3"
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              <div className="flex-shrink-0 w-5 h-5 rounded mt-0.5 flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.25)', border: '1px solid rgba(16,185,129,0.5)' }}>
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#d1fae5' }}>
                {line.replace(/^\d+[\.\)]\s*/, '').replace(/^[-•*✓✔]\s*/, '')}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div className="relative flex-1 flex items-center justify-center"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className={`text-center leading-relaxed font-semibold ${text.length > 120 ? 'text-lg' : 'text-2xl'}`}
            style={{ color: '#f0fdf4' }}>
            {text}
          </p>
        </motion.div>
      )}

      <div className="relative mt-4 text-center text-xs" style={{ color: 'rgba(110,231,183,0.4)' }}>
        {side === 'front' ? 'Tap to see the checklist →' : `${lines.length} criteria`}
      </div>
    </div>
  );
}
