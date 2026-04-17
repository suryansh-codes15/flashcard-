'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useFlashcardStore } from '@/store/flashcard-store';
import FlashCard from '@/components/FlashCard';
import XPBar from '@/components/XPBar';
import StreakBadge from '@/components/StreakBadge';
import XPFloatingScore from '@/components/XPFloatingScore';
import VictoryConfetti from '@/components/VictoryConfetti';
import SessionSummary from '@/components/practice/SessionSummary';
import type { DifficultyLevel, Flashcard } from '@/types';

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;
  const { getDeck, getCardsForReview, rateCard, getStats } = useFlashcardStore();

  const deck = getDeck(deckId);
  const stats = getStats();
  
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [idx, setIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const reviewCards = getCardsForReview(deckId);
    if (reviewCards.length > 0) {
      setCards(reviewCards);
    } else if (deck) {
      setSessionDone(true);
    }
  }, [deckId, getCardsForReview, deck]);

  const handleRate = useCallback((rating: DifficultyLevel) => {
    if (!cards[idx]) return;
    
    // Feedback Logic
    if (rating === 'easy' || rating === 'medium') {
      setShowXP(true);
      if (rating === 'easy') setShowConfetti(true);
      setTimeout(() => {
        setShowXP(false);
        setShowConfetti(false);
      }, 1500);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    // Process SRS
    rateCard(cards[idx].id, rating);

    // Next Card
    if (idx < cards.length - 1) {
      setTimeout(() => {
        setIdx(idx + 1);
        setIsFlipped(false);
      }, 400);
    } else {
      setTimeout(() => setSessionDone(true), 1000);
    }
  }, [idx, cards, rateCard]);

  if (!deck) return null;
  if (sessionDone) return <SessionSummary deckId={deckId} />;

  const currentCard = cards[idx];
  if (!currentCard) return null;

  // Simple keyword mapping for mascots
  const getSubject = (name: string): any => {
    const n = name.toLowerCase();
    if (n.includes('math') || n.includes('calc')) return 'math';
    if (n.includes('geo') || n.includes('map')) return 'geography';
    if (n.includes('hist') || n.includes('war')) return 'history';
    return 'science';
  };

  const subject = getSubject(deck.name);
  const progress = ((idx) / cards.length) * 100;

  return (
    <div className={`relative min-h-[calc(100vh-64px)] py-8 px-4 flex flex-col items-center ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
      {/* Visual Overlays */}
      {showXP && <XPFloatingScore />}
      {showConfetti && <VictoryConfetti />}

      <div className="w-full max-w-4xl flex flex-col gap-10">
        
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-3 rounded-2xl bg-[#0f0a1e] border border-white/5 hover:bg-[#1a1040] transition-all"
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
              <h1 className="text-xl font-black text-white">{deck.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#0f0a1e]/50 p-2 pl-4 rounded-3xl border border-white/5 shadow-xl">
            <StreakBadge streak={stats.streak} />
            <div className="h-8 w-[1px] bg-white/5 mx-1" />
            <XPBar xp={stats.xp} level={stats.level} className="w-48" />
          </div>
        </div>

        {/* PROGRESS SYSTEM */}
        <div className="px-4">
          <div className="h-2 w-full bg-[#0f0a1e] rounded-full overflow-hidden border border-white/5 p-[2px]">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 via-purple-400 to-indigo-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(167,139,250,0.4)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* FLASHCARD CORE */}
        <div className="flex flex-col items-center justify-center gap-12 py-4">
          <FlashCard 
            key={currentCard.id}
            subject={subject}
            question={currentCard.front}
            answer={currentCard.back}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
          />

          {/* Action Row */}
          <div className={`transition-all duration-500 flex flex-col items-center gap-8 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-30 -translate-y-4 pointer-events-none grayscale'}`}>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: 'Again', val: 'hard' as DifficultyLevel, bg: 'bg-[#ef4444]/10', text: 'text-[#ef4444]', border: 'border-[#ef4444]/30', hint: '1' },
                { label: 'Hard', val: 'hard' as DifficultyLevel, bg: 'bg-[#d97706]/10', text: 'text-[#d97706]', border: 'border-[#d97706]/30', hint: '2' },
                { label: 'Good', val: 'medium' as DifficultyLevel, bg: 'bg-[#059669]/10', text: 'text-[#059669]', border: 'border-[#059669]/30', hint: '3' },
                { label: 'Easy', val: 'easy' as DifficultyLevel, bg: 'bg-[#2563eb]/10', text: 'text-[#2563eb]', border: 'border-[#2563eb]/30', hint: '4' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => handleRate(btn.val)}
                  className={`group relative flex flex-col items-center gap-1 px-8 py-3 rounded-[30px] border-2 transition-all active:scale-95 ${btn.bg} ${btn.border} ${btn.text} hover:scale-105 shadow-lg shadow-black/20`}
                >
                  <span className="text-[11px] font-black uppercase tracking-widest">{btn.label}</span>
                  <span className="text-[10px] opacity-40 font-bold">Key {btn.hint}</span>
                </button>
              ))}
            </div>
            
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">
              Space bar to flip card
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
