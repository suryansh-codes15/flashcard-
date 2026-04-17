'use client';

import { motion } from 'framer-motion';

interface Props {
  stats: {
    totalCards: number;
    masteryPercentage: number;
    dueToday: number;
    totalDecks: number;
  };
}

export default function DashboardStatsRow({ stats }: Props) {
  const items = [
    { label: 'Total Cards', value: stats.totalCards, color: 'text-purple-400', unit: '' },
    { label: 'Accuracy', value: stats.masteryPercentage, color: 'text-green-400', unit: '%' },
    { label: 'Due Now', value: stats.dueToday, color: 'text-amber-400', unit: '' },
    { label: 'Collections', value: stats.totalDecks, color: 'text-pink-400', unit: '' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <div 
          key={item.label}
          className="bg-[#0f0a1e] border border-white/5 p-6 rounded-[12px] flex flex-col gap-1 shadow-xl hover:border-purple-500/20 transition-all"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">
            {item.label}
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-black ${item.color}`}>
              {item.value}
            </span>
            <span className={`text-sm font-black ${item.color} opacity-60`}>{item.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
