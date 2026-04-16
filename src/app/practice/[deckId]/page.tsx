'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, RotateCcw, Eye, EyeOff, Sparkles,
  CheckCircle, AlertCircle, XCircle, BookOpen, X, TrendingUp
} from 'lucide-react';
import { useFlashcardStore } from '@/store/flashcard-store';
import FlashcardWrapper from '@/components/FlashcardWrapper';
import SessionSummary from '@/components/practice/SessionSummary';
import type { Flashcard, DifficultyLevel, ColorPalette, TutorAction } from '@/types';

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
  const [isThinkTime, setIsThinkTime] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorContent, setTutorContent] = useState<{ action: string, text: string } | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'warning' | 'error', text: string } | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({ easy: 0, medium: 0, hard: 0, correctMCQ: 0 });
  const [sessionDone, setSessionDone] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  const currentCard = cards[idx];
  const progress = cards.length > 0 ? (idx / cards.length) * 100 : 0;
  const currentPalette: ColorPalette = currentCard?.colorPalette || 'indigo_violet';
  const paletteConfig = PALETTE_BACKGROUNDS[currentPalette];

  const handleRate = useCallback((rating: DifficultyLevel) => {
    if (!currentCard) return;
    rateCard(currentCard.id, rating);
    setSessionStats((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));
    
    // Auto-trigger misunderstanding analysis for 'hard' (Again)
    if (rating === 'hard') {
      handleTutorAction('misunderstanding');
    }

    // Emotional Feedback System
    const feedbackMap = {
      easy: { type: 'success', text: 'Nice! You’re getting this 👍' },
      medium: { type: 'warning', text: 'Good effort, keep going 💪' },
      hard: { type: 'error', text: 'Let’s revisit this 🔁' }
    };
    // @ts-ignore
    setFeedback(feedbackMap[rating]);
    
    setIsFlipped(false);
    setIsThinkTime(false);
    setShowSource(false);
    setTutorContent(null);
    setSelectedOption(null);

    setTimeout(() => {
      setFeedback(null);
      if (idx + 1 >= cards.length) {
        setSessionDone(true);
        generateSessionSummary();
      } else {
        setIdx((i) => i + 1);
      }
    }, 1000);
  }, [currentCard, idx, cards.length, rateCard]);

  const handleSelectOption = (option: string) => {
    if (selectedOption || !currentCard) return;
    setSelectedOption(option);
    const isCorrect = option === currentCard.correctAnswer;
    
    if (isCorrect) {
      setSessionStats(prev => ({ ...prev, correctMCQ: prev.correctMCQ + 1 }));
      setFeedback({ type: 'success', text: 'Spot on! Correct! ✅' });
    } else {
      setFeedback({ type: 'error', text: 'Not quite. See why below. ⚠️' });
    }

    // Auto flip to reveal explanation after a short delay
    setTimeout(() => {
      setFeedback(null);
      setIsFlipped(true);
    }, 1200);
  };

  const handleFlip = () => {
    if (isFlipped) {
      setIsFlipped(false);
      return;
    }

    // Entering Think Time
    setIsThinkTime(true);
    // Auto-reveal after 1.8s, or if clicked again
    const timer = setTimeout(() => {
      setIsFlipped(true);
      setIsThinkTime(false);
    }, 1800);

    return () => clearTimeout(timer);
  };

  const generateSessionSummary = async () => {
    if (!deck) return;
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats: sessionStats, deckName: deck.name }),
      });
      const data = await res.json();
      setAiNote(data.aiNote);
    } catch {
      setAiNote('You have a solid foundation. Focus on the core relationships between these concepts in your next session.');
    }
  };

  const handleTutorAction = async (action: TutorAction) => {
    if (!currentCard || tutorLoading) return;
    setTutorLoading(true);
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          front: currentCard.front, 
          back: currentCard.back, 
          context: currentCard.sourceContext 
        }),
      });
      const data = await res.json();
      setTutorContent({ action, text: data.result || 'Failed to get tutor feedback.' });
    } catch {
      setTutorContent({ action, text: 'The AI tutor is resting. Try again in a moment.' });
    } finally {
      setTutorLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') { 
        e.preventDefault(); 
        if (!isFlipped && !isThinkTime) handleFlip();
        else { setIsThinkTime(false); setIsFlipped(true); }
      }
      if (e.key === '1') handleRate('hard');
      if (e.key === '2') handleRate('medium');
      if (e.key === '3') handleRate('easy');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRate, isFlipped, isThinkTime]);

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
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4" style={{ background: '#09090b' }}>
        <AnimatePresence>
          <AmbientBackground palette="indigo_violet" />
        </AnimatePresence>
        
        <SessionSummary 
          stats={sessionStats}
          totalCards={cards.length || sessionStats.easy + sessionStats.medium + sessionStats.hard}
          deckName={deck.name}
          aiNote={aiNote}
          onReset={() => {
            setIdx(0); 
            setSessionDone(false); 
            setSessionStats({ easy: 0, medium: 0, hard: 0, correctMCQ: 0 }); 
            setInitialized(false); 
            setSelectedOption(null);
            setAiNote(null);
          }}
        />
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

        {/* Feedback Overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none"
            >
              <div className="px-10 py-5 rounded-3xl backdrop-blur-3xl border border-white/20 shadow-2xl" 
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                <span className="text-3xl font-black text-white drop-shadow-lg">{feedback.text}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card — Modern Wrapper with Level-Aware Templates */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <FlashcardWrapper 
              key={currentCard.id}
              card={currentCard}
              side={isFlipped ? 'back' : 'front'}
              selectedOption={selectedOption}
              onSelect={handleSelectOption}
            />
          </AnimatePresence>

          {/* Thinking Overlay (Specific to non-MCQ cards) */}
          <AnimatePresence>
            {isThinkTime && currentCard.type !== 'mcq' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-3xl bg-black/60 rounded-[2.5rem]"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                  <span className="text-sm font-black tracking-[0.2em] uppercase text-white">Synthesizing...</span>
                </motion.div>
                <span className="absolute bottom-10 text-[10px] font-black tracking-widest uppercase text-white/30">Release to reveal truth</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Deep Dive Insights (Visible after flip) */}
        <AnimatePresence>
          {isFlipped && (currentCard.insight || currentCard.mistake) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {currentCard.insight && (
                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                  <div className="flex items-center gap-2 mb-2 text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Deep Insight</span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">{currentCard.insight}</p>
                </div>
              )}
              {currentCard.mistake && (
                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                  <div className="flex items-center gap-2 mb-2 text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Common Mistake</span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">{currentCard.mistake}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rating buttons */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-8 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Hard', rating: 'hard' as DifficultyLevel, icon: XCircle, color: '#f87171', border: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.07)', next: 'Repeat' },
                  { label: 'Medium', rating: 'medium' as DifficultyLevel, icon: AlertCircle, color: '#fbbf24', border: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.07)', next: `Next: +${currentCard?.interval || 1}d` },
                  { label: 'Easy', rating: 'easy' as DifficultyLevel, icon: CheckCircle, color: '#34d399', border: 'rgba(16,185,129,0.3)', bg: 'rgba(16,185,129,0.07)', next: `Next: +${Math.round((currentCard?.interval || 1) * (currentCard?.easeFactor || 2.5))}d` },
                ].map(({ label, rating, icon: Icon, color, border, bg, next }) => (
                  <motion.button key={label}
                    whileHover={{ y: -3, scale: 1.02, boxShadow: `0 10px 30px -10px ${border}` }} 
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleRate(rating)}
                    className="flex flex-col items-center gap-1.5 py-4 rounded-2xl border transition-all"
                    style={{ borderColor: border, background: bg }}>
                    <Icon className="w-6 h-6" style={{ color }} />
                    <span className="text-sm font-bold" style={{ color }}>{label}</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-tighter">{next}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Helper buttons (AI Tutor) */}
        {isFlipped && (
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <button 
              onClick={() => handleTutorAction('simpler')} 
              disabled={tutorLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 bg-white/5 border border-white/10 hover:bg-white/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Explain Simpler
            </button>
            <button 
              onClick={() => handleTutorAction('example')} 
              disabled={tutorLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 bg-white/5 border border-white/10 hover:bg-white/10"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              Another Example
            </button>
            <button 
              onClick={() => handleTutorAction('harder')} 
              disabled={tutorLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 group"
            >
              <TrendingUp className="w-3.5 h-3.5 group-hover:translate-y-[-1px] transition-transform" />
              Level Up
            </button>
            {currentCard.sourceContext && (
              <button onClick={() => setShowSource(v => !v)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white/40 hover:text-white/70 transition-colors bg-white/5 border border-white/5">
                {showSource ? 'Hide source' : 'See Context'}
              </button>
            )}
          </div>
        )}

        {/* Tutor Response Panel */}
        <AnimatePresence>
          {tutorContent && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 10 }}
              className="mt-6 p-6 rounded-3xl relative overflow-hidden" 
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/40" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
                    {tutorContent.action === 'simpler' ? 'Simpler Explanation' : 
                     tutorContent.action === 'example' ? 'Practical Example' : 
                     tutorContent.action === 'harder' ? 'Mastery Challenge' : 
                     tutorContent.action === 'misunderstanding' ? 'AI Misconception Analysis' : 'Core Importance'}
                  </span>
                </div>
                <button onClick={() => setTutorContent(null)}><X className="w-4 h-4 text-white/20 hover:text-white" /></button>
              </div>
              <p className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap">{tutorContent.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Source panel */}
        <AnimatePresence>
          {showSource && currentCard.sourceContext && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-xs leading-relaxed italic text-white/30">"{currentCard.sourceContext}"</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
