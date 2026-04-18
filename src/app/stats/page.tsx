'use client';

import { useFlashcardStore } from '@/store/flashcard-store';
import { useStudyStats } from '@/hooks/useStudyStats';
import MascotCharacter from '@/components/MascotCharacter';
import { useRouter } from 'next/navigation';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StatsPage() {
  const router = useRouter();
  const { sessions } = useFlashcardStore();
  const stats = useStudyStats();

  // If literally 0 sessions exist, show the requested Empty State
  if (sessions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <MascotCharacter subject="science" side="left" name="Sparky" state="reading" className="w-48 h-48 drop-shadow-[0_0_30px_rgba(139,92,246,0.3)] mb-8" />
        <h1 className="text-3xl font-black text-white mb-4">Your mastery journey starts here</h1>
        <p className="text-sm text-gray-500 mb-10 max-w-md">
          Complete your first study session to unlock performance analytics, streak tracking, and XP rewards.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/upload')}
            className="pulse-ring px-6 py-3 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-black rounded-full transition-all flex items-center gap-2"
          >
            ⚡ Forge a deck
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 active:scale-95 text-white font-black rounded-full transition-all border border-white/10"
          >
            📚 Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- Calculations ---
  const { weeklyData, mastered, learning, newShaky, totalCards, longestStreak } = stats;

  // Max value in weekly data to scale the CSS flex bars
  const maxWeekly = Math.max(...weeklyData, 1);
  const currentDayOfWeek = new Date().getDay(); // 0 = Sun, 1 = Mon ...
  const monToSunLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // To highlight today's bar, we need today's index in Mon-Sun
  const todayIndex = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

  // Persistence Grid 10x7
  // Generate last 70 days
  const heatmapDays: { date: Date; count: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 69; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    
    // Calculate cards reviewed for this day
    const cardsOnDay = sessions.reduce((acc, s) => {
      const sDate = new Date(s.startedAt);
      sDate.setHours(0,0,0,0);
      if (sDate.getTime() === d.getTime()) {
        return acc + s.cardsStudied;
      }
      return acc;
    }, 0);

    heatmapDays.push({
      date: d,
      count: cardsOnDay
    });
  }

  const maxHeatmap = Math.max(...heatmapDays.map(d => d.count), 1);

  return (
    <div className="min-h-screen py-10 px-6 max-w-5xl mx-auto space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tight">Your Mastery Journey</h1>
        <p className="text-gray-500 text-sm font-medium tracking-wide">
          {sessions.length} study sessions logged · {totalCards} cards tracked
        </p>
      </div>

      {/* Basic summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-[#1a1040] border border-white/5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Streak</p>
          <p className="text-3xl font-black text-white">{stats.streak} <span className="text-sm text-gray-500">Days</span></p>
        </div>
        <div className="p-6 rounded-2xl bg-[#1a1040] border border-white/5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Longest Streak</p>
          <p className="text-3xl font-black text-white">{stats.longestStreak} <span className="text-sm text-gray-500">Days</span></p>
        </div>
        <div className="p-6 rounded-2xl bg-[#1a1040] border border-white/5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total XP</p>
          <p className="text-3xl font-black text-white">{stats.totalXP}</p>
        </div>
        <div className="p-6 rounded-2xl bg-[#1a1040] border border-white/5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cards Reviewed</p>
          <p className="text-3xl font-black text-white">{stats.cardsReviewed}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Weekly Bar Chart */}
        <div className="p-8 rounded-[20px] bg-[#0f0a1e] border border-white/5 shadow-2xl flex flex-col justify-between h-[300px]">
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Weekly Intensity</h2>
          
          <div className="flex-1 flex items-end justify-between gap-2 h-full">
            {weeklyData.map((val, i) => {
              const heightPct = val === 0 ? 5 : (val / maxWeekly) * 100;
              const isToday = i === todayIndex;
              return (
                <div key={i} className="flex flex-col items-center gap-2 group flex-1">
                  <div className="w-full relative h-[150px] flex items-end justify-center rounded-sm">
                    <div 
                      className={`w-full rounded-md transition-all duration-700 ease-out ${isToday ? 'bg-purple-500 shadow-[0_0_15px_rgba(124,58,237,0.4)]' : 'bg-[#1a1040] group-hover:bg-[#2d1b69]'}`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <div className="absolute -top-8 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-1 rounded">
                      {val}
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isToday ? 'text-purple-400' : 'text-gray-500'}`}>
                    {monToSunLabels[i]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Persistence Grid */}
        <div className="p-8 rounded-[20px] bg-[#0f0a1e] border border-white/5 shadow-2xl h-[300px] flex flex-col">
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Persistence Grid</h2>
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-[repeat(10,1fr)] grid-rows-7 gap-[2px] h-full">
               {/* Transpose the array to fit 10 cols x 7 rows. 
                   Usually GitHub graph is cols=weeks, rows=days.
                   We have 70 days. Day 0 .. Day 69
               */}
               {Array.from({ length: 70 }).map((_, i) => {
                 // To fill Top->Bottom (7 rows), Left->Right (10 cols):
                 // The day index is (colIndex * 7) + rowIndex
                 const col = Math.floor(i / 7);
                 const row = i % 7;
                 const dayIndex = col * 7 + row; // 0 to 69
                 
                 const day = heatmapDays[dayIndex];
                 if (!day) return <div key={i} />;

                 let opacity = 0;
                 if (day.count > 0) {
                   opacity = Math.max(0.2, day.count / maxHeatmap);
                 }

                 return (
                   <div 
                    key={i} 
                    className="w-full h-full rounded-[2px]"
                    style={{ 
                      backgroundColor: day.count > 0 ? `rgba(124, 58, 237, ${opacity})` : '#1a1040',
                      border: day.count > 0 ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent'
                    }}
                    title={`${day.date.toDateString()}: ${day.count} cards`}
                   />
                 )
               })}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <span>Last 70 days</span>
            <div className="flex items-center gap-1">
              <span>Less</span>
              <div className="w-3 h-3 rounded-[2px] bg-[#1a1040]" />
              <div className="w-3 h-3 rounded-[2px] bg-purple-500/40" />
              <div className="w-3 h-3 rounded-[2px] bg-purple-500/70" />
              <div className="w-3 h-3 rounded-[2px] bg-purple-500" />
              <span>More</span>
            </div>
          </div>
        </div>

      </div>

      {/* Mastery Breakdown */}
      <div className="p-8 rounded-[20px] bg-[#0f0a1e] border border-white/5 shadow-2xl">
        <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Mastery Breakdown</h2>
        
        {totalCards > 0 ? (
          <div className="space-y-4">
             {/* Stacking horizontal bar */}
             <div className="h-6 w-full rounded-full flex overflow-hidden">
               <div style={{ width: `${(mastered/totalCards)*100}%` }} className="h-full bg-emerald-500" />
               <div style={{ width: `${(learning/totalCards)*100}%` }} className="h-full bg-amber-500" />
               <div style={{ width: `${(newShaky/totalCards)*100}%` }} className="h-full bg-rose-500" />
             </div>
             {/* Legend */}
             <div className="flex gap-6 justify-center mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-bold text-white">{mastered} Mastered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm font-bold text-white">{learning} Learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-sm font-bold text-white">{newShaky} New / Shaky</span>
                </div>
             </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center">Not enough data for breakdown.</p>
        )}
      </div>

    </div>
  );
}
