'use client';
import { motion } from 'framer-motion';
import type { Flashcard } from '@/types';

interface Props { card: Flashcard; side: 'front' | 'back'; }

export default function MindMap({ card, side }: Props) {
  const text = side === 'front' ? card.front : card.back;
  const lines = text.split('\n').filter(l => l.trim());
  const [central, ...branches] = lines;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col p-6"
      style={{ background: 'linear-gradient(145deg, #0f0a1e 0%, #180d2e 100%)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, #a78bfa 0%, transparent 65%)' }} />
      </div>

      <div className="relative flex items-center gap-2 mb-4">
        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
          style={{ background: 'rgba(167,139,250,0.2)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.3)' }}>
          {card.type.replace('_', ' ')}
        </span>
      </div>

      {side === 'back' && branches.length > 0 ? (
        <div className="relative flex-1 flex flex-col items-center justify-center gap-3">
          {/* Central node */}
          <motion.div className="px-5 py-2.5 rounded-2xl text-sm font-bold text-center"
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ background: 'rgba(139,92,246,0.3)', border: '2px solid rgba(139,92,246,0.6)', color: '#e9d5ff' }}>
            {central}
          </motion.div>
          {/* Branch nodes */}
          <div className="w-px h-2" style={{ background: 'rgba(167,139,250,0.4)' }} />
          <div className="grid grid-cols-2 gap-2 w-full">
            {branches.slice(0, 6).map((b, i) => (
              <motion.div key={i} className="px-3 py-2 rounded-xl text-xs text-center"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#ddd6fe' }}>
                {b.replace(/^[-•*]\s*/, '')}
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div className="relative flex-1 flex items-center justify-center"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className={`text-center leading-relaxed font-semibold ${text.length > 120 ? 'text-lg' : 'text-2xl'}`}
            style={{ color: '#f5f3ff' }}>
            {text}
          </p>
        </motion.div>
      )}

      <div className="relative mt-3 text-center text-xs" style={{ color: 'rgba(167,139,250,0.4)' }}>
        {side === 'front' ? '⬡ Tap to map connections' : '⬡ Concept map'}
      </div>
    </div>
  );
}
