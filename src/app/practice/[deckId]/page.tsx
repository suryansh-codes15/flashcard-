'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useFlashcardStore } from '@/store/flashcard-store';
import FlashCard3D from '@/components/FlashCard3D';
import MascotCharacter, { MascotState } from '@/components/MascotCharacter';
import CinematicBackground from '@/components/layout/CinematicBackground';
import XPBar from '@/components/XPBar';
import StreakBadge from '@/components/StreakBadge';
import XPFloatingScore from '@/components/XPFloatingScore';
import VictoryConfetti from '@/components/VictoryConfetti';
import SessionSummary from '@/components/practice/SessionSummary';
import { DifficultyLevel, Flashcard, MascotSubject } from '@/types';

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;
  const { getDeck, getCardsForReview, getDeckCards, rateCard, getStats } = useFlashcardStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const deck = hydrated ? getDeck(deckId) : null;
  const stats = hydrated ? getStats() : null;
  
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [idx, setIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [sessionResults, setSessionResults] = useState({ easy: 0, medium: 0, hard: 0 });
  const [showXP, setShowXP] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shake, setShake] = useState(false);

  // Character States
  const [leftMascotState, setLeftMascotState] = useState<MascotState>('reading');
  const [rightMascotState, setRightMascotState] = useState<MascotState>('idle');

  useEffect(() => {
    if (!hydrated) return;

    console.log('StudyPage mounted. deckId:', deckId);
    console.log('Deck found:', !!deck);

    let reviewCards = getCardsForReview(deckId);
    console.log('Review cards count:', reviewCards.length);

    if (reviewCards.length === 0) {
      reviewCards = getDeckCards(deckId);
      console.log('Total deck cards count:', reviewCards.length);
    }

    if (reviewCards.length > 0) {
      setCards(reviewCards);
    } else if (deck) {
      console.warn('No cards found for this deck. Moving to session summary.');
      setSessionDone(true);
    }
  }, [deckId, getCardsForReview, getDeckCards, deck, hydrated]);

  const handleRate = useCallback((rating: DifficultyLevel) => {
    if (!cards[idx]) {
      console.error('Cannot rate: current card is missing. idx:', idx);
      return;
    }
    
    // Feedback Logic
    if (rating === 'easy' || rating === 'medium') {
      setShowXP(true);
      setLeftMascotState('jumping');
      setRightMascotState('jumping');
      
      if (rating === 'easy') setShowConfetti(true);
      
      setTimeout(() => {
        setShowXP(false);
        setShowConfetti(false);
        setLeftMascotState('reading');
        setRightMascotState('idle');
      }, 1500);
    } else {
      setShake(true);
      setLeftMascotState('sad');
      setRightMascotState('sad');
      
      setTimeout(() => {
        setShake(false);
        setLeftMascotState('reading');
        setRightMascotState('idle');
      }, 800);
    }

    // Process SRS
    rateCard(cards[idx].id, rating);

    // Update session stats
    setSessionResults(prev => ({
      ...prev,
      [rating]: (prev[rating as keyof typeof prev] || 0) + 1
    }));

    // Next Card
    if (idx < cards.length - 1) {
      setTimeout(() => {
        setIdx(idx + 1);
        setIsFlipped(false);
      }, 400);
    } else {
      setTimeout(() => setSessionDone(true), 1500);
    }
  }, [idx, cards, rateCard]);

  // Handle Keyboard Interactions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
        // Micro character bounce on flip
        setRightMascotState('dancing');
        setTimeout(() => setRightMascotState('idle'), 400);
      }
      if (isFlipped) {
        if (e.key === '1') handleRate('hard');
        if (e.key === '2') handleRate('hard');
        if (e.key === '3') handleRate('medium');
        if (e.key === '4') handleRate('easy');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleRate]);

  if (!hydrated || !deck) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-white/50 bg-[#06040f]">
        <div className="relative">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
          <div className="absolute inset-0 blur-xl bg-purple-500/20 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <p className="font-black uppercase tracking-[0.3em] text-[10px] text-purple-400">
            {!hydrated ? 'Accessing Neural Storage...' : 'Forge Synchronization Failed'}
          </p>
          {hydrated && !deck && (
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 rounded-full border border-white/10 text-[9px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              Return to Control Center
            </button>
          )}
        </div>
      </div>
    );
  }

  if (sessionDone) return (
    <SessionSummary 
      deckName={deck.name} 
      totalCards={cards.length} 
      stats={sessionResults} 
      onReset={() => {
        setIdx(0);
        setSessionDone(false);
        setIsFlipped(false);
        setSessionResults({ easy: 0, medium: 0, hard: 0 });
      }}
    />
  );

  const currentCard = cards[idx];
  if (!currentCard) return null;

  const getSubject = (name: string): MascotSubject => {
    const n = name.toLowerCase();
    if (n.includes('math') || n.includes('calc')) return 'math';
    if (n.includes('geo') || n.includes('map')) return 'geography';
    if (n.includes('hist') || n.includes('war')) return 'history';
    if (n.includes('lang') || n.includes('vocab')) return 'language';
    return 'science';
  };

  const subject = getSubject(deck.name);
  const progress = ((idx) / cards.length) * 100;

  return (
    <div className="relative min-h-[calc(100vh-64px)] py-8 px-4 flex flex-col items-center overflow-x-hidden">
      {/* 🌌 CINEMATIC ENGINE LAYER */}
      <CinematicBackground subject={subject} />

      {/* Visual Overlays */}
      {showXP && <XPFloatingScore />}
      {showConfetti && <VictoryConfetti />}

      <div className="w-full max-w-5xl flex flex-col gap-10 z-10">
        
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-3 rounded-2xl bg-[#0f0a1e]/80 backdrop-blur-md border border-white/5 hover:bg-[#1a1040] transition-all shadow-xl"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-purple-400 uppercase tracking-widest leading-none">Reviewing</span>
                <div className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-300">
                  {idx + 1} / {cards.length}
                </div>
              </div>
              <h1 className="text-xl font-black text-white drop-shadow-lg">{deck.name}</h1>
            </div>
          </div>

          {stats && (
            <div className="flex items-center gap-4 bg-[#0f0a1e]/80 backdrop-blur-md p-2 pl-4 rounded-3xl border border-white/10 shadow-2xl">
              <StreakBadge streak={stats.streak} />
              <div className="h-8 w-[1px] bg-white/5 mx-1" />
              <XPBar xp={stats.xp} level={stats.level} className="w-48" />
            </div>
          )}
        </div>

        {/* PROGRESS SYSTEM */}
        <div className="px-4">
          <div className="h-2 w-full bg-[#0f0a1e]/60 backdrop-blur-sm rounded-full overflow-hidden border border-white/10 p-[2px]">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 via-purple-400 to-emerald-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 🎬 CHARACTER-CARD SCENE */}
        <div className="relative flex flex-col items-center justify-center py-12 px-4">
          
          <div className="relative w-full max-w-4xl flex items-center justify-center gap-4 md:gap-12 min-h-[350px]">
            
            {/* SPARKY (Left) */}
            <div className="hidden lg:flex flex-col items-center gap-4 pb-12 self-end">
              <MascotCharacter 
                side="left"
                name="Sparky"
                subject={subject}
                state={leftMascotState}
                onClick={() => {
                  setLeftMascotState('jumping');
                  setTimeout(() => setLeftMascotState('reading'), 700);
                }}
              />
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Guardian</span>
            </div>

            {/* THE CARD */}
            <FlashCard3D 
              card={currentCard}
              subject={subject}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(!isFlipped)}
              shake={shake}
            />

            {/* NOVA (Right) */}
            <div className="hidden lg:flex flex-col items-center gap-4 pb-12 self-end">
              <MascotCharacter 
                side="right"
                name="Nova"
                subject={subject}
                state={rightMascotState}
                onClick={() => {
                  setRightMascotState('jumping');
                  setTimeout(() => setRightMascotState('idle'), 700);
                }}
              />
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Hype-Bot</span>
            </div>

          </div>

          {/* Action Row */}
          <div className={`mt-16 w-full max-w-2xl transition-all duration-500 flex flex-col items-center gap-8 ${isFlipped ? 'opacity-100 translate-y-0 scale-100' : 'opacity-20 translate-y-4 scale-95 pointer-events-none grayscale'}`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
              {[
                { label: 'Again', val: 'hard' as DifficultyLevel, color: 'rgb(239, 68, 68)', hint: '1' },
                { label: 'Hard', val: 'hard' as DifficultyLevel, color: 'rgb(245, 158, 11)', hint: '2' },
                { label: 'Good', val: 'medium' as DifficultyLevel, color: 'rgb(16, 185, 129)', hint: '3' },
                { label: 'Easy', val: 'easy' as DifficultyLevel, color: 'rgb(59, 130, 246)', hint: '4' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => handleRate(btn.val)}
                  className="group relative flex flex-col items-center gap-2 px-4 py-4 rounded-3xl bg-[#0f0a1e]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all active:scale-95 shadow-2xl overflow-hidden"
                >
                  {/* Dynamic Glow Background */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                    style={{ background: btn.color }}
                  />
                  <span className="text-[11px] font-black uppercase tracking-widest text-white/80">{btn.label}</span>
                  <div className="flex items-center gap-2">
                    <kbd className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-white/40 font-mono">
                      {btn.hint}
                    </kbd>
                  </div>
                </button>
              ))}
            </div>
            
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 animate-pulse">
              Space bar to reveal answer
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
