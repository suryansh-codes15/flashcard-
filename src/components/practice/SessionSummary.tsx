'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Zap, RotateCcw, LayoutDashboard, Brain, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  deckName: string;
  totalCards: number;
  stats: {
    easy: number;
    medium: number;
    hard: number;
    again: number;
  };
  aiFeedback?: string;
  isGenerating?: boolean;
  onReset: () => void;
}

export default function SessionSummary({ 
  deckName, 
  totalCards, 
  stats, 
  aiFeedback, 
  isGenerating, 
  onReset 
}: Props) {
  const router = useRouter();
  const accuracy = totalCards > 0 ? Math.round(((stats.easy + stats.medium) / totalCards) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="max-w-3xl w-full mx-auto p-[2px] bg-gradient-to-b from-purple-500/30 via-transparent to-transparent rounded-[32px] mt-12 relative"
    >
      {/* Background Glow */}
      <div className="absolute inset-x-0 -top-24 h-48 bg-purple-600/20 blur-[100px] pointer-events-none" />

      <div className="bg-[#0f0a1e]/90 border border-white/5 rounded-[30px] p-8 md:p-12 flex flex-col gap-10 shadow-2xl backdrop-blur-3xl overflow-hidden relative">
        
        {/* Animated Particles/Design Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
        
        {/* Header Section */}
        <div className="text-center relative">
          <motion.div 
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="inline-flex p-6 rounded-[28px] bg-purple-600/10 border border-purple-500/20 shadow-[0_0_50px_rgba(124,58,237,0.3)] mb-6"
          >
            <Trophy className="w-16 h-16 text-purple-400" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-white tracking-tighter drop-shadow-2xl">
              FORGE COMPLETE
            </h2>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Neural Integration Success: {deckName}
            </p>
          </div>
        </div>

        {/* AI COACH SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative group p-6 rounded-[32px] bg-gradient-to-br from-purple-600/10 to-blue-600/5 border border-white/10 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start gap-4 relative">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                AI Learning Coach
                {isGenerating && <Loader2 className="w-3 h-3 animate-spin text-purple-400" />}
              </h3>
              <div className="text-lg font-medium text-white/90 leading-relaxed min-h-[60px]">
                {isGenerating ? (
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse" />
                  </div>
                ) : aiFeedback ? (
                  aiFeedback
                ) : (
                  "Analyzing your performance patterns to generate personalized insights..."
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {[
            { label: 'Accuracy', value: `${accuracy}%`, color: 'text-emerald-400', icon: Target, delay: 0.4 },
            { label: 'Total Cards', value: totalCards, color: 'text-purple-400', icon: Brain, delay: 0.5 },
            { label: 'Perfect', value: stats.easy, color: 'text-amber-400', icon: Zap, delay: 0.6 },
            { label: 'Attempts', value: stats.again, color: 'text-rose-400', icon: AlertCircle, delay: 0.7 },
          ].map((s, i) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: s.delay }}
              className="p-6 rounded-[28px] bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors flex flex-col items-center gap-2 group"
            >
              <s.icon className={`w-5 h-5 ${s.color} group-hover:scale-110 transition-transform`} />
              <div className="text-2xl font-black text-white tabular-nums">{s.value}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-white/30">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Detailed Breakdown */}
        <div className="w-full space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-center">Consistency Spectrum</h4>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex p-[2px] border border-white/5 gap-[2px]">
            <div className="h-full bg-emerald-500 rounded-l-full transition-all duration-1000" style={{ width: `${(stats.easy/totalCards)*100}%` }} />
            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(stats.medium/totalCards)*100}%` }} />
            <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${(stats.hard/totalCards)*100}%` }} />
            <div className="h-full bg-rose-500 rounded-r-full transition-all duration-1000" style={{ width: `${(stats.again/totalCards)*100}%` }} />
          </div>
          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20">
            <span>Easy ({stats.easy})</span>
            <span>Hard ({stats.again})</span>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row gap-4 w-full relative z-10">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-3 py-6 rounded-2xl bg-purple-600 text-white font-black hover:bg-purple-500 transition-all shadow-xl shadow-purple-900/20"
          >
            <RotateCcw className="w-5 h-5 shadow-inner" />
            Study Again
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard')}
            className="flex-1 flex items-center justify-center gap-3 py-6 rounded-2xl bg-[#1a1040]/50 border border-white/10 text-white font-black transition-all"
          >
            <LayoutDashboard className="w-5 h-5" />
            Control Center
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
