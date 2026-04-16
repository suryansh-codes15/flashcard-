'use client';
import { motion } from 'framer-motion';
import type { Flashcard } from '@/types';

interface Props { card: Flashcard; side: 'front' | 'back'; }

export default function ConceptGlow({ card, side }: Props) {
  const text = side === 'front' ? card.front : card.back;
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col justify-between p-8"
      style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #13104a 50%, #1a0d3a 100%)' }}>
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      <div className="relative flex items-center gap-3">
        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
          style={{ background: 'rgba(99,102,241,0.25)', color: '#a5bbfd', border: '1px solid rgba(99,102,241,0.4)' }}>
          {card.type.replace('_', ' ')}
        </span>
        <div className="flex gap-1 ml-auto">
          {[1,2,3,4,5].map(d => (
            <div key={d} className="w-2 h-2 rounded-full"
              style={{ background: d <= card.difficulty ? '#6366f1' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
      </div>

      <motion.div className="relative flex-1 flex items-center justify-center py-6"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <p className={`text-center leading-relaxed font-semibold ${text.length > 120 ? 'text-lg' : 'text-2xl'}`}
          style={{ color: '#f1f5f9' }}>
          {text}
        </p>
      </motion.div>

      <div className="relative flex items-center justify-center">
        <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)' }} />
        <span className="px-3 text-xs" style={{ color: '#6366f1' }}>
          {side === 'front' ? '✦ Tap to reveal ✦' : '✦ FlashForge ✦'}
        </span>
        <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)' }} />
      </div>
    </div>
  );
}
