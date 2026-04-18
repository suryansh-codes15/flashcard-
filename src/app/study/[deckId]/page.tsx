'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useFlashcardStore } from '@/store/flashcard-store';
import MascotCharacter from '@/components/MascotCharacter';
import { ArrowLeft } from 'lucide-react';
import type { Flashcard, DifficultyLevel } from '@/types';

export default function StudyPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = use(params);
  const router = useRouter();
  const { getDeck, getCardsForReview, rateCard, addSession } = useFlashcardStore();
  const [deck, setDeck] = useState<any>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [isFinished, setIsFinished] = useState(false);

  // States for animations
  const [sparkyState, setSparkyState] = useState<'idle'|'reading'|'jumping'|'sad'|'dancing'>('reading');
  const [novaState, setNovaState] = useState<'idle'|'reading'|'jumping'|'sad'|'dancing'>('dancing');
  const [shakeCard, setShakeCard] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [floatingXP, setFloatingXP] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);

  const [hydrated, setHydrated] = useState(false);
  const sessionStartedTime = useRef(new Date().toISOString());

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

  const handleRate = useCallback((rating: DifficultyLevel) => {
    if (cards.length === 0 || isFinished) return;
    
    const card = cards[currentIndex];
    const isCorrect = rating === 'easy' || rating === 'medium';
    
    // Process the rating
    rateCard(card.id, rating);
    
    // Update stats
    setSessionStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    // Trigger animations
    if (isCorrect) {
      setSparkyState('jumping');
      setNovaState('jumping');
      setShowConfetti(true);
      setFloatingXP(true);
      setTimeout(() => {
        setSparkyState('reading');
        setNovaState('dancing');
        setShowConfetti(false);
        setFloatingXP(false);
        nextCard();
      }, 1500);
    } else {
      setSparkyState('sad');
      setShakeCard(true);
      setWrongFlash(true);
      setTimeout(() => {
        setSparkyState('reading');
        setShakeCard(false);
        setWrongFlash(false);
      }, 800);
      // Wait a bit before next card
      setTimeout(() => nextCard(), 1500);
    }

  }, [cards, currentIndex, isFinished, rateCard]);

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFlipped(false);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    // Record session
    addSession({
      id: crypto.randomUUID(),
      deckId: deckId,
      startedAt: sessionStartedTime.current,
      finishedAt: new Date().toISOString(),
      cardsStudied: sessionStats.total,
      cardsCorrect: sessionStats.correct,
      accuracy: sessionStats.total > 0 ? (sessionStats.correct / sessionStats.total) * 100 : 0
    });
    setIsFinished(true);
  };

  // Keyboard controls
  useEffect(() => {
    if (isFinished || cards.length === 0) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setFlipped(prev => !prev);
      } else if (flipped) {
        if (e.key === '1') handleRate('again');
        if (e.key === '2') handleRate('hard');
        if (e.key === '3') handleRate('medium');
        if (e.key === '4') handleRate('easy');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipped, isFinished, cards.length, handleRate]);

  if (!hydrated || !deck) return null;

  if (isFinished || cards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
        <MascotCharacter subject="science" side="left" name="Sparky" state="jumping" className="w-48 h-48 drop-shadow-[0_0_30px_rgba(139,92,246,0.3)] mb-4" />
        <h1 className="text-4xl font-black text-white">Session Complete! 🎉</h1>
        <p className="text-gray-400">
          You studied <span className="text-white font-bold">{sessionStats.total || cards.length} cards</span>.
          {cards.length === 0 && " No cards due right now."}
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-6 px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-full text-white font-black transition-all active:scale-95 shadow-[0_0_20px_rgba(124,58,237,0.4)]"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const card = cards[currentIndex];
  const progressPercent = ((currentIndex) / cards.length) * 100;

  const subjectColor = wrongFlash ? 'border-red-500' : 'border-purple-500/20';
  const shakeClass = shakeCard ? 'animate-[shake_0.4s_ease-in-out_2]' : '';

  return (
    <div className="min-h-screen flex flex-col items-center overflow-hidden">
      {/* Top Bar with Progress */}
      <div className="w-full h-1 bg-white/5 absolute top-0 left-0">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="w-full max-w-7xl px-6 py-6 flex items-center justify-between z-10">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[11px] font-black uppercase tracking-widest hidden sm:inline">Back</span>
        </button>
        <div className="px-4 py-1.5 bg-[#1a1040] border border-white/10 rounded-full text-[11px] font-black text-purple-400 tracking-widest uppercase">
          {currentIndex + 1} / {cards.length}
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Main Scene */}
      <div className="flex-1 w-full flex items-center justify-center -mt-10 perspective-1200 cursor-pointer" onClick={() => !flipped && setFlipped(true)}>
        <div className="flex items-center justify-center gap-4 md:gap-16 relative">
          
          {/* Confetti Burst */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
               {/* Extremely simple CSS confetti simulation using unicode and animations */}
               {Array.from({ length: 18 }).map((_, i) => (
                 <div
                   key={i}
                   className="absolute text-2xl animate-confetti-burst"
                   style={{
                     transform: `rotate(${Math.random() * 360}deg)`,
                     animationDuration: `${0.5 + Math.random() * 0.5}s`,
                   }}
                 >
                   {['✨', '🪙', '🚀', '🔥'][Math.floor(Math.random()*4)]}
                 </div>
               ))}
            </div>
          )}

          {/* Sparky */}
          <div className="hidden md:block">
            <MascotCharacter subject="science" side="left" name="Sparky" state={sparkyState} className="w-40 h-40 drop-shadow-xl" />
          </div>

          {/* 3D Flashcard */}
          <div className={`relative w-[340px] sm:w-[420px] min-h-[260px] preserve-3d transition-transform duration-500 ease-out z-20 ${shakeClass}`}
            style={{ 
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              animation: shakeCard ? 'none' : 'cardFloat 4s ease-in-out infinite alternate',
            }}
          >
            {/* Holo border ring (always behind the card) */}
            <div 
              className="absolute inset-[-3px] rounded-[24px] z-[-1]"
              style={{
                background: 'linear-gradient(270deg, #7c3aed, #06b6d4, #10b981, #f59e0b, #ec4899, #7c3aed)',
                backgroundSize: '400% 400%',
                animation: 'holoBorder 4s linear infinite',
                transform: 'translateZ(-1px)',
              }}
            />

            {/* Front Face */}
            <div className="absolute inset-0 backface-hidden bg-[#0f0a1e] rounded-[22px] border flex flex-col p-8" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between mb-8">
                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 capitalize tracking-widest rounded-full leading-none">
                  Question
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center text-center">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">{card.front}</h2>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 opacity-50 flex items-center gap-2 justify-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Tap or Space to flip
                </span>
              </div>
            </div>

            {/* Back Face */}
            <div className="absolute inset-0 backface-hidden bg-[#0a2c1c] rounded-[22px] border border-emerald-500/30 flex flex-col p-8" style={{ transform: 'rotateY(180deg)' }}>
              <div className="flex justify-between items-center mb-6">
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-black text-emerald-400 uppercase tracking-widest rounded-full leading-none">
                  Answer
                </span>
                {floatingXP && (
                  <span className="absolute right-8 top-8 text-amber-400 font-bold text-lg animate-[float-up-fade_1s_ease-out_forwards]">
                    +10 XP
                  </span>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center gap-4">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md text-center">{card.back}</h2>
                {card.concept && (
                  <p className="text-sm text-emerald-200/80 text-center italic bg-black/20 p-3 rounded-xl border border-emerald-500/20">
                    💡 {card.concept}
                  </p>
                )}
              </div>

              {/* Rating Buttons */}
              <div className="mt-6 -mx-2 h-[48px]" onClick={e => e.stopPropagation()}>
                <div className="flex gap-2 h-full opacity-0 animate-[fade-in_0.3s_ease-out_0.2s_forwards]">
                  <button onClick={() => handleRate('again')} className="flex-1 bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl text-[10px] font-black uppercase text-red-200 transition-colors flex flex-col items-center justify-center">
                    <span className="text-lg">😓</span>
                    <span>1 Again</span>
                  </button>
                  <button onClick={() => handleRate('hard')}  className="flex-1 bg-amber-900/40 hover:bg-amber-900/60 border border-amber-500/30 rounded-xl text-[10px] font-black uppercase text-amber-200 transition-colors flex flex-col items-center justify-center">
                    <span className="text-lg">😤</span>
                    <span>2 Hard</span>
                  </button>
                  <button onClick={() => handleRate('medium')}  className="flex-1 bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 rounded-xl text-[10px] font-black uppercase text-blue-200 transition-colors flex flex-col items-center justify-center">
                    <span className="text-lg">😊</span>
                    <span>3 Good</span>
                  </button>
                  <button onClick={() => handleRate('easy')}  className="flex-1 bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase text-emerald-200 transition-colors flex flex-col items-center justify-center">
                    <span className="text-lg">🚀</span>
                    <span>4 Easy</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Nova */}
          <div className="hidden md:block">
            <MascotCharacter subject="science" side="right" name="Nova" state={novaState} className="w-40 h-40 drop-shadow-xl" />
          </div>

        </div>

        {/* Hint text at bottom */}
        <div className="absolute bottom-12 text-center w-full animate-fade-in opacity-50">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-2 bg-black/40 rounded-full border border-white/5">
            Space to flip · 1-4 to rate
          </span>
        </div>
      </div>
    </div>
  );
}
