'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  History, 
  TrendingUp, 
  Target, 
  Zap, 
  Filter,
  Search,
  LayoutDashboard
} from 'lucide-react';
import { useFlashcardStore } from '@/store/flashcard-store';
import AccuracyChart from '@/components/dashboard/AccuracyChart';
import HistoryCard from '@/components/dashboard/HistoryCard';

export default function HistoryPage() {
  const router = useRouter();
  const { sessions, getStats } = useFlashcardStore();
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setStats(getStats());
  }, [getStats]);

  const sortedSessions = useMemo(() => {
    return [...sessions]
      .reverse()
      .filter(s => s.deckName.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [sessions, searchQuery]);

  const avgAccuracy = useMemo(() => {
    if (sessions.length === 0) return 0;
    const sum = sessions.reduce((acc, s) => acc + s.accuracy, 0);
    return Math.round(sum / sessions.length);
  }, [sessions]);

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-[#06040f] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard')}
              className="p-4 rounded-[20px] bg-[#0f0a1e] border border-white/5 hover:border-purple-500/30 transition-all shadow-2xl"
            >
              <ArrowLeft className="w-6 h-6 text-gray-400" />
            </motion.button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <History className="w-4 h-4 text-purple-400" />
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">Learning Intelligence</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">Study History</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-[#0f0a1e] border border-white/5 focus:border-purple-500/50 outline-none text-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* Global Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Stats Column */}
          <div className="lg:col-span-1 grid grid-cols-1 gap-4">
            {[
              { label: 'Cumulative Accuracy', value: `${avgAccuracy}%`, color: 'text-emerald-400', icon: Target, subtitle: 'Overall retention health' },
              { label: 'Total Sessions', value: sessions.length, color: 'text-purple-400', icon: TrendingUp, subtitle: 'Sessions forged to date' },
              { label: 'Neural Activity', value: `${stats.streak} Days`, color: 'text-amber-400', icon: Zap, subtitle: 'Current daily streak' },
            ].map((s, i) => (
              <motion.div 
                key={s.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[32px] bg-[#0f0a1e] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{s.label}</p>
                    <h3 className={`text-4xl font-black ${s.color} tabular-nums`}>{s.value}</h3>
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">{s.subtitle}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                </div>
                {/* Decorative background glow */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" />
              </motion.div>
            ))}
          </div>

          {/* Chart Column */}
          <div className="lg:col-span-2">
            <AccuracyChart sessions={sessions} />
          </div>
        </div>

        {/* Timeline Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <h2 className="text-xl font-black text-white uppercase tracking-widest">Neural Log</h2>
            </div>
            <div className="flex gap-2">
                <button className="p-2 px-4 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                    Filter: All Time
                </button>
            </div>
          </div>

          {sortedSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedSessions.map((session, i) => (
                <HistoryCard key={session.id} session={session} index={i} />
              ))}
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center gap-4 bg-[#0f0a1e]/30 rounded-[48px] border border-dashed border-white/5">
              <div className="p-6 rounded-full bg-white/5">
                <LayoutDashboard className="w-12 h-12 text-white/10" />
              </div>
              <p className="text-xs font-black text-white/20 uppercase tracking-[0.3em]">No session data intercepted</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
