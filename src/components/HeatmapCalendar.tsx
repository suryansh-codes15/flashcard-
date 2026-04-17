'use client';

import { useState, useEffect } from 'react';

export default function HeatmapCalendar() {
  const [days, setDays] = useState<number[]>([]);

  useEffect(() => {
    // Generate mock data only on client mount
    const mockData = Array.from({ length: 91 }).map(() => Math.floor(Math.random() * 4));
    setDays(mockData);
  }, []);

  const getColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-[#1a1040]/30'; // Empty
      case 1: return 'bg-purple-900/40';
      case 2: return 'bg-purple-700/60';
      case 3: return 'bg-purple-500';
      default: return 'bg-[#1a1040]/30';
    }
  };

  if (days.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-[3px]">
          {Array.from({ length: 91 }).map((_, i) => (
            <div key={i} className="w-[12px] h-[12px] rounded-sm bg-[#1a1040]/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-[3px]">
        {days.map((level, i) => (
          <div 
            key={i}
            className={`w-[12px] h-[12px] rounded-sm transition-all hover:scale-150 hover:z-10 cursor-help ${getColor(level)}`}
            title={`Day ${i}: ${level ? level * 10 : 0} cards`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[9px] font-black text-gray-600 uppercase tracking-widest px-1">
        <span>Less intense</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map(l => (
            <div key={l} className={`w-2 h-2 rounded-sm ${getColor(l)}`} />
          ))}
        </div>
        <span>High intensity</span>
      </div>
    </div>
  );
}
