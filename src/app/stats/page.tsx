'use client';

import { useFlashcardStore } from '@/store/flashcard-store';
import BarChart from '@/components/BarChart';
import HeatmapCalendar from '@/components/HeatmapCalendar';
import DashboardStatsRow from '@/components/DashboardStatsRow';
import { BarChart3, Calendar, Trophy, Zap } from 'lucide-react';

export default function StatsPage() {
  const { getStats } = useFlashcardStore();
  const stats = getStats();

  const weeklyData = [12, 45, 23, 67, 89, 44, 12];
  const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="min-h-screen py-10 px-6 max-w-7xl mx-auto space-y-12">
      
      {/* 📈 HEADER SECTION */}
      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none">
          Performance Analytics
        </span>
        <h1 className="text-4xl font-black text-white tracking-tight">Your Mastery Journey</h1>
        <p className="text-gray-500 text-sm font-medium tracking-wide">
          Tracking your daily growth and memory retention since Day 1.
        </p>
      </div>

      <DashboardStatsRow stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Weekly Activity */}
        <div className="bg-[#0f0a1e] border border-white/5 p-8 rounded-[20px] shadow-2xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600/10 text-purple-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Weekly Intensity</h2>
          </div>
          
          <BarChart data={weeklyData} labels={weeklyLabels} />
          
          <div className="pt-6 border-t border-white/5 flex gap-10">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Weekly Avg</p>
              <p className="text-2xl font-black text-white">45.2</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Peak Day</p>
              <p className="text-2xl font-black text-purple-400">Friday</p>
            </div>
          </div>
        </div>

        {/* Global Persistence */}
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
                <p className="text-base font-black text-white">12 Days</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <Zap className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Cards Forged</p>
                <p className="text-base font-black text-white">1,482</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
