'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useFlashcardStore } from '@/store/flashcard-store';
import MascotCharacter from '@/components/MascotCharacter';
import { ArrowLeft, Flame, Zap, Trophy, Lightbulb, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Flashcard, DifficultyLevel } from '@/types';

export default function StudyPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = use(params);
  const router = useRouter();
  const { getDeck, getCardsForReview, rateCard, addSession, getStats } = useFlashcardStore();
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

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setFlipped(false);
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
  const stats = getStats();

  const getFrontFontSize = (text: string) => {
    const len = text.length;
    if (len > 220) return 'text-base sm:text-lg leading-relaxed font-bold';
    if (len > 120) return 'text-lg sm:text-xl leading-relaxed font-black';
    return 'text-xl sm:text-2xl leading-tight font-black';
  };

  const getBackFontSize = (text: string) => {
    const len = text.length;
    if (len > 350) return 'text-[15px] sm:text-[17px] leading-relaxed font-bold text-emerald-200/90';
    if (len > 200) return 'text-lg sm:text-xl leading-relaxed font-black text-emerald-300';
    if (len > 100) return 'text-xl sm:text-2xl leading-tight font-black text-emerald-400';
    return 'text-3xl sm:text-4xl leading-none font-black text-emerald-400';
  };

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

      {/* Top Header Section */}
      <div className="w-full max-w-7xl px-8 py-8 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-purple-400 font-black uppercase tracking-[3px]">Reviewing</span>
              <span className="text-[10px] text-white/40 font-bold uppercase">{currentIndex + 1} / {cards.length}</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">{deck.title}</h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="bg-[#1a1040]/80 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-xs font-black text-white whitespace-nowrap">{stats.streak} DAY STREAK</span>
          </div>
          
          <div className="bg-[#1a1040]/80 p-2 rounded-xl border border-white/5 flex items-center gap-3">
            <div className="bg-purple-600/20 px-3 py-1 rounded-lg border border-purple-500/20 text-[10px] font-black text-purple-400">LV {stats.level}</div>
            <div className="flex flex-col gap-1 w-32">
              <div className="flex justify-between text-[8px] font-bold text-gray-500 uppercase tracking-wider">
                <span>{stats.xp.toLocaleString()} XP</span>
                <span>{Math.floor((stats.xp % 200) / 2)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000" 
                  style={{ width: `${(stats.xp % 200) / 2}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Scene Container */}
      <div className="flex-1 w-full flex flex-col items-center justify-center -mt-8">
        {/* Card Stage with Mascots */}
        <div className="flex items-center justify-center gap-4 md:gap-16 relative perspective-2000">
          
          {/* Confetti Burst */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
               {Array.from({ length: 24 }).map((_, i) => {
                 const angle = (i / 24) * 360 + (Math.random() * 15);
                 const dist = 100 + Math.random() * 150;
                 return (
                   <div
                     key={i}
                     className="absolute text-2xl animate-confetti-burst"
                     style={{
                       '--dx': `${Math.cos(angle * Math.PI / 180) * dist}px`,
                       '--dy': `${Math.sin(angle * Math.PI / 180) * dist}px`,
                       animationDelay: `${Math.random() * 0.2}s`,
                     } as any}
                   >
                     {['✨', '🪙', '🚀', '🔥'][Math.floor(Math.random()*4)]}
                   </div>
                 );
               })}
            </div>
          )}

          {/* Sparky / Guardian */}
          <div className="hidden md:flex flex-col items-center gap-3">
            <MascotCharacter subject="science" side="left" name="Sparky" state={sparkyState} className="w-40 h-40 drop-shadow-[0_0_30px_rgba(139,92,246,0.2)]" />
            <div className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest backdrop-blur-md">
              GUARDIAN
            </div>
          </div>

          {/* 3D Flashcard Wrapper */}
          <div className={`relative w-[340px] sm:w-[500px] min-h-[340px] sm:min-h-[400px] preserve-3d z-20 ${shakeClass} cursor-pointer`}
            onClick={() => setFlipped(prev => !prev)}
            style={{ 
              animation: shakeCard ? 'none' : 'cardFloat 4s ease-in-out infinite alternate',
            }}
          >
            {/* Holo Border */}
            <div 
              className="absolute inset-[-6px] rounded-[28px] animate-holo pointer-events-none"
              style={{ 
                background: 'linear-gradient(270deg, #7c3aed, #06b6d4, #10b981, #f59e0b, #ec4899, #7c3aed)',
                backgroundSize: '400% 400%',
                transform: 'translateZ(-10px)'
              }}
            />

            {/* Card Body */}
            <div 
              className="absolute inset-0 w-full h-full preserve-3d transition-transform duration-500 ease-out shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)]"
              style={{ 
                transform: `${flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'} translateZ(0px)`,
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Front Face */}
              <div 
                className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#0f0a1e] to-[#1a1040] rounded-[22px] border border-white/5 flex flex-col z-10 overflow-hidden" 
                style={{ transform: 'rotateY(0deg) translateZ(1px)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <div className="flex-1 p-12 flex flex-col relative z-20 overflow-y-auto custom-scrollbar-thin">
                  <div className="my-auto w-full text-center">
                    <h2 className={`text-white drop-shadow-md leading-tight ${getFrontFontSize(card.front)}`}>
                      {card.front}
                    </h2>
                    {card.insight && (
                      <div className="mt-8 pt-8 border-t border-white/5 opacity-40">
                         <p className="text-[13px] text-gray-400 italic font-medium max-w-[80%] mx-auto">
                           {card.insight}
                         </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Back Face */}
              <div 
                className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#0a2c1c] to-[#064e40] rounded-[22px] border border-emerald-500/20 flex flex-col z-10 overflow-hidden" 
                style={{ transform: 'rotateY(180deg) translateZ(1px)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <div className="flex-1 p-12 flex flex-col relative z-20 overflow-y-auto custom-scrollbar-thin">
                  <div className="my-auto w-full text-center">
                    <h2 className={`font-black drop-shadow-[0_0_20px_rgba(110,231,183,0.2)] leading-tight ${getBackFontSize(card.back)}`}>
                      {card.back}
                    </h2>
                    {card.concept && (
                      <div className="mt-8 pt-8 border-t border-emerald-500/10 opacity-70">
                         <p className="text-[13px] text-emerald-100/70 italic font-medium max-w-[85%] mx-auto leading-relaxed">
                           {card.concept}
                         </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nova / Hype-Bot */}
          <div className="hidden md:flex flex-col items-center gap-3">
            <MascotCharacter subject="science" side="right" name="Nova" state={novaState} className="w-40 h-40 drop-shadow-[0_0_30px_rgba(219,39,119,0.2)]" />
            <div className="px-4 py-1.5 bg-pink-500/10 border border-pink-500/20 rounded-full text-[10px] font-black text-pink-400 uppercase tracking-widest backdrop-blur-md">
              HYPE-BOT
            </div>
          </div>
        </div>

        {/* Bottom Controls Area */}
        <div className="w-full max-w-4xl flex flex-col items-center gap-6 pb-12 z-40 mt-12">
           {/* Navigation Row */}
           <div className="flex items-center gap-4 bg-black/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/5 shadow-2xl">
              <button 
                onClick={(e) => { e.stopPropagation(); prevCard(); }}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 group disabled:opacity-20"
              >
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-all border border-white/10">
                    <ChevronLeft className="w-4 h-4 text-white/50 group-hover:text-purple-400" />
                  </div>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-purple-400 transition-colors">Prev</span>
              </button>
              
              <div className="h-6 w-px bg-white/5 mx-2" />
              
              <div className="text-[12px] font-black text-purple-400/80 tracking-widest">
                {currentIndex + 1} / {cards.length}
              </div>
              
              <div className="h-6 w-px bg-white/5 mx-2" />

              <button 
                onClick={(e) => { e.stopPropagation(); nextCard(); }}
                disabled={currentIndex === cards.length - 1}
                className="flex items-center gap-2 group disabled:opacity-20"
              >
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-purple-400 transition-colors">Next</span>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-all border border-white/10">
                    <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-purple-400" />
                  </div>
              </button>
           </div>

           {/* Rating Row (appears on flip) */}
           <div className="w-full h-[80px] flex items-center justify-center">
              {flipped && (
                <div className="flex gap-4 animate-fade-in w-full">
                  <button onClick={(e) => { e.stopPropagation(); handleRate('again'); }} className="flex-1 h-20 bg-[#1a1040]/40 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 rounded-2xl transition-all group flex flex-col items-center justify-center gap-1 shadow-xl">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-red-400">Again</span>
                    <span className="text-[10px] font-bold text-white/10 group-hover:text-red-500/40">Press 1</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleRate('hard'); }} className="flex-1 h-20 bg-[#1a1040]/40 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 rounded-2xl transition-all group flex flex-col items-center justify-center gap-1 shadow-xl">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-amber-400">Hard</span>
                    <span className="text-[10px] font-bold text-white/10 group-hover:text-amber-500/40">Press 2</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleRate('medium'); }} className="flex-1 h-20 bg-[#1a1040]/40 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/30 rounded-2xl transition-all group flex flex-col items-center justify-center gap-1 shadow-xl">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-blue-400">Good</span>
                    <span className="text-[10px] font-bold text-white/10 group-hover:text-blue-500/40">Press 3</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleRate('easy'); }} className="flex-1 h-20 bg-[#1a1040]/40 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 rounded-2xl transition-all group flex flex-col items-center justify-center gap-1 shadow-xl">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-emerald-400">Easy</span>
                    <span className="text-[10px] font-bold text-white/10 group-hover:text-emerald-500/40">Press 4</span>
                  </button>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
