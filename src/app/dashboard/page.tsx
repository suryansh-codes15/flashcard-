'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useFlashcardStore } from '@/store/flashcard-store';
import { useStudyStats } from '@/hooks/useStudyStats';
import MascotCharacter from '@/components/MascotCharacter';
import XPBar from '@/components/XPBar';
import StreakBadge from '@/components/StreakBadge';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5)  return 'Burning the midnight oil, Suryansh 🌙';
  if (h < 12) return 'Good morning, Suryansh 👋';
  if (h < 17) return 'Good afternoon, Suryansh 👋';
  if (h < 21) return 'Good evening, Suryansh 🌆';
  return 'Still at it, Suryansh! 🌙';
}

function StatCard({ label, value, delay }: { label: string; value: string | number; delay: string }) {
  return (
    <div 
      className="p-6 rounded-2xl flex flex-col justify-center bg-surface border border-white/5 shadow-2xl animate-fade-up"
      style={{ animationDelay: delay, animationFillMode: 'both', background: '#1a1040' }}
    >
      <span className="text-3xl font-black text-white mb-2">{value}</span>
      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { decks, getDueCount } = useFlashcardStore();
  const stats = useStudyStats();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'math': return 'from-[#0a2c1c] to-[#134e35] border-emerald-500/20';
      case 'geography': return 'from-[#0c2240] to-[#1e3a5f] border-blue-500/20';
      case 'history': return 'from-[#2c1000] to-[#4a1c00] border-amber-500/20';
      case 'language': return 'from-[#2c0020] to-[#4a0030] border-pink-500/20';
      default: return 'from-[#1a0f3a] to-[#2d1b69] border-purple-500/20';
    }
  };

  const getSubjectName = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('math') || n.includes('calc')) return 'math';
    if (n.includes('geo')  || n.includes('map'))  return 'geography';
    if (n.includes('hist') || n.includes('war'))  return 'history';
    if (n.includes('phrase') || n.includes('lang')) return 'language';
    return 'science';
  };

  return (
    <div className="min-h-screen py-10 px-6 max-w-7xl mx-auto space-y-12">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 py-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tight">
            {getGreeting()}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#0f0a1e]/50 p-3 px-6 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-lg">🪙</span>
            <div>
              <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none">Total XP</div>
              <div className="text-[14px] font-bold text-white mt-0.5">{stats.totalXP}</div>
            </div>
          </div>
          <div className="h-10 w-[1px] bg-white/5 mx-1" />
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <div>
              <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none">Level</div>
              <div className="text-[14px] font-bold text-white mt-0.5">Lv {stats.level}</div>
            </div>
          </div>
          <div className="h-10 w-[1px] bg-white/5 mx-1" />
          <div className="flex items-center gap-2 animate-streak-fire">
            <span className="text-xl">🔥</span>
            <div>
              <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none">Streak</div>
              <div className="text-[14px] font-bold text-white mt-0.5">{stats.streak} Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS ROW */}
      {decks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Cards" value={stats.totalCards} delay="0s" />
          <StatCard label="Accuracy" value={`${stats.accuracy}%`} delay="0.1s" />
          <StatCard label="Due Now" value={stats.dueNow} delay="0.2s" />
          <StatCard label="Cards Mastered" value={stats.mastered} delay="0.3s" />
        </div>
      )}

      {/* DECK GRID OR EMPTY STATE */}
      {decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-up">
          <MascotCharacter subject="science" side="left" name="Sparky" state="reading" className="w-48 h-48 mb-6 drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]" />
          <h2 className="text-3xl font-black text-white mb-3">Your forge is empty</h2>
          <p className="text-sm text-gray-500 mb-8 max-w-md text-center">
            Upload a PDF and our AI will build your first deck in seconds.
          </p>
          <button
            onClick={() => router.push('/upload')}
            className="pulse-ring px-8 py-4 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-black rounded-full transition-all flex items-center gap-2"
          >
            ⚡ Forge your first deck
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-white tracking-tight">Your Collections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {decks.map(deck => {
              const due = getDueCount(deck.id);
              return (
                <div 
                  key={deck.id}
                  onClick={() => router.push(`/study/${deck.id}`)}
                  className={`card-hover cursor-pointer p-6 rounded-[22px] bg-gradient-to-br border ${getSubjectColor(getSubjectName(deck.name))} flex flex-col justify-between min-h-[160px]`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl">{deck.emoji || '📚'}</span>
                    {due > 0 && (
                      <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-[10px] font-black text-amber-400 rounded-full uppercase tracking-widest">
                        {due} Due
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white mb-1 truncate">{deck.name}</h3>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{deck.cardCount} cards</p>
                    
                    <div className="mt-4 xp-bar h-[4px]">
                      <div className="xp-bar-fill" style={{ width: `${deck.masteryPercentage || 0}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => router.push('/upload')}
              className="flex flex-col items-center justify-center gap-4 h-full min-h-[160px] rounded-[22px] border-2 border-dashed border-white/20 bg-transparent hover:bg-white/5 hover:border-purple-500/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 transition-all">
                <Plus className="w-6 h-6 text-white/40 group-hover:text-white" />
              </div>
              <p className="text-[11px] font-black text-white/50 group-hover:text-white uppercase tracking-widest transition-colors">
                New Collection
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}