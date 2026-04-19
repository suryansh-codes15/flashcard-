'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useFlashcardStore } from '@/store/flashcard-store';
import MascotCharacter from '@/components/MascotCharacter';
import FlashCard3D from '@/components/practice/FlashCard3D';
import { ArrowLeft, Flame, Trophy, ChevronLeft } from 'lucide-react';
import type { Flashcard, DifficultyLevel, MascotState } from '@/types';

// Pure CSS Confetti Component (Dual Sided)
function ConfettiBurst() {
  const particles = Array.from({ length: 40 });
  const colors = ['#a78bfa', '#6ee7b7', '#fbbf24', '#fb7185', '#93c5fd', '#f9a8d4'];

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {/* Left Burst */}
      <div className="absolute left-0 bottom-1/3">
        {particles.slice(0, 20).map((_, i) => (
          <div
            key={`left-${i}`}
            className="absolute w-2 h-4 sm:w-3 sm:h-5 rounded-sm animate-confetti-pop"
            style={{
              backgroundColor: colors[Math.floor(Math.random() * colors.length)],
              '--cx': `${100 + Math.random() * 300}px`, // Spray right
              '--cy': `${-100 - Math.random() * 250}px`,
              '--cr': `${Math.random() * 720}deg`,
              animationDelay: `${Math.random() * 0.2}s`,
            } as any}
          />
        ))}
      </div>
      {/* Right Burst */}
      <div className="absolute right-0 bottom-1/3">
        {particles.slice(20, 40).map((_, i) => (
          <div
            key={`right-${i}`}
            className="absolute w-2 h-4 sm:w-3 sm:h-5 rounded-sm animate-confetti-pop"
            style={{
              backgroundColor: colors[Math.floor(Math.random() * colors.length)],
              '--cx': `${-100 - Math.random() * 300}px`, // Spray left
              '--cy': `${-100 - Math.random() * 250}px`,
              '--cr': `${Math.random() * 720}deg`,
              animationDelay: `${Math.random() * 0.2}s`,
            } as any}
          />
        ))}
      </div>
    </div>
  );
}

export default function StudyPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = use(params);
  const router = useRouter();
  const { getDeck, getCardsForReview, rateCard, addSession, getStats } = useFlashcardStore();
  
  const [deck, setDeck] = useState<any>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [wrongCards, setWrongCards] = useState<string[]>([]);
  
  // Stats
  const [sessionStats, setSessionStats] = useState({ 
    correct: 0, 
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    again: 0,
    xpEarned: 0
  });

  // Animation States
  const [sparkyState, setSparkyState] = useState<MascotState>('reading'); // Guardian
  const [novaState, setNovaState] = useState<MascotState>('dancing');   // Hype-bot
  const [showConfetti, setShowConfetti] = useState(false);
  const [floatingXP, setFloatingXP] = useState<number | null>(null);
  const [holoBoost, setHoloBoost] = useState(false);
  const [cardError, setCardError] = useState(false);

  const [hydrated, setHydrated] = useState(false);
  const sessionStartedTime = useRef(new Date().toISOString());

  // Initialization
  useEffect(() => {
    setHydrated(true);
    const d = getDeck(deckId);
    if (!d) {
      router.push('/dashboard');
      return;
    }
    setDeck(d);
    setCards(getCardsForReview(deckId));
  }, [deckId, getDeck, getCardsForReview, router]);

  const advanceCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFlipped(false);
    } else {
      finishSession();
    }
  }, [currentIndex, cards.length]);

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setFlipped(false);
    }
  };

  const handleRate = useCallback((rating: DifficultyLevel) => {
    if (cards.length === 0 || isFinished) return;
    
    const card = cards[currentIndex];
    const isCorrect = rating !== 'again';
    const xp = rating === 'easy' ? 20 : rating === 'medium' ? 10 : rating === 'hard' ? 5 : 0;
    
    // Process the rating
    rateCard(card.id, rating);
    
    // Update stats
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      xpEarned: prev.xpEarned + xp,
      [rating]: (prev[rating] as number) + 1
    }));

    if (rating === 'again') {
      setWrongCards(prev => Array.from(new Set([...prev, card.id])));
    }

    // Reaction Logic
    if (rating === 'again' || rating === 'hard') {
      setSparkyState('sad'); 
      setNovaState('sad'); 
      setCardError(true);
      
      setTimeout(() => {
        setCardError(false);
        setSparkyState('reading');
        setNovaState('dancing');
        advanceCard();
      }, 800);
    } 
    else {
      setSparkyState('dancing');
      setNovaState('jumping');
      setShowConfetti(true);
      setFloatingXP(xp);
      setHoloBoost(true);
      
      setTimeout(() => {
        setShowConfetti(false);
        setFloatingXP(null);
        setHoloBoost(false);
        setSparkyState('reading');
        setNovaState('dancing');
        advanceCard();
      }, 700);
    }
  }, [cards, currentIndex, isFinished, rateCard, advanceCard]);

  const finishSession = () => {
    addSession({
      id: crypto.randomUUID(),
      deckId: deckId,
      deckName: deck.title || 'Untitled Deck',
      startedAt: sessionStartedTime.current,
      finishedAt: new Date().toISOString(),
      cardsStudied: sessionStats.total,
      cardsCorrect: sessionStats.correct,
      accuracy: sessionStats.total > 0 ? (sessionStats.correct / sessionStats.total) * 100 : 0,
      stats: {
        easy: sessionStats.easy,
        medium: sessionStats.medium,
        hard: sessionStats.hard,
        again: sessionStats.again
      },
      weakTopics: [],
      strongTopics: [],
      improvement: 0
    });
    setIsFinished(true);
  };

  const restartSession = (onlyWrong: boolean) => {
    if (onlyWrong) {
      const filtered = cards.filter(c => wrongCards.includes(c.id));
      if (filtered.length > 0) {
        setCards(filtered);
      } else {
        setCards(getCardsForReview(deckId));
      }
    } else {
      setCards(getCardsForReview(deckId));
    }
    setCurrentIndex(0);
    setFlipped(false);
    setIsFinished(false);
    setWrongCards([]);
    setSessionStats({ correct: 0, total: 0, easy: 0, medium: 0, hard: 0, again: 0, xpEarned: 0 });
    sessionStartedTime.current = new Date().toISOString();
  };

  // --- ⌨️ KEYBOARD STABILITY SYSTEM ---
  // Create refs to capture latest state values in a stable event listener
  const flippedRef = useRef(flipped);
  const handleRateRef = useRef(handleRate);
  const isFinishedRef = useRef(isFinished);
  const cardsRef = useRef(cards);

  // Keep refs in sync with state
  useEffect(() => { flippedRef.current = flipped; }, [flipped]);
  useEffect(() => { handleRateRef.current = handleRate; }, [handleRate]);
  useEffect(() => { isFinishedRef.current = isFinished; }, [isFinished]);
  useEffect(() => { cardsRef.current = cards; }, [cards]);

  // Stable Keyboard controls (attached only once, using Capture Phase)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const code = e.code;

      // 🔄 FLIP & SCROLL PREVENTION: Handle Space, Enter, and numbers early
      const isInteractionKey = (key === ' ' || code === 'Space' || key === 'Enter' || ['1','2','3','4'].includes(key));
      
      if (isInteractionKey) {
        // Stop the browser from scrolling or doing anything else immediately
        e.preventDefault();
        e.stopImmediatePropagation();
      }

      // 🚫 Guard: Don't flip/rate if session is finished or no cards
      if (isFinishedRef.current || cardsRef.current.length === 0) return;

      // 🔄 FLIP LOGIC
      if (key === ' ' || code === 'Space' || key === 'Enter') {
        setFlipped(prev => !prev);
      } 
      // 📊 RATE LOGIC (Only if flipped)
      else if (flippedRef.current) {
        if (key === '1' || code === 'Digit1') {
          handleRateRef.current('again');
        } else if (key === '2' || code === 'Digit2') {
          handleRateRef.current('hard');
        } else if (key === '3' || code === 'Digit3') {
          handleRateRef.current('medium');
        } else if (key === '4' || code === 'Digit4') {
          handleRateRef.current('easy');
        }
      }
    };

    // Use Capture Phase (true) to ensure we intercept BEFORE the browser scrolls
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []); // Empty dependency array: attached only once

  if (!hydrated || !deck) return null;

  // SESSION COMPLETE SCREEN
  if (isFinished || cards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-12 animate-fade-in">
        <div className="relative">
          <MascotCharacter subject="science" side="left" name="Sparky" state="jumping" className="w-48 h-48 drop-shadow-[0_0_30px_rgba(124,58,237,0.4)]" />
          <div className="absolute -top-10 -right-10 animate-bounce">
             <Trophy className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-black text-white tracking-tight">Session Complete! 🎉</h1>
          <p className="text-xl text-purple-300/60 font-medium">
            You reviewed <span className="text-white">{sessionStats.total || cards.length} cards</span> · <span className="text-emerald-400">+{sessionStats.xpEarned} XP</span> earned
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 w-full max-w-2xl px-8 py-10 bg-[#1a1040]/30 border border-white/5 rounded-[32px] backdrop-blur-xl">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[3px]">Accuracy</span>
            <span className="text-4xl font-black text-white">{Math.round(sessionStats.total > 0 ? (sessionStats.correct / sessionStats.total) * 100 : 0)}%</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[3px]">Mastered</span>
            <span className="text-4xl font-black text-emerald-400">{sessionStats.easy + sessionStats.medium}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[3px]">Correct</span>
            <span className="text-4xl font-black text-purple-400">{sessionStats.correct}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => restartSession(wrongCards.length > 0)}
            className="px-12 py-5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-white font-black text-lg transition-all active:scale-95"
          >
            {wrongCards.length > 0 ? "Review Mistakes" : "Study Again"}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-12 py-5 bg-purple-600 hover:bg-purple-500 rounded-full text-white font-black text-lg transition-all active:scale-95 shadow-[0_15px_40px_-10px_rgba(124,58,237,0.5)]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const card = cards[currentIndex];
  const progressPercent = ((currentIndex) / cards.length) * 100;
  const stats = getStats();

  return (
    <div className="h-screen flex flex-col items-center overflow-hidden">
      {/* 📊 TOP PROGRESS BAR */}
      <div className="fixed top-0 left-0 w-full h-[8px] bg-white/5 z-[200]">
        <div 
          className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(124,58,237,0.5)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 📂 SESSION HEADER */}
      <div className="w-full max-w-7xl px-8 py-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-purple-400 font-black uppercase tracking-[3px]">FlashForge Session</span>
              <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{currentIndex + 1} of {cards.length}</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">{deck.title}</h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <span className="text-base">🔥</span>
            <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest leading-none translate-y-[0.5px]">
              {stats.streak} Day Streak
            </span>
          </div>
          
          <div className="flex items-center gap-4 bg-[#1a1040]/40 p-2 pr-6 rounded-2xl border border-white/5">
             <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/20 flex flex-col items-center justify-center">
                <span className="text-[8px] font-black text-purple-400 uppercase leading-none">Level</span>
                <span className="text-lg font-black text-white leading-none mt-1">{stats.level}</span>
             </div>
             <div className="flex flex-col gap-1.5 w-32">
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-1000"
                      style={{ width: `${(stats.xp % 200) / 2}%` }}
                   />
                </div>
                <div className="flex justify-between items-center text-[9px] font-black text-white/30 tracking-widest uppercase">
                   <span>{stats.xp.toLocaleString()} XP</span>
                   <span>{Math.round((stats.xp % 200) / 2)}%</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 🃏 MAIN STUDY SCENE */}
      <div className="flex-1 w-full flex flex-col items-center justify-center relative">
        
        {/* GAMIFICATION LAYERS */}
        {showConfetti && <ConfettiBurst />}
        {floatingXP && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] pointer-events-none animate-xpFloat">
            <span className="text-4xl font-black text-purple-400 drop-shadow-[0_0_20px_rgba(167,139,250,0.6)]">+{floatingXP} XP</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 md:gap-24 relative perspective-2000">
          
          {/* Sparky / GUARDIAN (Left) */}
          <div className="hidden md:flex flex-col items-center gap-4 z-50">
             <MascotCharacter 
                side="left"
                subject="science" 
                name="Sparky" 
                state={sparkyState} 
                className="w-44 h-44 drop-shadow-[0_15px_35px_rgba(139,92,246,0.3)]" 
             />
             <div className="px-5 py-2 glass-surface rounded-full text-[10px] font-black text-purple-400 uppercase tracking-[3px] border border-purple-500/20">
                Guardian
             </div>
          </div>

          {/* THE UPGRADED CARD */}
          <div className={`relative transition-all duration-300 w-[340px] sm:w-[500px] ${cardError ? 'animate-shake' : ''}`}>
             <FlashCard3D 
                front={card.front}
                back={card.back}
                subject={deck.title}
                hint={card.concept} // Usually holds the hint
                explanation={card.insight}
                mastery={60} // Fixed per prompt mockup
                flipped={flipped}
                onFlip={() => {
                  setFlipped(!flipped);
                  setHoloBoost(true);
                  setTimeout(() => setHoloBoost(false), 800);
                }}
                onRate={handleRate}
                isFlippedManually={false}
             />
          </div>

          {/* Nova / HYPE-BOT (Right) */}
          <div className="hidden md:flex flex-col items-center gap-4 z-50">
             <MascotCharacter 
                side="right"
                subject="math" 
                name="Nova" 
                state={novaState} 
                className="w-44 h-44 drop-shadow-[0_15px_35px_rgba(16,185,129,0.3)] animate-[eyeBlink_4s_2.2s_infinite]" 
             />
             <div className="px-5 py-2 glass-surface rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-[3px] border border-emerald-500/20">
                Hype-Bot
             </div>
          </div>
        </div>

        {/* 🎮 BOTTOM CONTROLS AREA */}
        <div className="w-full max-w-4xl flex flex-col items-center gap-6 pb-8 z-40 mt-8 sm:mt-12">
            
            {/* Navigation Row */}
            <div className="flex items-center gap-4 bg-black/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/5 shadow-2xl">
                <button 
                  onClick={(e) => { e.stopPropagation(); prevCard(); }}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 group disabled:opacity-20 transition-all hover:scale-110 active:scale-95"
                >
                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-all border border-white/10">
                      <ChevronLeft className="w-5 h-5 text-white/50 group-hover:text-purple-400" />
                    </div>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-purple-400">Prev</span>
                </button>
                
                <div className="h-6 w-px bg-white/5 mx-2" />
                
                <div className="text-[12px] font-black text-purple-400/80 tracking-widest px-4">
                  {currentIndex + 1} / {cards.length}
                </div>
                
                <div className="h-6 w-px bg-white/5 mx-2" />

                <button 
                  onClick={(e) => { e.stopPropagation(); advanceCard(); }}
                  disabled={currentIndex === cards.length - 1}
                  className="flex items-center gap-2 group disabled:opacity-20 transition-all hover:scale-110 active:scale-95"
                >
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-purple-400">Next</span>
                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-all border border-white/10 rotate-180">
                      <ChevronLeft className="w-5 h-5 text-white/50 group-hover:text-purple-400" />
                    </div>
                </button>
            </div>

            {/* Rating Row (appears on flip) */}
            <div className="w-full h-[100px] flex items-center justify-center">
                {flipped && (
                  <div className="flex gap-4 animate-fade-up w-full px-4 overflow-x-auto pb-4 no-scrollbar">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRate('again'); }} 
                      className="flex-1 min-w-[120px] h-20 bg-[#3b0a0a]/40 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 rounded-2xl transition-all group flex flex-col items-center justify-center gap-1 shadow-xl active:scale-95"
                    >
                      <span className="text-[13px] font-black text-white/60 uppercase tracking-widest group-hover:text-red-400">Again</span>
                      <span className="text-[9px] font-black text-white/20 group-hover:text-red-500/40">+0 XP · Press 1</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRate('hard'); }} 
                      className="flex-1 min-w-[120px] h-20 bg-[#2c1c00]/40 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 rounded-2xl transition-all group flex flex-col items-center justify-center gap-1 shadow-xl active:scale-95"
                    >
                      <span className="text-[13px] font-black text-white/60 uppercase tracking-widest group-hover:text-amber-400">Hard</span>
                      <span className="text-[9px] font-black text-white/20 group-hover:text-amber-500/40">+5 XP · Press 2</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRate('medium'); }} 
                      className="flex-1 min-w-[120px] h-20 bg-[#0a2c1c]/40 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/30 rounded-2xl transition-all group flex flex-col items-center justify-center gap-1 shadow-xl active:scale-95"
                    >
                      <span className="text-[13px] font-black text-white/60 uppercase tracking-widest group-hover:text-blue-400">Good</span>
                      <span className="text-[9px] font-black text-white/20 group-hover:text-blue-500/40">+10 XP · Press 3</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRate('easy'); }} 
                      className="flex-1 min-w-[120px] h-20 bg-[#0c2240]/40 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 rounded-2xl transition-all group flex flex-col items-center justify-center gap-1 shadow-xl active:scale-95"
                    >
                      <span className="text-[13px] font-black text-white/60 uppercase tracking-widest group-hover:text-emerald-400">Easy</span>
                      <span className="text-[9px] font-black text-white/20 group-hover:text-emerald-500/40">+20 XP · Press 4</span>
                    </button>
                  </div>
                )}
            </div>
        </div>

        {/* MOBILE MASCOT (Centered Below) */}
        <div className="md:hidden flex flex-col items-center gap-2 pb-12">
            <MascotCharacter 
              side="left"
              subject="science" 
              name="Sparky" 
              state={sparkyState} 
              className="w-12 h-12" 
            />
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Guardian Active</span>
        </div>

      </div>
    </div>
  );
}
