'use client';
import { motion } from 'framer-motion';
import type { Flashcard } from '@/types';

interface Props { card: Flashcard; side: 'front' | 'back'; }

export default function QuoteHero({ card, side }: Props) {
  const text = side === 'front' ? card.front : card.back;
  const isShort = text.length < 80;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col justify-center items-center p-10"
      style={{ background: 'linear-gradient(145deg, #1a0a2e 0%, #0f0720 100%)' }}>
      {/* Decorative quotation mark */}
      <div className="absolute top-4 left-6 text-7xl font-serif leading-none pointer-events-none select-none"
        style={{ color: 'rgba(139,92,246,0.15)', fontFamily: 'Georgia, serif' }}>"</div>
      <div className="absolute bottom-4 right-6 text-7xl font-serif leading-none pointer-events-none select-none rotate-180"
        style={{ color: 'rgba(139,92,246,0.15)', fontFamily: 'Georgia, serif' }}>"</div>

      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />

      <motion.p
        className={`relative text-center font-bold leading-tight z-10 ${isShort ? 'text-3xl' : 'text-xl'}`}
        style={{ color: '#f8fafc', fontFamily: side === 'front' ? 'inherit' : 'Georgia, serif', letterSpacing: isShort ? '-0.02em' : 'normal' }}
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
        {text}
      </motion.p>

      {side === 'back' && card.sourceContext && (
        <motion.p className="mt-6 text-xs text-center max-w-xs" style={{ color: 'rgba(167,139,250,0.6)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          — {card.sourceContext.substring(0, 80)}
        </motion.p>
      )}

      <div className="absolute bottom-5 w-full text-center text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
        {side === 'front' ? 'Tap to reveal →' : '✦'}
      </div>
    </div>
  );
}
