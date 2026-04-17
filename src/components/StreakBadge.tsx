'use client';

interface Props {
  streak: number;
  className?: string;
}

export default function StreakBadge({ streak, className = "" }: Props) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 bg-[#d97706]/10 border border-[#d97706]/30 rounded-[20px] shadow-sm ${className}`}>
      <span className="text-lg animate-streak inline-block">🔥</span>
      <span className="text-[11px] font-black text-[#fbbf24] tracking-widest uppercase">
        {streak} Day Streak
      </span>
    </div>
  );
}
