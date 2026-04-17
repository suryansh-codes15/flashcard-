'use client';

interface Props {
  data: number[];
  labels: string[];
}

export default function BarChart({ data, labels }: Props) {
  const max = Math.max(...data, 10);

  return (
    <div className="flex items-end justify-between h-48 gap-2 px-2 mt-8">
      {data.map((val, i) => {
        const height = (val / max) * 100;
        const isToday = i === new Date().getDay() - 1; // Simplification for demo

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
            <div className="relative w-full flex flex-col items-center justify-end h-full">
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-[#1a1040] border border-purple-500/30 px-3 py-1 rounded-lg text-[10px] font-black text-purple-300 z-10 whitespace-nowrap shadow-xl">
                {val} Cards
              </div>
              
              {/* Bar */}
              <div 
                className={`w-full max-w-[32px] rounded-t-lg transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(124,58,237,0.1)] group-hover:shadow-[0_0_30px_rgba(124,58,237,0.3)]
                  ${isToday ? 'bg-purple-500' : 'bg-[#1a1040] group-hover:bg-purple-600/40'}`}
                style={{ height: `${height}%` }}
              />
            </div>
            
            <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-purple-400' : 'text-gray-600'}`}>
              {labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
