'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { useFlashcardStore } from '@/store/flashcard-store';
import { useStudyStats } from '@/hooks/useStudyStats';
import MascotCharacter from '@/components/MascotCharacter';
import XPBar from '@/components/XPBar';
import ProfilePrompt from '@/components/dashboard/ProfilePrompt';
import { supabase } from '@/lib/supabase';
import type { Deck, Flashcard } from '@/types';

function getGreeting(name: string): string {
  const h = new Date().getHours();
  if (h < 5)  return `Burning the midnight oil, ${name} 🌙`;
  if (h < 12) return `Good morning, ${name} 👋`;
  if (h < 17) return `Good afternoon, ${name} 👋`;
  if (h < 21) return `Good evening, ${name} 🌆`;
  return `Still at it, ${name}! 🌙`;
}

function StatCard({ label, value, delay, color = 'border-purple-500' }: { label: string; value: string | number; delay: string; color?: string }) {
  return (
    <div 
      className={`p-6 rounded-2xl flex flex-col justify-center bg-[#1a1040] border-t-4 ${color} border-l border-r border-b border-white/5 shadow-2xl animate-fade-up relative overflow-hidden group`}
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <span className="text-3xl font-black text-white mb-2 relative z-10">{value}</span>
      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest relative z-10">{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { decks, profile, setProfile } = useFlashcardStore();
  const stats = useStudyStats();
  const [hydrated, setHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setHydrated(true);
    
    // Attempt to sync decks if profile exists
    if (profile?.id) {
      syncHistory(profile.id);
    }
  }, [profile?.id]);

  const syncHistory = async (profileId: string) => {
    setIsSyncing(true);
    try {
      // 1. Update Profile Stats from Store to DB (Push)
      if (stats.totalXP > (profile?.xp || 0)) {
        await supabase
          .from('profiles')
          .update({ total_xp: stats.totalXP, streak_days: stats.streak })
          .eq('id', profileId);
      }

      // 2. Fetch Decks (Pull)
      const { data: dbDecks, error: decksError } = await supabase
        .from('decks')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (decksError) throw decksError;

      if (dbDecks && dbDecks.length > 0) {
        // Reconcile with store
        // For simplicity in this demo, we'll overwrite the store's decks 
        // if they are different, but we could do more complex merging
        const mappedDecks: Deck[] = dbDecks.map(d => ({
          id: d.id,
          name: d.name,
          description: d.description,
          fileName: d.file_name,
          classLevel: d.class_level,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          cardCount: d.card_count,
          masteredCount: d.mastered_count,
          masteryPercentage: d.mastery_percentage,
          emoji: d.emoji,
          templateId: d.template_id,
        }));

        // Unconditionally overwrite the store with cloud data for the active profile
        // this ensures that switching profiles correctly resets the view to the new user's content.
        useFlashcardStore.setState({ decks: mappedDecks });
        
        // Also fetch cards for these decks to populate local store
        const { data: dbCards } = await supabase
            .from('flashcards')
            .select('*')
            .in('deck_id', mappedDecks.map(d => d.id));
        
        if (dbCards) {
            const mappedCards: Flashcard[] = dbCards.map(c => ({
                id: c.id,
                deckId: c.deck_id,
                front: c.front,
                back: c.back,
                type: c.type,
                difficulty: c.difficulty,
                level: c.level,
                templateKey: c.template_key,
                colorPalette: c.color_palette,
                sourceContext: c.source_context,
                insight: c.insight,
                concept: c.concept,
                example: c.example,
                mistake: c.mistake,
                options: c.options,
                correctAnswer: c.correct_answer,
                createdAt: c.created_at,
                interval: c.interval,
                easeFactor: c.ease_factor,
                nextReviewDate: c.next_review_date,
                reviewCount: c.review_count,
                lapseCount: c.lapse_count,
            }));
            useFlashcardStore.setState({ flashcards: mappedCards });
        }
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!hydrated) return null;
  if (!profile) return <ProfilePrompt />;

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
          <div className="flex items-center gap-3 mb-1">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live Sync Active</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            {getGreeting(profile.name)}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#0f0a1e]/50 p-3 px-6 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard label="Total Cards" value={stats.totalCards} delay="0s" color="border-purple-500" />
          <StatCard 
            label="Accuracy" 
            value={stats.accuracy > 0 ? `${stats.accuracy}%` : '--'} 
            delay="0.1s" 
            color="border-emerald-500" 
          />
          <StatCard label="Due Now" value={stats.dueNow} delay="0.2s" color="border-amber-500" />
          <StatCard label="Cards Mastered" value={stats.mastered} delay="0.3s" color="border-pink-500" />
        </div>
      )}

      {stats.accuracy === 0 && stats.totalCards > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-4 animate-fade-in">
          <span className="text-xl">✨</span>
          <p className="text-sm text-emerald-400 font-bold">Start studying to track your accuracy and master your decks!</p>
        </div>
      )}

      {/* DECK GRID OR EMPTY STATE */}
      {decks.length === 0 && !isSyncing ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-up">
          <MascotCharacter subject="science" side="left" name="Sparky" state="reading" className="w-48 h-48 mb-6 drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]" />
          <h2 className="text-3xl font-black text-white mb-3">Your forge is empty, {profile.name}</h2>
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white tracking-tight">Your Collections</h2>
            {isSyncing && (
                <div className="flex items-center gap-2 text-purple-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Refreshing Collection...</span>
                </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {decks.map(deck => {
              const due = useFlashcardStore.getState().getDueCount(deck.id);
              return (
                <div 
                  key={deck.id}
                  onClick={() => router.push(`/study/${deck.id}`)}
                  className={`card-hover cursor-pointer p-6 rounded-[22px] bg-gradient-to-br border-l-[6px] border-t border-r border-b border-white/5 ${getSubjectColor(getSubjectName(deck.name))} flex flex-col justify-between min-h-[170px] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl`}
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
              className="flex flex-col items-center justify-center gap-4 h-full min-h-[170px] rounded-[22px] border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-purple-500/40 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none bg-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 transition-all">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500 opacity-0 group-hover:animate-[pulseRing_1.5s_infinite]" />
                <Plus className="w-8 h-8 text-white/40 group-hover:text-white" />
              </div>
              <p className="text-[12px] font-black text-white/40 group-hover:text-white uppercase tracking-[0.2em] transition-colors relative z-10">
                Forge Deck
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}