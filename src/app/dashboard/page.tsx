'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trophy, History, Search, ArrowUpDown, Clock, Flame } from 'lucide-react';
import { useFlashcardStore } from '@/store/flashcard-store';
import DashboardStatsRow from '@/components/DashboardStatsRow';
import DeckCard from '@/components/DeckCard';
import XPBar from '@/components/XPBar';
import StreakBadge from '@/components/StreakBadge';

type SortMode = 'due' | 'name' | 'mastery' | 'recent';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5)  return 'Burning the midnight oil 🌙';
  if (h < 12) return 'Good morning! ☀️';
  if (h < 17) return 'Good afternoon! 👋';
  if (h < 21) return 'Good evening! 🌆';
  return 'Still at it! 🌙';
}

export default function DashboardPage() {
  const router = useRouter();
  const { decks, sessions, getStats, getDueCount } = useFlashcardStore();
  const [stats, setStats]       = useState<any>(null);
  const [search, setSearch]     = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('due');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStats(getStats());
    setHydrated(true);
  }, [getStats, decks]);

  const getSubject = (name: string): any => {
    const n = name.toLowerCase();
    if (n.includes('math') || n.includes('calc'))       return 'math';
    if (n.includes('geo')  || n.includes('map'))        return 'geography';
    if (n.includes('hist') || n.includes('war'))        return 'history';
    if (n.includes('phrase') || n.includes('lang'))     return 'language';
    return 'science';
  };

  // Last-studied date per deck from sessions
  const lastStudiedByDeck = useMemo(() => {
    const map: Record<string, string> = {};
    sessions.forEach((s) => {
      const existing = map[s.deckId];
      if (!existing || s.finishedAt > existing) map[s.deckId] = s.finishedAt;
    });
    return map;
  }, [sessions]);

  const sortLabels: Record<SortMode, string> = {
    due:    'Due First',
    name:   'A → Z',
    mastery:'Mastery',
    recent: 'Recent',
  };

  const filteredDecks = useMemo(() => {
    let result = [...decks];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      if (sortMode === 'name')    return a.name.localeCompare(b.name);
      if (sortMode === 'mastery') return (b.masteryPercentage || 0) - (a.masteryPercentage || 0);
      if (sortMode === 'recent') {
        const aT = lastStudiedByDeck[a.id] || a.createdAt;
        const bT = lastStudiedByDeck[b.id] || b.createdAt;
        return bT.localeCompare(aT);
      }
      // 'due' — decks with cards due bubble up
      return getDueCount(b.id) - getDueCount(a.id);
    });
    return result;
  }, [decks, search, sortMode, lastStudiedByDeck, getDueCount]);

  if (!stats || !hydrated) return null;

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
            {getGreeting()}
          </h1>
          <p className="text-gray-500 text-sm font-medium tracking-wide">
            {stats.dueToday > 0
              ? <>You have <span className="text-amber-400 font-bold">{stats.dueToday} cards</span> due for review. Let's keep the momentum!</>
              : <span className="text-emerald-400 font-bold">You're all caught up! 🎉 No cards due right now.</span>
            }
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#0f0a1e]/50 p-3 pl-6 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-md">
          <button
            onClick={() => router.push('/upload')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-purple-900/20 active:scale-95"
          >
            Forge New
          </button>
          <button
            onClick={() => router.push('/dashboard/history')}
            className="p-3 px-5 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 group shadow-xl active:scale-95"
          >
            <History className="w-4 h-4 text-purple-400 group-hover:rotate-[-45deg] transition-transform" />
            History
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-white tracking-tight">Your Collections</h2>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">
              {decks.length} Active
            </div>
          </div>

          {/* Search + Sort row */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search decks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-[#0f0a1e] border border-white/5 text-white text-[11px] font-bold
                  placeholder:text-gray-600 focus:outline-none focus:border-purple-500/40 transition-all"
              />
            </div>

            {/* Sort cycle */}
            <button
              onClick={() => {
                const modes: SortMode[] = ['due', 'name', 'mastery', 'recent'];
                setSortMode((prev) => modes[(modes.indexOf(prev) + 1) % modes.length]);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0f0a1e] border border-white/5 text-[10px] font-black text-gray-400 hover:text-white hover:border-purple-500/30 transition-all whitespace-nowrap"
            >
              <ArrowUpDown className="w-3 h-3" />
              {sortLabels[sortMode]}
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.length === 0 && search.trim() ? (
            <div className="col-span-full flex flex-col items-center gap-4 py-20 text-center">
              <Search className="w-10 h-10 text-white/10" />
              <p className="text-sm font-black text-white/20 uppercase tracking-widest">No decks match "{search}"</p>
            </div>
          ) : (
            filteredDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                name={deck.name}
                count={deck.cardCount}
                mastery={deck.masteryPercentage || 0}
                emoji={deck.emoji || '📁'}
                subject={getSubject(deck.name)}
                dueCount={getDueCount(deck.id)}
                lastStudied={lastStudiedByDeck[deck.id]}
                onClick={() => router.push(`/practice/${deck.id}`)}
              />
            ))
          )}

          {/* New Deck Placeholder — always visible unless searching */}
          {!search.trim() && (
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
          )}
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
            { label: '7 Day Fire',     emoji: '🔥', locked: stats.streak < 7  },
            { label: 'First Forge',    emoji: '⚡', locked: decks.length < 1  },
            { label: 'Science Pro',    emoji: '🧪', locked: stats.totalCards < 50  },
            { label: 'Master of 100',  emoji: '💯', locked: stats.masteredCards < 100 },
            { label: 'Night Owl',      emoji: '🦉', locked: new Date().getHours() < 21 || stats.totalDecks < 3 },
            { label: 'Deck Builder',   emoji: '📚', locked: stats.totalDecks < 5 },
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