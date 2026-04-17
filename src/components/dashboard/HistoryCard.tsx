'use client';

import { motion } from 'framer-motion';
import { Calendar, Target, Brain, ArrowUpRight, ArrowDownRight, Sparkles, AlertCircle } from 'lucide-react';
import { StudySession } from '@/types';

interface Props {
  session: StudySession;
  index: number;
}

export default function HistoryCard({ session, index }: Props) {
  const isGood = session.accuracy >= 80;
  const isNeutral = session.accuracy >= 60 && session.accuracy < 80;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative p-6 rounded-[32px] bg-[#0f0a1e]/50 border border-white/5 hover:border-purple-500/30 transition-all backdrop-blur-md overflow-hidden"
    >
      {/* Subject Badge */}
      <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest">
        {session.deckName}
      </div>

      <div className="flex flex-col gap-6">
        {/* Date & Accuracy */}
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${isGood ? 'bg-emerald-500/10' : isNeutral ? 'bg-blue-500/10' : 'bg-rose-500/10'} border border-white/5`}>
            <Target className={`w-6 h-6 ${isGood ? 'text-emerald-400' : isNeutral ? 'text-blue-400' : 'text-rose-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">{session.accuracy}%</span>
              {session.improvement !== 0 && (
                <div className={`flex items-center text-[10px] font-bold ${session.improvement > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {session.improvement > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(session.improvement)}%
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-white/30 font-bold uppercase tracking-widest">
              <Calendar className="w-3 h-3" />
              {new Date(session.finishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* AI Insight Snippet */}
        {session.aiNote && (
          <div className="p-4 rounded-2xl bg-purple-600/5 border border-white/5 relative group-hover:bg-purple-600/10 transition-colors">
            <Sparkles className="absolute -top-2 -left-2 w-4 h-4 text-amber-400/50" />
            <p className="text-xs text-purple-200/60 leading-relaxed italic line-clamp-2">
              "{session.aiNote}"
            </p>
          </div>
        )}

        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <Brain className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-xs font-black text-white">{session.cardsStudied}</div>
              <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Cards</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <div>
              <div className="text-xs font-black text-white">{session.stats.again}</div>
              <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Mistakes</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
