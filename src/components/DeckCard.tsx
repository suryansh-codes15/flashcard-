'use client';

import { Clock, ChevronRight } from 'lucide-react';

interface Props {
  name: string;
  count: number;
  mastery: number;
  emoji?: string;
  subject: 'math' | 'science' | 'geography' | 'history' | 'language';
  dueCount?: number;
  lastStudied?: string; // ISO date string
  onClick: () => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 2)   return 'just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 30)  return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function DeckCard({
  name, count, mastery, emoji = '📁', subject, dueCount = 0, lastStudied, onClick,
}: Props) {
  const configs = {
    math:      { bg: 'from-[#059669]/20 to-[#047857]/5', border: 'border-emerald-500/20', accent: 'bg-emerald-500',  glow: 'rgba(5,150,105,.35)'  },
    science:   { bg: 'from-[#7c3aed]/20 to-[#6d28d9]/5', border: 'border-purple-500/20',  accent: 'bg-purple-500',   glow: 'rgba(124,58,237,.35)' },
    geography: { bg: 'from-[#2563eb]/20 to-[#1d4ed8]/5', border: 'border-blue-500/20',    accent: 'bg-blue-500',     glow: 'rgba(37,99,235,.35)'  },
    history:   { bg: 'from-[#db2777]/20 to-[#be185d]/5', border: 'border-pink-500/20',    accent: 'bg-pink-500',     glow: 'rgba(219,39,119,.35)' },
    language:  { bg: 'from-[#d97706]/20 to-[#b45309]/5', border: 'border-amber-500/20',   accent: 'bg-amber-500',    glow: 'rgba(217,119,6,.35)'  },
  };

  const config = configs[subject] || configs.science;
  const hasDue = dueCount > 0;

  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left p-6 rounded-[16px] border-2 ${config.border} bg-gradient-to-br ${config.bg}
        hover:-translate-y-1 transition-all duration-300 group overflow-hidden`}
      style={{ boxShadow: `0 4px 24px -8px rgba(0,0,0,.4)` }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 12px 40px -10px ${config.glow}`)}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 4px 24px -8px rgba(0,0,0,.4)`)}
    >
      {/* Due badge */}
      {hasDue && (
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">
            {dueCount} due
          </span>
        </div>
      )}

      {/* Header row */}
      <div className="flex justify-between items-start mb-5 pr-16">
        <div className="text-3xl drop-shadow-lg group-hover:scale-110 transition-transform">
          {emoji}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Mastery</span>
          <span className="text-sm font-black text-white">{mastery}%</span>
        </div>
      </div>

      {/* Name + count */}
      <div className="mb-5">
        <h3 className="text-xl font-black text-white mb-1 line-clamp-1">{name}</h3>
        <div className="flex items-center gap-3">
          <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
            {count} cards
          </p>
          {lastStudied && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-white/25">
              <Clock className="w-2.5 h-2.5" />
              {timeAgo(lastStudied)}
            </div>
          )}
        </div>
      </div>

      {/* Mastery bar */}
      <div className="space-y-2">
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full ${config.accent} transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,255,255,0.2)]`}
            style={{ width: `${mastery}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">SM-2 Active</span>
          {/* "Continue" hover CTA */}
          {hasDue ? (
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1
              opacity-0 group-hover:opacity-100 transition-opacity">
              Continue <ChevronRight className="w-3 h-3" />
            </span>
          ) : (
            <span className="text-[9px] font-black text-emerald-400/50 uppercase tracking-widest">
              Up to date ✓
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
