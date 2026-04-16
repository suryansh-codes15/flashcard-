'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, RotateCcw, Eye, EyeOff, Sparkles,
  CheckCircle, AlertCircle, XCircle, BookOpen, X
} from 'lucide-react';
import { useFlashcardStore } from '@/store/flashcard-store';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import type { Flashcard, DifficultyLevel, ColorPalette } from '@/types';

// Ambient background configs per palette
const PALETTE_BACKGROUNDS: Record<ColorPalette, { bg: string; orb1: string; orb2: string; accent: string }> = {
  indigo_violet: {
    bg: 'radial-gradient(ellipse at 30% 20%, #1e1b4b 0%, #0f0718 50%, #090012 100%)',
    orb1: '#6366f1', orb2: '#8b5cf6', accent: '#6366f1',
  },
  emerald_teal: {
    bg: 'radial-gradient(ellipse at 70% 30%, #022c22 0%, #041a12 50%, #030f09 100%)',
    orb1: '#10b981', orb2: '#14b8a6', accent: '#10b981',
  },
  rose_crimson: {
    bg: 'radial-gradient(ellipse at 20% 80%, #2d0a0f 0%, #1a040a 50%, #0f0305 100%)',
    orb1: '#f43f5e', orb2: '#ef4444', accent: '#f43f5e',
  },
  amber_orange: {
    bg: 'radial-gradient(ellipse at 80% 20%, #2d1800 0%, #1a0e00 50%, #0f0800 100%)',
    orb1: '#f59e0b', orb2: '#f97316', accent: '#f59e0b',
  },
  cyan_blue: {
    bg: 'radial-gradient(ellipse at 50% 10%, #0c1a2e 0%, #050d1f 50%, #020810 100%)',
    orb1: '#06b6d4', orb2: '#3b82f6', accent: '#06b6d4',
  },
  slate_mono: {
    bg: 'radial-gradient(ellipse at 50% 50%, #1e293b 0%, #0f172a 50%, #020617 100%)',
    orb1: '#64748b', orb2: '#475569', accent: '#94a3b8',
  },
};

function AmbientBackground({ palette }: { palette: ColorPalette }) {
  const config = PALETTE_BACKGROUNDS[palette] || PALETTE_BACKGROUNDS.indigo_violet;
  return (
    <motion.div
      key={palette}
      className="fixed inset-0 pointer-events-none z-0"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      style={{ background: config.bg }}>
      {/* Drifting orb 1 */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{ background: `radial-gradient(circle, ${config.orb1}22 0%, transparent 70%)`, filter: 'blur(60px)', top: '-15%', left: '-10%' }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
      {/* Drifting orb 2 */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{ background: `radial-gradient(circle, ${config.orb2}18 0%, transparent 70%)`, filter: 'blur(80px)', bottom: '-20%', right: '-15%' }}
        animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />
      {/* Mesh grid subtle overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: `linear-gradient(${config.accent}50 1px, transparent 1px), linear-gradient(90deg, ${config.accent}50 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
      {/* Noise */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
    </motion.div>
  );
}

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;
  const { getDeck, getCardsForReview, rateCard } = useFlashcardStore();

  const deck = getDeck(deckId);
  const allCards = getCardsForReview(deckId);

  const [sessionQueue, setSessionQueue] = useState<Flashcard[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (allCards.length > 0 && !initialized) {
      setSessionQueue(allCards);
      setInitialized(true);
    }
  }, [allCards, initialized]);

  const cards = initialized ? sessionQueue : allCards;

  const [idx, setIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [simplifying, setSimplifying] = useState(false);
  const [simpleText, setSimpleText] = useState('');
  const [sessionStats, setSessionStats] = useState({ easy: 0, medium: 0, hard: 0 });
  const [sessionDone, setSessionDone] = useState(false);

  const currentCard = cards[idx];
  const progress = cards.length > 0 ? (idx / cards.length) * 100 : 0;
  const currentPalette: ColorPalette = currentCard?.colorPalette || 'indigo_violet';
  const paletteConfig = PALETTE_BACKGROUNDS[currentPalette];

  const handleRate = useCallback((rating: DifficultyLevel) => {
    if (!currentCard) return;
    rateCard(currentCard.id, rating);
    setSessionStats((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));
    setIsFlipped(false);
    setShowSource(false);
    setSimpleText('');

    setTimeout(() => {
      if (idx + 1 >= cards.length) {
        setSessionDone(true);
      } else {
        setIdx((i) => i + 1);
      }
    }, 300);
  }, [currentCard, idx, cards.length, rateCard]);

  const handleExplainSimpler = async () => {
    if (!currentCard || simplifying) return;
    setSimplifying(true);
    try {
      const res = await fetch('/api/explain-simpler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentCard.back }),
      });
      const data = await res.json();
      setSimpleText(data.explanation || currentCard.back);
    } catch {
      setSimpleText(currentCard.back);
    } finally {
      setSimplifying(false);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setIsFlipped((v) => !v); }
      if (e.key === '1') handleRate('hard');
      if (e.key === '2') handleRate('medium');
      if (e.key === '3') handleRate('easy');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRate]);

  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b' }}>
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="text-xl font-bold mb-2 text-white">Deck not found</h2>
          <button onClick={() => router.push('/dashboard')} className="btn-brand mt-4">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  if (cards.length === 0 || sessionDone) {
    const total = sessionStats.easy + sessionStats.medium + sessionStats.hard;
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4" style={{ background: '#09090b' }}>
        <AnimatePresence>
          <AmbientBackground palette="indigo_violet" />
        </AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 rounded-3xl p-10 text-center max-w-md w-full"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="text-6xl mb-4">{total > 0 ? '🎉' : '✨'}</div>
          <h2 className="text-2xl font-bold mb-2 text-white">{total > 0 ? 'Session Complete!' : 'All caught up!'}</h2>
          <p className="mb-6 text-white/50">{total > 0 ? `You reviewed ${total} cards.` : 'No cards are due for review.'}</p>
          {total > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Hard', val: sessionStats.hard, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                { label: 'Medium', val: sessionStats.medium, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                { label: 'Easy', val: sessionStats.easy, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
              ].map(({ label, val, color, bg }) => (
                <div key={label} className="p-3 rounded-2xl" style={{ background: bg }}>
                  <div className="text-2xl font-bold" style={{ color }}>{val}</div>
                  <div className="text-xs text-white/40 mt-1">{label}</div>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-3">
            <button onClick={() => { setIdx(0); setSessionDone(false); setSessionStats({ easy: 0, medium: 0, hard: 0 }); setInitialized(false); }} className="btn-brand">
              <RotateCcw className="w-4 h-4" /> Study Again
            </button>
            <button onClick={() => router.push('/dashboard')} className="btn-secondary">Back to Dashboard</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Dynamic ambient background - cross-fades with each card */}
      <AnimatePresence mode="sync">
        <AmbientBackground key={currentPalette} palette={currentPalette} />
      </AnimatePresence>

      <div className="relative z-10 max-w-2xl mx-auto pt-20 pb-16 px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>{deck.name}</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/40">{idx + 1} / {cards.length}</span>
            <div className="flex gap-1.5">
              <span className="text-xs font-semibold text-emerald-400">{sessionStats.easy}✓</span>
              <span className="text-xs font-semibold text-amber-400">{sessionStats.medium}~</span>
              <span className="text-xs font-semibold text-red-400">{sessionStats.hard}✗</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full mb-6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div className="h-full rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.5 }}
            style={{ background: `linear-gradient(90deg, ${paletteConfig.orb1}, ${paletteConfig.orb2})` }} />
        </div>

        {/* Card — 3D flip with template switching */}
        <div style={{ perspective: '1400px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentCard.id}-outer`}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}>
              <div
                className="relative cursor-pointer select-none"
                style={{ height: '360px', transformStyle: 'preserve-3d', transition: 'transform 0.6s cubic-bezier(0.4,0.2,0.2,1)', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                onClick={() => setIsFlipped(v => !v)}>
                {/* Front */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                  <TemplateRenderer card={currentCard} side="front" />
                </div>
                {/* Back */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <TemplateRenderer card={currentCard} side="back" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Template badge */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full font-mono"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {currentCard.templateKey?.replace('_', ' ') || 'concept glow'}
          </span>
          {!isFlipped && (
            <span className="text-xs text-white/30">Space / Click to flip</span>
          )}
        </div>

        {/* Rating buttons */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-5 space-y-3">
              <p className="text-xs text-center font-bold text-white/50 mb-3 uppercase tracking-widest">Rate to move to next card</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Hard', rating: 'hard' as DifficultyLevel, icon: XCircle, color: '#f87171', border: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.07)', next: 'Repeat ⏭️' },
                  { label: 'Medium', rating: 'medium' as DifficultyLevel, icon: AlertCircle, color: '#fbbf24', border: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.07)', next: `Next: +${currentCard?.interval || 1}d ⏭️` },
                  { label: 'Easy', rating: 'easy' as DifficultyLevel, icon: CheckCircle, color: '#34d399', border: 'rgba(16,185,129,0.3)', bg: 'rgba(16,185,129,0.07)', next: `Next: +${Math.round((currentCard?.interval || 1) * (currentCard?.easeFactor || 2.5))}d ⏭️` },
                ].map(({ label, rating, icon: Icon, color, border, bg, next }) => (
                  <motion.button key={label}
                    whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleRate(rating)}
                    className="flex flex-col items-center gap-1.5 py-4 rounded-2xl border transition-all"
                    style={{ borderColor: border, background: bg }}>
                    <Icon className="w-6 h-6" style={{ color }} />
                    <span className="text-sm font-bold" style={{ color }}>{label}</span>
                    <span className="text-xs text-white/30">{next}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Helper buttons */}
        {isFlipped && (
          <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
            {currentCard.sourceContext && (
              <button onClick={() => setShowSource(v => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <BookOpen className="w-4 h-4" />
                {showSource ? 'Hide source' : 'Show source'}
              </button>
            )}
            <button onClick={handleExplainSimpler} disabled={simplifying}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-40"
              style={{ background: `${paletteConfig.orb1}18`, color: paletteConfig.orb1, border: `1px solid ${paletteConfig.orb1}30` }}>
              <Sparkles className="w-4 h-4" />
              {simplifying ? 'Simplifying...' : 'Explain simpler'}
            </button>
          </div>
        )}

        {/* Source panel */}
        <AnimatePresence>
          {showSource && currentCard.sourceContext && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold tracking-widest uppercase text-white/30">Source</span>
                <button onClick={() => setShowSource(false)}><X className="w-3.5 h-3.5 text-white/30" /></button>
              </div>
              <p className="text-sm leading-relaxed italic text-white/50">"{currentCard.sourceContext}"</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simpler explanation panel */}
        <AnimatePresence>
          {simpleText && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 rounded-2xl"
              style={{ background: `${paletteConfig.orb1}10`, border: `1px solid ${paletteConfig.orb1}25` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: paletteConfig.orb1 }} />
                  <span className="text-xs font-semibold" style={{ color: paletteConfig.orb1 }}>Simpler explanation</span>
                </div>
                <button onClick={() => setSimpleText('')}><X className="w-3.5 h-3.5 text-white/30" /></button>
              </div>
              <p className="text-sm leading-relaxed text-white/60">{simpleText}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
