'use client';
import { motion } from 'framer-motion';
import { 
  Trophy, Target, Zap, Clock, TrendingUp, 
  RotateCcw, LayoutDashboard, Sparkles, BrainCircuit
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  stats: {
    easy: number;
    medium: number;
    hard: number;
    correctMCQ: number;
  };
  totalCards: number;
  deckName: string;
  aiNote?: string | null;
  onReset: () => void;
}

export default function SessionSummary({ stats, totalCards, deckName, aiNote, onReset }: Props) {
  const router = useRouter();
  const accuracy = totalCards > 0 ? Math.round(((stats.easy + stats.correctMCQ) / totalCards) * 100) : 0;
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-2xl w-full mx-auto p-8 rounded-[2.5rem] relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
      
      {/* Header */}
      <motion.div variants={item} className="text-center mb-10">
        <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
          <Trophy className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight mb-2">Session Complete</h2>
        <p className="text-white/40 font-medium">Elevating your knowledge in <span className="text-indigo-400">{deckName}</span></p>
      </motion.div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Accuracy', value: `${accuracy}%`, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Completed', value: totalCards, icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Mastered', value: stats.easy, icon: BrainCircuit, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Stretches', value: stats.hard, icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-500/10' },
        ].map((s, i) => (
          <motion.div 
            key={i}
            variants={item}
            className={`p-5 rounded-3xl ${s.bg} border border-white/5 flex flex-col items-center gap-2`}
          >
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <span className="text-2xl font-black text-white">{s.value}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{s.label}</span>
          </motion.div>
        ))}
      </div>

      {/* AI Teacher's Note */}
      <motion.div 
        variants={item}
        className="p-6 rounded-3xl bg-white/5 border border-white/5 relative overflow-hidden mb-8"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="w-12 h-12 text-indigo-400" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Personalized Insights</span>
        </div>
        {aiNote ? (
          <p className="text-white/80 leading-relaxed font-medium italic">"{aiNote}"</p>
        ) : (
          <div className="flex items-center gap-3 text-white/30 italic text-sm">
            <div className="w-4 h-4 rounded-full border-2 border-white/10 border-t-indigo-500 animate-spin" />
            Generating teacher's note...
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={onReset}
          className="flex-1 btn-brand group"
        >
          <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" />
          Study Again
        </button>
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex-1 py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
        >
          <LayoutDashboard className="w-4 h-4" />
          Go to Dashboard
        </button>
      </motion.div>
    </motion.div>
  );
}
