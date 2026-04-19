'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useFlashcardStore } from '@/store/flashcard-store';
import MascotCharacter from '@/components/MascotCharacter';
import FlashCard3D from '@/components/practice/FlashCard3D';
import { ArrowLeft, Flame, Trophy, ChevronLeft, AlertCircle, Zap, RotateCcw, CheckCircle2 } from 'lucide-react';
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
    // 🧠 AI ANALYTICS: Extracting Strengths & Weaknesses
    const weakTopicsSet = new Set<string>();
    const strongTopicsSet = new Set<string>();
    
    cards.forEach((c, idx) => {
      // Find the rating for this card from the store or internal tracking
      // Since handleRate and stats are simplified here, we look at where we struggled
      // For this session, we'll check our internal "wrongCards" first
      if (wrongCards.includes(c.id)) {
        weakTopicsSet.add(c.concept || "Key Core Concepts");
      } else if (idx < currentIndex) { // Only count cards we've actually rated
        strongTopicsSet.add(c.concept || "General Knowledge");
      }
    });

    const finalWeak = Array.from(weakTopicsSet).slice(0, 3);
    const finalStrong = Array.from(strongTopicsSet).slice(0, 3);

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
      weakTopics: finalWeak,
      strongTopics: finalStrong,
      improvement: sessionStats.correct > 0 ? 15 : 0 // Predictive improvement jump
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
  const advanceCardRef = useRef(advanceCard);
  const goToPrevRef = useRef(() => {});

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setFlipped(false);
      setCardError(false);
    }
  }, [currentIndex]);

  // Keep refs in sync with state
  useEffect(() => { flippedRef.current = flipped; }, [flipped]);
  useEffect(() => { handleRateRef.current = handleRate; }, [handleRate]);
  useEffect(() => { advanceCardRef.current = advanceCard; }, [advanceCard]);
  useEffect(() => { goToPrevRef.current = goToPrev; }, [goToPrev]);
  useEffect(() => { isFinishedRef.current = isFinished; }, [isFinished]);
  useEffect(() => { cardsRef.current = cards; }, [cards]);

  // Stable Keyboard controls (attached only once, using Capture Phase)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const code = e.code;

      // 🔄 FLIP & SCROLL PREVENTION: Handle Space, Enter, numbers, and ARROW KEYS
      const isInteractionKey = (
        key === ' ' || code === 'Space' || key === 'Enter' || 
        ['1','2','3','4'].includes(key) || 
        key === 'ArrowLeft' || key === 'ArrowRight'
      );
      
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

      // 🧭 NAVIGATION LOGIC (Arrow keys)
      if (key === 'ArrowLeft') {
        goToPrevRef.current();
      } else if (key === 'ArrowRight') {
        advanceCardRef.current();
      }
    };

    // Use Capture Phase (true) to ensure we intercept BEFORE the browser scrolls
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []); // Empty dependency array: attached only once

  if (!hydrated || !deck) return null;

  // SESSION COMPLETE SCREEN
  if (isFinished || cards.length === 0) {
    const accuracy = Math.round(sessionStats.total > 0 ? (sessionStats.correct / sessionStats.total) * 100 : 0);
    
    // AI Insights Logic
    let insight = "You're a natural! Your brain is syncing perfectly with this deck.";
    if (accuracy === 100) insight = "Absolute Perfection! Your neural connections for this subject are fully forged.";
    else if (accuracy > 80) insight = "Elite performance. Just a few more reps and you'll be untouchable.";
    else if (accuracy > 50) insight = "Solid foundation. Your focus on the tricky spots will pay off soon!";
    else insight = "This is where the real growth happens. Let's tackle those mistakes head-on.";

    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center space-y-10 animate-fade-in dashboard-scroll overflow-y-auto">
        
        {/* TOP SECTION: MASCOT & XP */}
        <div className="relative group perspective-1000">
           <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full scale-150 animate-pulse" />
           <MascotCharacter 
              subject="science" 
              side="left" 
              name="Sparky" 
              state="jumping" 
              className="w-48 h-48 drop-shadow-[0_0_40px_rgba(124,58,237,0.5)] z-20 relative transition-transform group-hover:scale-105" 
            />
           
           {/* SPEECH BUBBLE */}
           <div className="absolute -right-24 top-0 w-64 bg-white p-4 rounded-[24px] rounded-bl-none shadow-2xl animate-fade-up z-30 border border-purple-100">
              <p className="text-[11px] font-black leading-tight text-gray-800 text-left">
                <span className="text-purple-600 block mb-1 uppercase tracking-widest text-[9px]">AI Analysis</span>
                "{insight}"
              </p>
           </div>

           <div className="absolute -top-6 -left-10 animate-confetti-burst z-30">
              <Trophy className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
           </div>
        </div>

        <div className="space-y-2 z-20">
          <h1 className="text-5xl font-black text-white tracking-tight uppercase italic underline decoration-purple-500/50 underline-offset-8">Session Complete</h1>
          <p className="text-purple-300/80 font-black tracking-[0.2em] text-xs uppercase animate-pulse">
            + {sessionStats.xpEarned} Nova XP Gained
          </p>
        </div>

        {/* STATS & TOPICS GRID */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 z-20">
          
          {/* LEFT: MASTERED TOPICS */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex flex-col items-start text-left space-y-6 backdrop-blur-md">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[4px]">Neural Strengths</h3>
            <div className="space-y-3 w-full">
               {(sessionStats.easy > 0 || sessionStats.medium > 0) ? (
                 <div className="flex flex-wrap gap-2">
                    {["Mastery", "Speed", "Retention"].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[9px] font-black text-emerald-400 uppercase">{tag}</span>
                    ))}
                 </div>
               ) : null}
               <div className="text-4xl font-black text-white">
                 {sessionStats.easy + sessionStats.medium} <span className="text-lg text-white/30">Concepts</span>
               </div>
               <p className="text-xs font-bold text-gray-500 leading-relaxed">
                 You are building strong long-term memory for these areas. Next review recommended in 3 days.
               </p>
            </div>
          </div>

          {/* RIGHT: ANALYTICS GRID */}
          <div className="bg-[#1a1040]/40 border border-white/5 rounded-[32px] p-8 flex flex-col space-y-6 backdrop-blur-xl">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[4px]">Session Vitals</h3>
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-1">
                 <span className="text-sm font-black text-white block italic tracking-tighter">Accuracy</span>
                 <span className="text-3xl font-black text-purple-400">{accuracy}%</span>
               </div>
               <div className="space-y-1">
                 <span className="text-sm font-black text-white block italic tracking-tighter">Velocity</span>
                 <span className="text-3xl font-black text-pink-400">{sessionStats.total} <span className="text-xs text-white/20">cards</span></span>
               </div>
            </div>
            {wrongCards.length > 0 && (
               <div className="pt-4 border-t border-white/5">
                 <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <AlertCircle className="w-3 h-3" /> Growth Opportunity Found
                 </p>
                 <p className="text-[11px] font-bold text-gray-500">
                    You struggled with {wrongCards.length} concepts. Click 'Review Mistakes' for a deep-dive.
                 </p>
               </div>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md z-20 pb-10">
          <button
            onClick={() => restartSession(wrongCards.length > 0)}
            className={`flex-1 group relative px-8 py-5 rounded-full font-black text-lg transition-all active:scale-95 overflow-hidden
              ${wrongCards.length > 0 
                ? "bg-rose-600 text-white shadow-[0_15px_40px_-5px_rgba(225,29,72,0.4)]" 
                : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
              }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
               {wrongCards.length > 0 ? (
                 <>Target Weaknesses <Zap className="w-5 h-5 animate-pulse" /></>
               ) : (
                 <>Refresh Deck <RotateCcw className="w-5 h-5" /></>
               )}
            </span>
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 px-8 py-5 bg-purple-600 hover:bg-purple-500 rounded-full text-white font-black text-lg transition-all active:scale-95 shadow-[0_15px_40px_-10px_rgba(124,58,237,0.5)] flex items-center justify-center gap-2"
          >
            Finished <CheckCircle2 className="w-5 h-5" />
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
      <div className="fixed top-0 left-0 w-full h-[6px] bg-white/5 z-[200]">
        <div 
          className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(124,58,237,0.5)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 📂 SESSION HEADER */}
      <div className="w-full max-w-7xl px-8 py-3 flex items-center justify-between z-10 shrink-0">
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
        <div className="w-full max-w-4xl flex flex-col items-center gap-2 pb-4 z-40 mt-4 sm:mt-6">
            
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
                      className="flex-1 min-w-[100px] h-16 bg-[#3b0a0a]/40 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 rounded-xl transition-all group flex flex-col items-center justify-center gap-0.5 shadow-xl active:scale-95"
                    >
                      <span className="text-[12px] font-black text-white/60 uppercase tracking-widest group-hover:text-red-400">Again</span>
                      <span className="text-[8px] font-black text-white/20 group-hover:text-red-500/40">+0 XP · 1</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRate('hard'); }} 
                      className="flex-1 min-w-[100px] h-16 bg-[#2c1c00]/40 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 rounded-xl transition-all group flex flex-col items-center justify-center gap-0.5 shadow-xl active:scale-95"
                    >
                      <span className="text-[12px] font-black text-white/60 uppercase tracking-widest group-hover:text-amber-400">Hard</span>
                      <span className="text-[8px] font-black text-white/20 group-hover:text-amber-500/40">+5 XP · 2</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRate('medium'); }} 
                      className="flex-1 min-w-[100px] h-16 bg-[#0a2c1c]/40 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/30 rounded-xl transition-all group flex flex-col items-center justify-center gap-0.5 shadow-xl active:scale-95"
                    >
                      <span className="text-[12px] font-black text-white/60 uppercase tracking-widest group-hover:text-blue-400">Good</span>
                      <span className="text-[8px] font-black text-white/20 group-hover:text-blue-500/40">+10 XP · 3</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRate('easy'); }} 
                      className="flex-1 min-w-[100px] h-16 bg-[#0c2240]/40 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 rounded-xl transition-all group flex flex-col items-center justify-center gap-0.5 shadow-xl active:scale-95"
                    >
                      <span className="text-[12px] font-black text-white/60 uppercase tracking-widest group-hover:text-emerald-400">Easy</span>
                      <span className="text-[8px] font-black text-white/20 group-hover:text-emerald-500/40">+20 XP · 4</span>
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
