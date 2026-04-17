'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trophy, Sparkles } from 'lucide-react';
import { useFlashcardStore } from '@/store/flashcard-store';
import NavBar from '@/components/layout/NavBar';
import DashboardStatsRow from '@/components/DashboardStatsRow';
import DeckCard from '@/components/DeckCard';
import XPBar from '@/components/XPBar';
import StreakBadge from '@/components/StreakBadge';

export default function DashboardPage() {
  const router = useRouter();
  const { decks, getStats } = useFlashcardStore();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setStats(getStats());
  }, [getStats]);

  if (!stats) return null;

  // Simple keyword mapping for mascots
  const getSubject = (name: string): any => {
    const n = name.toLowerCase();
    if (n.includes('math') || n.includes('calc')) return 'math';
    if (n.includes('geo') || n.includes('map')) return 'geography';
    if (n.includes('hist') || n.includes('war')) return 'history';
    if (n.includes('phrase') || n.includes('lang')) return 'language';
    return 'science';
  };

  return (
    <div className="min-h-screen py-10 px-6 max-w-7xl mx-auto space-y-12">
      
      {/* ✋ WELCOME HEADER */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 py-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none">
              Welcome Back
            </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Good morning! 👋
          </h1>
          <p className="text-gray-500 text-sm font-medium tracking-wide">
            You have <span className="text-white font-bold">{stats.dueToday} cards</span> to review today. Let's keep the fire burning!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#0f0a1e]/50 p-3 pl-6 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-md">
          <button 
            onClick={() => router.push('/upload')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-purple-900/20 active:scale-95"
          >
            Forge New
          </button>
          <div className="h-10 w-[1px] bg-white/5 mx-1 hidden sm:block" />
          <StreakBadge streak={stats.streak} />
          <div className="h-10 w-[1px] bg-white/5 mx-1" />
          <XPBar xp={stats.xp} level={stats.level} className="w-64" />
        </div>
      </div>

      {/* 📊 STATS PREVIEW */}
      <DashboardStatsRow stats={stats} />

      {/* 🃏 DECK GRID */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-white tracking-tight">Your Collections</h2>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">
              {decks.length} Active
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <DeckCard 
              key={deck.id}
              name={deck.name}
              count={deck.cardCount}
              mastery={deck.masteryPercentage || 0}
              emoji={deck.emoji || '📁'}
              subject={getSubject(deck.name)}
              onClick={() => router.push(`/practice/${deck.id}`)}
            />
          ))}

          {/* New Deck Placeholder */}
          <button 
            onClick={() => router.push('/upload')}
            className="flex flex-col items-center justify-center gap-4 h-full min-h-[220px] rounded-[16px] border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-purple-500/40 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 transition-all">
              <Plus className="w-6 h-6 text-white/40 group-hover:text-white" />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-white group-hover:text-purple-400 transition-colors uppercase tracking-widest">New Collection</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Start forging with AI</p>
            </div>
          </button>
        </div>
      </div>

      {/* 🏆 ACHIEVEMENTS */}
      <div className="space-y-6 pt-10">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-black text-white tracking-tight">Milestones</h2>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-6 -mx-2 px-2 custom-scrollbar">
          {[
            { label: '7 Day Fire', emoji: '🔥', color: 'bg-amber-600', locked: false },
            { label: 'Science Pro', emoji: '🧪', color: 'bg-indigo-600', locked: false },
            { label: 'Master of 100', emoji: '💯', color: 'bg-emerald-600', locked: true },
            { label: 'Night Owl', emoji: '🦉', color: 'bg-blue-600', locked: true },
            { label: 'First Forge', emoji: '⚡', color: 'bg-purple-600', locked: false },
          ].map((badge) => (
            <div 
              key={badge.label}
              className={`flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-full border transition-all
                ${badge.locked 
                  ? 'bg-[#1a1040]/30 border-white/5 opacity-30' 
                  : 'bg-[#1a1040] border-purple-500/20 shadow-[0_0_20px_rgba(0,0,0,0.3)]'
                }`}
            >
              <span className="text-xl">{badge.locked ? '🔒' : badge.emoji}</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-white whitespace-nowrap">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}