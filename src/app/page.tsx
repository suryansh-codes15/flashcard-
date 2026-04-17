'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Brain, Shield, Zap } from 'lucide-react';
import MascotCharacter from '@/components/MascotCharacter';


export default function LandingPage() {
  const [sparkles, setSparkles] = useState<{ width: string; height: string; top: string; left: string; delay: number }[]>([]);

  useEffect(() => {
    const newSparkles = [...Array(6)].map(() => ({
      width: `${2 + Math.random() * 4}px`,
      height: `${2 + Math.random() * 4}px`,
      top: `${Math.random() * 80}%`,
      left: `${Math.random() * 100}%`,
      delay: 2 + Math.random() * 2
    }));
    setSparkles(newSparkles);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      
      {/* 🌌 HERO SECTION */}
      <section className="relative px-6 pt-24 pb-32 text-center max-w-6xl mx-auto flex flex-col items-center">
        {/* Floating Streak Preview (Top Right) */}
        <div className="absolute top-10 right-10 hidden lg:block">
          <div className="glass-surface p-4 rounded-2xl animate-antigravity shadow-2xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔥</span>
              <div className="flex flex-col items-start translate-y-0.5">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none">7-Day Streak</span>
                <span className="text-xs font-bold text-white/50">147 cards reviewed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Sparkle Dots */}
        {sparkles.map((s, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white opacity-20 pointer-events-none"
            style={{ 
              width: s.width, 
              height: s.height,
              top: s.top,
              left: s.left,
              animation: `sparkle ${s.delay}s infinite`
            }}
          />
        ))}

        <div className="relative z-10 max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-600/10 border border-purple-600/30 text-[10px] font-black text-purple-400 uppercase tracking-widest">
            Privacy-First · Local-Only · AI-Powered
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Learn faster with <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">AI-powered</span> cards ⚡
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Transform any PDF into deeply intelligent, privacy-first flashcards. 
            Powered by sm-2 spaced repetition for ultimate memory mastery.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/dashboard">
              <button 
                className="px-10 py-5 rounded-full bg-purple-600 text-white font-black text-lg shadow-[0_15px_40px_-10px_rgba(124,58,237,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                Start studying
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-10 py-5 rounded-full border-2 border-purple-600/30 text-purple-400 font-black text-lg hover:bg-purple-600/5 transition-all">
                Browse collections
              </button>
            </Link>
          </div>

        </div>
      </section>

      {/* 🐯 MASCOT ROW */}
      <section className="py-20 border-y border-white/5 bg-[#0f0a1e]/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { subject: 'science' as const, name: 'Sparky ⚡', color: 'text-purple-400' },
            { subject: 'math' as const, name: 'Nova 🧪', color: 'text-emerald-400' },
            { subject: 'geography' as const, name: 'Atlas 🌍', color: 'text-blue-400' },
            { subject: 'history' as const, name: 'Lexie 📝', color: 'text-pink-400' },
          ].map((m) => (
            <div key={m.subject} className="flex flex-col items-center gap-4 group cursor-help">
              <MascotCharacter 
                subject={m.subject} 
                side="left"
                name={m.name}
                state="idle"
                className="w-24 h-24 filter drop-shadow-2xl group-hover:scale-110 transition-transform" 
              />
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${m.color} opacity-60 group-hover:opacity-100 transition-opacity`}>
                {m.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ✨ FEATURE CARDS */}
      <section className="py-32 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Brain, title: 'Spaced Repetition', desc: 'SCIENTIFICALLY OPTIMIZED SM-2 ALGORITHM SCHEDULES EVERY CARD FOR THE PERFECT MOMENT.' },
          { icon: Shield, title: '100% Private', desc: 'ALL DATA STAYS IN YOUR BROWSER VIA INDEXEDDB. NO CLOUD, NO TRACKING, TOTAL PRIVACY.' },
          { icon: Zap, title: 'AI Generation', desc: 'DROP ANY PDF AND OUR AI FORGES BEAUTIFUL, CONTEXTUAL FLASHCARDS IN SECONDS.' },
        ].map((f) => (
          <div key={f.title} className="p-10 rounded-[16px] bg-[#0f0a1e] border border-white/5 hover:border-purple-500/20 transition-all flex flex-col gap-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center text-purple-400">
              <f.icon className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-black text-white">{f.title}</h3>
              <p className="text-[11px] font-bold text-gray-500 leading-relaxed uppercase tracking-widest">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 px-6 text-center">
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
          FlashForge · AI-Powered Flashcard Engine · Privacy First
        </p>
      </footer>

    </div>
  );
}
