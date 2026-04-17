'use client';

import { useRouter } from 'next/navigation';
import { Trophy, Target, Zap, RotateCcw, LayoutDashboard, Brain } from 'lucide-react';

interface Props {
  deckName: string;
  totalCards: number;
  stats: {
    easy: number;
    medium: number;
    hard: number;
  };
  onReset: () => void;
}

export default function SessionSummary({ deckName, totalCards, stats, onReset }: Props) {
  const router = useRouter();
  const accuracy = totalCards > 0 ? Math.round(((stats.easy + stats.medium) / totalCards) * 100) : 0;

  return (
    <div className="max-w-2xl w-full mx-auto p-1 py-1 bg-gradient-to-b from-purple-500/20 to-transparent rounded-[32px] mt-12">
      <div className="bg-[#0f0a1e] border border-white/5 rounded-[30px] p-10 flex flex-col items-center gap-10 shadow-2xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-5 rounded-[24px] bg-purple-600/10 border border-purple-500/20 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
            <Trophy className="w-12 h-12 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-white tracking-tight">Forge Complete!</h2>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-purple-400">
              Mastery increased for {deckName}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
          {[
            { label: 'Accuracy', value: `${accuracy}%`, color: 'text-emerald-400', icon: Target },
            { label: 'Studied', value: totalCards, color: 'text-purple-400', icon: Brain },
            { label: 'Mastered', value: stats.easy, color: 'text-amber-400', icon: Zap },
          ].map((s) => (
            <div key={s.label} className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 flex flex-col items-center gap-2">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-white/30">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Motivational Quote */}
        <div className="p-6 rounded-[24px] bg-purple-600/5 border border-purple-500/10 w-full text-center italic text-sm text-purple-200/50">
          "The best way to predict your future performance is to forge your knowledge today."
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button 
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl bg-purple-600 text-white font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-900/20"
          >
            <RotateCcw className="w-5 h-5" />
            Study Again
          </button>
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl bg-[#1a1040] border border-white/10 text-white font-black hover:bg-white/5 transition-all"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
