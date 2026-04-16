'use client';
import { motion } from 'framer-motion';
import type { Flashcard } from '@/types';

interface Props { card: Flashcard; side: 'front' | 'back'; }

export default function ScenarioStory({ card, side }: Props) {
  const text = side === 'front' ? card.front : card.back;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col p-7"
      style={{ background: 'linear-gradient(150deg, #1a0f00 0%, #2d1b00 50%, #1a0f00 100%)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-10"
          style={{ background: 'linear-gradient(0deg, #f97316 0%, transparent 100%)' }} />
      </div>

      {/* Scene setter */}
      <div className="relative flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.3)' }}>
          📖
        </div>
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#fbbf24' }}>
          {card.type === 'example' ? 'Real World Example' : 'Case Study'}
        </span>
      </div>

      <motion.div className="relative flex-1 flex items-center"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className={`leading-relaxed ${text.length > 150 ? 'text-base' : 'text-xl font-semibold'}`}
          style={{ color: '#fef3c7' }}>
          {text}
        </p>
      </motion.div>

      <div className="relative mt-4 pt-3" style={{ borderTop: '1px solid rgba(245,158,11,0.15)' }}>
        <p className="text-xs" style={{ color: 'rgba(251,191,36,0.4)' }}>
          {side === 'front' ? '💡 Tap to see the answer' : `📌 ${card.sourceContext?.substring(0, 60) || 'Source context'}`}
        </p>
      </div>
    </div>
  );
}
