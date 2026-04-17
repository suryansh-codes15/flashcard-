'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { RotateCcw, LayoutDashboard, CheckCircle2, XCircle } from 'lucide-react';

interface CardResult {
  front: string;
  rating: 'easy' | 'medium' | 'hard' | 'again';
}

interface Props {
  deckName: string;
  totalCards: number;
  stats: { easy: number; medium: number; hard: number; again: number };
  cardResults?: CardResult[];
  aiFeedback?: string;
  isGenerating?: boolean;
  onReset: () => void;
}

function getGrade(pct: number) {
  if (pct >= 90) return { label: 'S', color: '#FFD700', shadow: 'rgba(255,215,0,.4)',  msg: "Legendary! You've completely dominated this deck! 🚀" };
  if (pct >= 75) return { label: 'A', color: '#4ade80', shadow: 'rgba(74,222,128,.35)', msg: "Excellent work! Keep that momentum going! ⚡" };
  if (pct >= 55) return { label: 'B', color: '#38bdf8', shadow: 'rgba(56,189,248,.35)', msg: "Solid session. A few more rounds and you'll ace it! 💪" };
  return          { label: 'C', color: '#f87171', shadow: 'rgba(248,113,113,.35)', msg: "Rough session — but showing up is what matters. 🌱" };
}

function ScoreRing({ pct }: { pct: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(circ);

  useEffect(() => {
    const t = setTimeout(() => setDash(circ - (pct / 100) * circ), 300);
    return () => clearTimeout(t);
  }, [pct, circ]);

  return (
    <svg width="148" height="148" viewBox="0 0 148 148">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#7c3aed"/>
          <stop offset="100%" stopColor="#00FFFF"/>
        </linearGradient>
      </defs>
      {/* Track */}
      <circle cx="74" cy="74" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="13"/>
      {/* Fill */}
      <circle
        cx="74" cy="74" r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="13"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        strokeLinecap="round"
        style={{
          transition: 'stroke-dashoffset 1.3s cubic-bezier(0.34,1.56,0.64,1)',
          transform: 'rotate(-90deg)',
          transformOrigin: 'center',
        }}
      />
      <text x="74" y="70" textAnchor="middle" fill="white" fontSize="28" fontWeight="800">{pct}%</text>
      <text x="74" y="88" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="700" letterSpacing="2">CORRECT</text>
    </svg>
  );
}

export default function SessionSummary({
  deckName,
  totalCards,
  stats,
  cardResults = [],
  aiFeedback,
  isGenerating,
  onReset,
}: Props) {
  const router = useRouter();
  const correct  = stats.easy + stats.medium;
  const pct      = totalCards > 0 ? Math.round((correct / totalCards) * 100) : 0;
  const xpEarned = correct * 10 + (pct >= 90 ? 50 : pct >= 75 ? 25 : 0);
  const grade    = getGrade(pct);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    if (pct >= 75) {
      setTimeout(() =>
        confetti({ particleCount: 130, spread: 90, colors: ['#a78bfa','#00FFFF','#FFD700','#4ade80','#f472b6'], origin: { y: 0.45 }, gravity: 1.1 }),
      700);
    }
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-white"
      style={{
        opacity:    show ? 1 : 0,
        transform:  show ? 'translateY(0)' : 'translateY(28px)',
        transition: 'all 0.65s ease',
      }}
    >
      {/* Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase tracking-[0.25em]">
          Session Complete
        </div>
        <h1 className="text-3xl font-black tracking-tight">{deckName}</h1>
        <p className="text-sm text-gray-500 font-medium">Here's how you did</p>
      </div>

      {/* Grade + Ring */}
      <div className="flex items-center gap-10 mb-10">
        {/* Grade badge */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black"
            style={{
              background: `${grade.color}1a`,
              border:     `2px solid ${grade.color}`,
              boxShadow:  `0 0 24px ${grade.shadow}`,
              color:      grade.color,
            }}
          >
            {grade.label}
          </div>
          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Grade</span>
        </div>

        <ScoreRing pct={pct} />
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        {[
          { icon: '🃏', label: 'Reviewed', val: totalCards },
          { icon: '✅', label: 'Correct',  val: correct },
          { icon: '❌', label: 'Missed',   val: totalCards - correct },
          { icon: '⚡', label: 'XP Earned', val: `+${xpEarned}` },
        ].map(stat => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 min-w-[80px]"
          >
            <div className="text-2xl">{stat.icon}</div>
            <div className="text-xl font-black text-white/90">{stat.val}</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Motivational message */}
      <div
        className="px-7 py-4 rounded-2xl border max-w-md text-center mb-8 text-[15px]"
        style={{
          background: 'linear-gradient(135deg,rgba(124,58,237,.18),rgba(0,255,200,.07))',
          borderColor: 'rgba(167,139,250,.25)',
          color: '#d8b4fe',
        }}
      >
        {grade.msg}
      </div>

      {/* AI Feedback */}
      {(aiFeedback || isGenerating) && (
        <div className="w-full max-w-lg mb-8 p-5 rounded-2xl bg-[#0f0a1e] border border-purple-500/20">
          <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">AI Insight</p>
          {isGenerating ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="w-3 h-3 rounded-full bg-purple-500/50 animate-pulse" />
              Generating your personalised feedback...
            </div>
          ) : (
            <p className="text-sm text-gray-300 leading-relaxed">{aiFeedback}</p>
          )}
        </div>
      )}

      {/* Card Breakdown */}
      {cardResults.length > 0 && (
        <div className="w-full max-w-lg mb-10 rounded-2xl overflow-hidden border border-white/8 bg-white/[0.02]">
          <div className="px-4 py-3 border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
            Card Breakdown
          </div>
          <div className="max-h-[220px] overflow-y-auto custom-scrollbar divide-y divide-white/5">
            {cardResults.map((r, i) => {
              const isCorrect = r.rating === 'easy' || r.rating === 'medium';
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-3 text-sm">
                  {isCorrect
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    : <XCircle     className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  }
                  <span className="flex-1 text-gray-300 truncate">{r.front}</span>
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      background: isCorrect ? 'rgba(74,222,128,.12)' : 'rgba(248,113,113,.12)',
                      color:      isCorrect ? '#4ade80'              : '#f87171',
                      border:     `1px solid ${isCorrect ? 'rgba(74,222,128,.25)' : 'rgba(248,113,113,.25)'}`,
                    }}
                  >
                    {r.rating === 'easy' ? 'Easy' : r.rating === 'medium' ? 'Good' : r.rating === 'hard' ? 'Hard' : 'Again'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-purple-900/30"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
        >
          <RotateCcw className="w-4 h-4" />
          Study Again
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-purple-300 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all active:scale-95"
        >
          <LayoutDashboard className="w-4 h-4" />
          Back to Decks
        </button>
      </div>
    </div>
  );
}
