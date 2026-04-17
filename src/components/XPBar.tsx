'use client';

interface Props {
  xp: number;
  level: number;
  className?: string;
}

export default function XPBar({ xp, level, className = "" }: Props) {
  const currentLevelXP = level * 200;
  const progress = (xp % 200) / 200 * 100;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Level Badge */}
      <div className="flex items-center justify-center px-4 py-1.5 bg-purple-600 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)] border border-purple-400">
        <span className="text-[11px] font-black tracking-widest text-white uppercase">Lv {level}</span>
      </div>

      {/* Progress Track */}
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex justify-between items-end px-1">
          <span className="text-[10px] font-black text-purple-300 tracking-[0.06em] uppercase">🪙 {xp.toLocaleString()} XP</span>
          <span className="text-[10px] font-black text-purple-300/60 uppercase">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full bg-[#1a1040] rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
