'use client';
import { motion } from 'framer-motion';
import type { Flashcard } from '@/types';

interface Props { card: Flashcard; side: 'front' | 'back'; }

export default function FormulaDark({ card, side }: Props) {
  const text = side === 'front' ? card.front : card.back;
  const lines = text.split('\n').filter(l => l.trim());

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col p-6"
      style={{ background: '#0d1117' }}>
      {/* Top bar like an IDE */}
      <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500 opacity-70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-70" />
          <div className="w-3 h-3 rounded-full bg-green-500 opacity-70" />
        </div>
        <span className="text-xs ml-2 font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {card.type}.md — FlashForge
        </span>
        <span className="ml-auto px-2 py-0.5 rounded text-xs font-mono"
          style={{ background: 'rgba(6,182,212,0.15)', color: '#67e8f9' }}>
          {card.type}
        </span>
      </div>

      <motion.div className="flex-1 overflow-auto font-mono"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        {lines.map((line, i) => (
          <motion.div key={i} className="flex gap-3 mb-2"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <span className="w-6 text-right flex-shrink-0 text-xs select-none" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed" style={{ color: line.trim().startsWith('#') ? '#79c0ff' : line.includes('=') ? '#ffa657' : '#e6edf3' }}>
              {line}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-3 pt-3 flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>UTF-8</span>
        <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {side === 'front' ? '▶ Tap to solve' : '✓ Solution'}
        </span>
      </div>
    </div>
  );
}
