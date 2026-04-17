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
import FlashCard from '@/components/FlashCard';
import SessionSummary from '@/components/practice/SessionSummary';
import VictoryConfetti from '@/components/VictoryConfetti';
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
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentCard = cards[idx];

  // Kids Subject Detection
  const getSubject = (name: string): 'math' | 'science' | 'geography' | 'history' | 'language' => {
    const n = name.toLowerCase();
    if (n.includes('math') || n.includes('number') || n.includes('calc')) return 'math';
    if (n.includes('geo') || n.includes('map') || n.includes('world') || n.includes('city')) return 'geography';
    if (n.includes('history') || n.includes('war') || n.includes('ancient') || n.includes('king')) return 'history';
    if (n.includes('lang') || n.includes('word') || n.includes('phrase') || n.includes('speak')) return 'language';
    return 'science'; // Default subject
  };

  const subject = deck ? getSubject(deck.name) : 'science';
  const progress = cards.length > 0 ? (idx / cards.length) * 100 : 0;
  const currentPalette: ColorPalette = currentCard?.colorPalette || 'indigo_violet';
  const paletteConfig = PALETTE_BACKGROUNDS[currentPalette];

  const handleRate = useCallback((rating: DifficultyLevel) => {
    if (!currentCard) return;
    rateCard(currentCard.id, rating);
    setSessionStats((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));
    
    // Gamification: Confetti every 5 correct
    if (rating === 'easy') {
      const nextStreak = correctStreak + 1;
      setCorrectStreak(nextStreak);
      if (nextStreak % 5 === 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } else {
      setCorrectStreak(0);
    }
    
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
    <div className="relative min-h-screen animate-kids-bg overflow-hidden">
      {/* Confetti celebration */}
      {showConfetti && <VictoryConfetti />}

      {/* Star Particles */}
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className="star-particle w-1.5 h-1.5" 
          style={{ 
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`
          }} 
        />
      ))}

      <div className="relative z-10 max-w-2xl mx-auto pt-16 pb-16 px-4">
        {/* KIDS Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-white/20 hover:scale-110 transition-transform">
              <ArrowLeft className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500/60">Study Deck</span>
              <span className="text-sm font-black text-slate-800">{deck.name}</span>
            </div>
          </button>

          <div className="flex items-center gap-4">
            {/* 7-Day Streak */}
            <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full shadow-sm">
              <span className="text-sm">🔥</span>
              <span className="text-xs font-black text-orange-600 tracking-tighter">7 DAY STREAK</span>
            </div>
            
            {/* Level Badge */}
            <div className="flex items-center gap-1.5 bg-indigo-500 border-2 border-indigo-400 px-3 py-1.5 rounded-full shadow-lg shadow-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-black text-white tracking-widest uppercase">LEVEL 4</span>
            </div>
          </div>
        </div>

        {/* Card Switcher for Kids Edition */}
        <div className="relative py-10">
          <FlashCard 
            key={currentCard.id}
            subject={subject}
            question={currentCard.front}
            answer={currentCard.back}
            mastery={Math.round((currentCard.difficulty || 1) * 20)}
            delay={0}
            onRate={handleRate}
          />
        </div>

        {/* Action hints */}
        <div className="mt-12 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">
            Tap the card to reveal the hidden truth
          </p>
        </div>
      </div>
    </div>
  );
}
