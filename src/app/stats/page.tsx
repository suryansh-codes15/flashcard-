'use client';

import { useFlashcardStore } from '@/store/flashcard-store';
import BarChart from '@/components/BarChart';
import HeatmapCalendar from '@/components/HeatmapCalendar';
import DashboardStatsRow from '@/components/DashboardStatsRow';
import { BarChart3, Calendar, Trophy, Zap, TrendingUp, BookOpen } from 'lucide-react';
import { useMemo } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StatsPage() {
  const { getStats, sessions, flashcards } = useFlashcardStore();
  const stats = getStats();

  // ── Real weekly data (cards studied per day, last 7 days) ──────────
  const { weeklyData, weeklyLabels, weeklyAvg, peakDay } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Build a map: day-start timestamp → cardsStudied total
    const dayMap: Record<number, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      dayMap[d.getTime()] = 0;
    }

    sessions.forEach((s) => {
      const d = new Date(s.finishedAt || s.startedAt);
      d.setHours(0, 0, 0, 0);
      if (dayMap[d.getTime()] !== undefined) {
        dayMap[d.getTime()] += s.cardsStudied || 0;
      }
    });

    const sortedKeys = Object.keys(dayMap).map(Number).sort((a, b) => a - b);
    const data   = sortedKeys.map((k) => dayMap[k]);
    const labels = sortedKeys.map((k) => DAYS[new Date(k).getDay()]);

    const nonZero = data.filter((v) => v > 0);
    const avg     = nonZero.length > 0 ? (nonZero.reduce((a, b) => a + b, 0) / nonZero.length).toFixed(1) : '0';
    const maxIdx  = data.indexOf(Math.max(...data));
    const peak    = data[maxIdx] > 0 ? labels[maxIdx] : '—';

    return { weeklyData: data, weeklyLabels: labels, weeklyAvg: avg, peakDay: peak };
  }, [sessions]);

  // ── Mastery breakdown ─────────────────────────────────────────────
  const masteryBreakdown = useMemo(() => {
    const total    = flashcards.length;
    const mastered = flashcards.filter((c) => c.interval >= 21).length;
    const learning = flashcards.filter((c) => c.interval >= 4 && c.interval < 21).length;
    const fresh    = total - mastered - learning;
    return { mastered, learning, fresh, total };
  }, [flashcards]);

  // ── Total XP from sessions ────────────────────────────────────────
  const totalSessionXP = useMemo(() =>
    sessions.reduce((acc, s) => acc + (s.cardsStudied * 5) + (s.accuracy > 80 ? 50 : 0), 0),
  [sessions]);

  // ── Recent accuracy trend ─────────────────────────────────────────
  const recentAccuracy = useMemo(() => {
    const last5 = sessions.slice(-5);
    return last5.length > 0
      ? Math.round(last5.reduce((a, s) => a + s.accuracy, 0) / last5.length)
      : 0;
  }, [sessions]);

  return (
    <div className="min-h-screen py-10 px-6 max-w-7xl mx-auto space-y-12">

      {/* 📈 HEADER */}
      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none">
          Performance Analytics
        </span>
        <h1 className="text-4xl font-black text-white tracking-tight">Your Mastery Journey</h1>
        <p className="text-gray-500 text-sm font-medium tracking-wide">
          {sessions.length > 0
            ? `${sessions.length} study sessions logged · ${stats.totalCards} cards tracked`
            : 'Complete your first practice session to see your stats here.'}
        </p>
      </div>

      <DashboardStatsRow stats={stats} />

      {/* ── Mastery Breakdown ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Mastered',  count: masteryBreakdown.mastered, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', desc: 'interval ≥ 21d' },
          { label: 'Learning',  count: masteryBreakdown.learning, color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   desc: 'interval 4–20d' },
          { label: 'New / Shaky', count: masteryBreakdown.fresh,  color: 'text-rose-400',    bg: 'bg-rose-500/10',   border: 'border-rose-500/20',   desc: 'needs more review' },
        ].map((item) => (
          <div key={item.label} className={`p-6 rounded-[16px] border ${item.border} ${item.bg} space-y-2`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{item.label}</p>
            <p className={`text-4xl font-black ${item.color}`}>{item.count}</p>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-wider">{item.desc}</p>
            {masteryBreakdown.total > 0 && (
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full ${item.color.replace('text-', 'bg-')}`}
                  style={{ width: `${Math.round((item.count / masteryBreakdown.total) * 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Weekly Activity — real data */}
        <div className="bg-[#0f0a1e] border border-white/5 p-8 rounded-[20px] shadow-2xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600/10 text-purple-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Weekly Intensity</h2>
          </div>

          {weeklyData.every((v) => v === 0) ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <BookOpen className="w-8 h-8 text-white/10" />
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No sessions this week yet</p>
            </div>
          ) : (
            <BarChart data={weeklyData} labels={weeklyLabels} />
          )}

          <div className="pt-6 border-t border-white/5 flex gap-10">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Weekly Avg</p>
              <p className="text-2xl font-black text-white">{weeklyAvg}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Peak Day</p>
              <p className="text-2xl font-black text-purple-400">{peakDay}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Recent Accuracy</p>
              <p className="text-2xl font-black text-emerald-400">{recentAccuracy}%</p>
            </div>
          </div>
        </div>

        {/* Calendar + Real Stats */}
        <div className="bg-[#0f0a1e] border border-white/5 p-8 rounded-[20px] shadow-2xl space-y-8 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-400">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Persistence Grid</h2>
            </div>
            <HeatmapCalendar />
          </div>

          <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Longest Streak</p>
                <p className="text-base font-black text-white">{stats.streak} Days</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <Zap className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Total XP</p>
                <p className="text-base font-black text-white">{stats.xp.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Sessions Done</p>
                <p className="text-base font-black text-white">{sessions.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Cards Mastered</p>
                <p className="text-base font-black text-white">{stats.masteredCards}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
