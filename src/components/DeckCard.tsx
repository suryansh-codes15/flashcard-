'use client';

import { BookOpen } from 'lucide-react';

interface Props {
  name: string;
  count: number;
  mastery: number;
  emoji?: string;
  subject: 'math' | 'science' | 'geography' | 'history' | 'language';
  onClick: () => void;
}

export default function DeckCard({ name, count, mastery, emoji = '📁', subject, onClick }: Props) {
  const configs = {
    math: { bg: 'from-[#059669]/20 to-[#047857]/5', border: 'border-emerald-500/20', accent: 'bg-emerald-500' },
    science: { bg: 'from-[#7c3aed]/20 to-[#6d28d9]/5', border: 'border-purple-500/20', accent: 'bg-purple-500' },
    geography: { bg: 'from-[#2563eb]/20 to-[#1d4ed8]/5', border: 'border-blue-500/20', accent: 'bg-blue-500' },
    history: { bg: 'from-[#db2777]/20 to-[#be185d]/5', border: 'border-pink-500/20', accent: 'bg-pink-500' },
    language: { bg: 'from-[#d97706]/20 to-[#b45309]/5', border: 'border-amber-500/20', accent: 'bg-amber-500' },
  };

  const config = configs[subject] || configs.science;

  return (
    <button 
      onClick={onClick}
      className={`relative w-full text-left p-6 rounded-[16px] border-2 ${config.border} bg-gradient-to-br ${config.bg} 
      hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-all group`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="text-3xl drop-shadow-lg group-hover:scale-110 transition-transform">{emoji}</div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Mastery</span>
          <span className="text-sm font-black text-white">{mastery}%</span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-black text-white mb-1 line-clamp-1">{name}</h3>
        <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
          {count} Flashcards
        </p>
      </div>

      <div className="space-y-2">
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full ${config.accent} transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,255,255,0.2)]`}
            style={{ width: `${mastery}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">Status</span>
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">SM-2 Ready</span>
        </div>
      </div>
    </button>
  );
}
