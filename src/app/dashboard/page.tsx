'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Zap, Flame, Target, BookOpen, Clock, 
  ChevronRight, Plus, Sparkles, TrendingUp 
} from 'lucide-react';
import { useFlashcardStore } from '@/store/flashcard-store';

export default function DashboardPage() {
  const router = useRouter();
  const { decks, getStats, getDueCount } = useFlashcardStore();
  const [stats, setStats] = useState(getStats());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setStats(getStats());
  }, [getStats]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      
      {/* Welcome Header */}
      <header className="mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Welcome back, <span className="gradient-text">Explorer</span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              Your AI tutor has prepared {stats.dueToday} cards for review today.
            </p>
          </div>
          <button 
            onClick={() => router.push('/upload')}
            className="btn-brand px-8 py-4 text-base shadow-brand"
          >
            <Plus className="w-5 h-5" />
            Create New Deck
          </button>
        </motion.div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          label="Daily Streak" 
          value={stats.streak} 
          sub="days active"
          icon={<Flame className="w-6 h-6 text-orange-500" />}
          color="rgba(249, 115, 22, 0.1)"
        />
        <StatCard 
          label="Mastery" 
          value={`${stats.masteryPercentage}%`} 
          sub="of all concepts"
          icon={<Target className="w-6 h-6 text-indigo-500" />}
          color="rgba(99, 102, 241, 0.1)"
        />
        <StatCard 
          label="Due Today" 
          value={stats.dueToday} 
          sub="cards to review"
          icon={<Clock className="w-6 h-6 text-emerald-500" />}
          color="rgba(16, 185, 129, 0.1)"
        />
        <StatCard 
          label="Knowledge" 
          value={stats.totalCards} 
          sub="total flashcards"
          icon={<BookOpen className="w-6 h-6 text-cyan-500" />}
          color="rgba(6, 182, 212, 0.1)"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Decks List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-indigo-500" />
              Your Decks
            </h2>
            <button className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 transition-colors">
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {decks.length === 0 ? (
              <div className="col-span-2 p-12 rounded-3xl border-2 border-dashed border-[var(--border)] text-center">
                <p className="text-[var(--text-secondary)] mb-4">No decks created yet.</p>
                <button onClick={() => router.push('/upload')} className="btn-secondary">
                  Upload your first PDF
                </button>
              </div>
            ) : (
              decks.map((deck) => (
                <DeckCard 
                  key={deck.id} 
                  deck={deck} 
                  dueCount={getDueCount(deck.id)}
                  onClick={() => router.push(`/practice/${deck.id}`)}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar Insights */}
        <aside className="space-y-8">
          <div className="p-8 rounded-3xl glass-panel relative overflow-hidden group">
            <div className="relative z-10">
              <Sparkles className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">AI Learning Insight</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                You're most active between <span className="font-bold text-[var(--text-primary)]">9 PM - 11 PM</span>. 
                Studying during this window increases your recall by 24%.
              </p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-24 h-24" />
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
            <h3 className="text-xl font-bold mb-4">Mastery Breakdown</h3>
            <div className="space-y-4">
              <MasteryItem label="Deep Learning" percentage={stats.masteryPercentage} color="#6366f1" />
              <MasteryItem label="Terminology" percentage={Math.min(100, stats.masteryPercentage + 12)} color="#8b5cf6" />
              <MasteryItem label="Application" percentage={Math.max(0, stats.masteryPercentage - 8)} color="#10b981" />
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon, color }: { label: string, value: string | number, sub: string, icon: React.ReactNode, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] shadow-sm"
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="text-3xl font-black mb-1 tracking-tight">{value}</div>
      <div className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">{label}</div>
      <div className="text-xs text-[var(--text-secondary)]">{sub}</div>
    </motion.div>
  );
}

function DeckCard({ deck, dueCount, onClick }: { deck: any, dueCount: number, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={onClick}
      className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] cursor-pointer group hover:border-indigo-500/30 transition-all shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{deck.emoji || '📚'}</div>
        {dueCount > 0 && (
          <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold ring-1 ring-red-500/20">
            {dueCount} due
          </span>
        )}
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-500 transition-colors truncate">{deck.name}</h3>
      <div className="flex items-center justify-between mt-6">
        <div className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-2">
          <span>{deck.cardCount} cards</span>
          <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
          <span>{Math.round((deck.masteredCount / deck.cardCount) * 100 || 0)}% mastered</span>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-secondary)] group-hover:bg-indigo-500 group-hover:text-white transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}

function MasteryItem({ label, percentage, color }: { label: string, percentage: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span style={{ color }}>{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full" 
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}