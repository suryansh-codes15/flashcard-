'use client';

import { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { StudySession } from '@/types';

interface Props {
  sessions: StudySession[];
}

export default function AccuracyChart({ sessions }: Props) {
  const data = useMemo(() => {
    return sessions
      .slice(-10) // Last 10 sessions
      .map(s => ({
        date: new Date(s.finishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        accuracy: s.accuracy,
        name: s.deckName
      }));
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">No Neural Data Available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] p-6 rounded-[32px] bg-[#0f0a1e]/50 border border-white/5 backdrop-blur-xl relative overflow-hidden group">
      {/* Cinematic Accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Accuracy Trends</h3>
          <p className="text-[9px] font-black uppercase tracking-widest text-purple-400">Cognitive Retention Analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Mastery %</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="75%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#ffffff30', fontSize: 10, fontWeight: 800 }} 
            dy={10}
          />
          <YAxis 
            domain={[0, 100]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#ffffff30', fontSize: 10, fontWeight: 800 }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f0a1e', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '900',
              color: '#fff'
            }}
            itemStyle={{ color: '#a855f7' }}
          />
          <Area 
            type="monotone" 
            dataKey="accuracy" 
            stroke="#a855f7" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorAcc)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
