'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Brain, Shield, Zap } from 'lucide-react';
import MascotCharacter from '../components/MascotCharacter';

function HeroCard3D() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="relative w-full max-w-[320px] mx-auto select-none mt-12 cursor-pointer" onClick={() => setFlipped(!flipped)}>
      {/* Holo border ring */}
      <div
        className="absolute inset-[-3px] rounded-[26px] z-[-1] animate-holo"
        style={{
          background: 'linear-gradient(270deg,#7c3aed,#06b6d4,#10b981,#f59e0b,#ec4899,#7c3aed)',
          backgroundSize: '400% 400%',
        }}
      />
      
      {/* 3D Scene */}
      <div 
        className="relative w-full h-[200px] preserve-3d transition-transform duration-500 ease-out animate-[cardFloat_4s_ease-in-out_infinite_alternate]"
        style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-[#0f0a1e] rounded-[24px] border border-white/10 flex flex-col items-center justify-center p-6 text-center shadow-2xl">
          <div className="absolute top-4 left-4 flex gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500/50" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
            <div className="w-2 h-2 rounded-full bg-amber-500/50" />
          </div>
          <span className="px-3 py-1 mb-4 bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 capitalize tracking-widest rounded-full leading-none">
            Biology
          </span>
          <h2 className="text-xl font-black text-white">What is the powerhouse of the cell?</h2>
          <p className="mt-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold">Tap to flip</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden bg-[#0a2c1c] rounded-[24px] border border-emerald-500/30 flex flex-col items-center justify-center p-6 text-center shadow-2xl" style={{ transform: 'rotateY(180deg)' }}>
          <h2 className="text-3xl font-black text-white flex items-center gap-2">Mitochondria! <span className="text-2xl">🦠</span></h2>
          <div className="flex gap-2 mt-6 pointer-events-none">
             <div className="w-10 h-10 rounded-full border border-emerald-500/30 bg-emerald-900/40 flex justify-center items-center font-bold text-emerald-400">4</div>
             <div className="w-10 h-10 rounded-full border border-blue-500/30 bg-blue-900/40 flex justify-center items-center font-bold text-blue-400">3</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [sparkles, setSparkles] = useState<{ width: string; height: string; top: string; left: string; delay: number }[]>([]);
  const [sparkyState, setSparkyState] = useState<'reading'|'jumping'>('reading');
  const [novaState, setNovaState] = useState<'reading'|'jumping'>('reading');
  const [atlasState, setAtlasState] = useState<'reading'|'jumping'>('reading');
  const [lexieState, setLexieState] = useState<'reading'|'jumping'>('reading');

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

  const handleMascotClick = (mascot: 'sparky' | 'nova' | 'atlas' | 'lexie') => {
    if (mascot === 'sparky') {
      setSparkyState('jumping');
      setTimeout(() => setSparkyState('reading'), 700);
    } else if (mascot === 'nova') {
      setNovaState('jumping');
      setTimeout(() => setNovaState('reading'), 700);
    } else if (mascot === 'atlas') {
      setAtlasState('jumping');
      setTimeout(() => setAtlasState('reading'), 700);
    } else if (mascot === 'lexie') {
      setLexieState('jumping');
      setTimeout(() => setLexieState('reading'), 700);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      
      {/* 🌌 HERO SECTION */}
      <section className="relative px-6 pt-24 pb-16 text-center max-w-6xl mx-auto flex flex-col items-center">

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

          <p className="text-[13px] md:text-[15px] font-normal text-[#9ca3af] max-w-2xl mx-auto leading-[1.6]">
            Transform any PDF into deeply intelligent, privacy-first flashcards. 
            Powered by sm-2 spaced repetition for ultimate memory mastery.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 mb-10">
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


          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-antigravity">
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-600/30 rounded-full backdrop-blur-md">
              <span className="text-sm">🤖</span>
              <span className="text-xs font-black text-purple-400 uppercase tracking-widest leading-none">GEMINI AI FORGE</span>
            </div>
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600/10 border border-emerald-600/30 rounded-full backdrop-blur-md">
              <span className="text-sm">🔒</span>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest leading-none">100% LOCAL PRIVACY</span>
            </div>
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600/10 border border-amber-600/30 rounded-full backdrop-blur-md">
              <span className="text-sm">📂</span>
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest leading-none">10MB TEXTBOOK LIMIT</span>
            </div>
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/30 rounded-full backdrop-blur-md">
              <span className="text-sm">🧠</span>
              <span className="text-xs font-black text-blue-400 uppercase tracking-widest leading-none">SM-2 ALGORITHM</span>
            </div>
          </div>
          
          <div className="flex items-end justify-center w-full gap-8 mt-12">
            <div className="hidden md:flex flex-col items-center gap-4 cursor-pointer group" onClick={() => handleMascotClick('sparky')}>
               <MascotCharacter subject="science" side="left" name="Sparky" state={sparkyState} className="w-28 h-28 filter drop-shadow-[0_0_25px_rgba(139,92,246,0.25)] transition-all group-hover:scale-110" />
               <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[9px] font-black text-purple-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Sparky</div>
            </div>
            
            <HeroCard3D />
            
            <div className="hidden md:flex flex-col items-center gap-4 cursor-pointer group" onClick={() => handleMascotClick('nova')}>
               <MascotCharacter subject="math" side="right" name="Nova" state={novaState} className="w-28 h-28 filter drop-shadow-[0_0_25px_rgba(16,185,129,0.25)] transition-all group-hover:scale-110" />
               <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Nova</div>
            </div>
          </div>

        </div>
      </section>

      {/* ✨ FEATURE CARDS */}
      <section className="pt-16 pb-32 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            icon: Brain, 
            emoji: '🧠',
            title: 'Spaced Repetition', 
            desc: 'Scientifically optimized SM-2 algorithm schedules every card for the perfect review moment.',
            statL: '3× faster',
            statR: 'than passive reading'
          },
          { 
            icon: Shield,
            emoji: '🔒', 
            title: '100% Private', 
            desc: 'All data stays securely in your browser via IndexedDB. No cloud tracking, total privacy.',
            statL: '0 servers',
            statR: 'touch your data'
          },
          { 
            icon: Zap, 
            emoji: '⚡',
            title: 'AI Generation', 
            desc: 'Drop any PDF and our AI Director forges beautiful, contextual flashcards automatically.',
            statL: '< 10 sec',
            statR: 'per deck generated'
          },
        ].map((f) => (
          <div key={f.title} className="relative overflow-hidden p-10 rounded-[16px] bg-[#0f0a1e] border border-white/5 hover:border-purple-500/20 transition-all flex flex-col gap-6 shimmer-effect cursor-default group">
            {/* Absolute Emoji */}
            <div className="absolute top-4 right-4 text-[56px] opacity-[0.06] pointer-events-none group-hover:scale-110 transition-transform duration-500">
              {f.emoji}
            </div>

            <div className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center text-purple-400 z-10">
              <f.icon className="w-6 h-6" />
            </div>
            <div className="space-y-3 z-10">
              <h3 className="text-xl font-black text-white">{f.title}</h3>
              <p className="text-[13px] font-normal text-[#9ca3af] leading-[1.6]">
                {f.desc}
              </p>
            </div>

            <div className="px-4 py-2 bg-[#1a1040]/80 rounded-xl flex items-center justify-center gap-2 border border-white/5 mt-auto z-10">
              <span className="text-[11px] font-black text-purple-400 tracking-widest uppercase">{f.statL}</span>
              <span className="text-[10px] font-bold text-gray-500">{f.statR}</span>
            </div>
          </div>
        ))}
      </section>

      {/* 🐧 MASCOT ROW */}
      <section className="py-20 border-t border-white/5 bg-black/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-12 md:gap-24">
            {/* Sparky */}
            <div className="flex flex-col items-center gap-4 cursor-pointer group" onClick={() => handleMascotClick('sparky')}>
              <MascotCharacter 
                subject="science" 
                side="left" 
                name="Sparky" 
                state={sparkyState} 
                className="w-24 h-24 transition-transform group-hover:scale-110 group-active:scale-95" 
              />
              <div className="flex items-center gap-2 mt-4">
                <span className="text-[10px] font-black text-gray-400 tracking-[0.3em] uppercase group-hover:text-purple-400 transition-colors">Sparky</span>
                <span className="text-[10px]">⚡</span>
              </div>
            </div>

            {/* Nova */}
            <div className="flex flex-col items-center gap-4 cursor-pointer group" onClick={() => handleMascotClick('nova')}>
              <MascotCharacter 
                subject="math" 
                side="left" 
                name="Nova" 
                state={novaState} 
                className="w-24 h-24 transition-transform group-hover:scale-110 group-active:scale-95" 
              />
              <div className="flex items-center gap-2 mt-4">
                <span className="text-[10px] font-black text-gray-400 tracking-[0.3em] uppercase group-hover:text-emerald-400 transition-colors">Nova</span>
                <span className="text-[10px]">🪄</span>
              </div>
            </div>

            {/* Atlas */}
            <div className="flex flex-col items-center gap-4 cursor-pointer group" onClick={() => handleMascotClick('atlas')}>
              <MascotCharacter 
                subject="geography" 
                side="left" 
                name="Atlas" 
                state={atlasState} 
                className="w-24 h-24 transition-transform group-hover:scale-110 group-active:scale-95" 
              />
              <div className="flex items-center gap-2 mt-4">
                <span className="text-[10px] font-black text-gray-400 tracking-[0.3em] uppercase group-hover:text-blue-400 transition-colors">Atlas</span>
                <span className="text-[10px]">🌍</span>
              </div>
            </div>

            {/* Lexie */}
            <div className="flex flex-col items-center gap-4 cursor-pointer group" onClick={() => handleMascotClick('lexie')}>
              <MascotCharacter 
                subject="history" 
                side="left" 
                name="Lexie" 
                state={lexieState} 
                className="w-24 h-24 transition-transform group-hover:scale-110 group-active:scale-95" 
              />
              <div className="flex items-center gap-2 mt-4">
                <span className="text-[10px] font-black text-gray-400 tracking-[0.3em] uppercase group-hover:text-amber-400 transition-colors">Lexie</span>
                <span className="text-[10px]">📝</span>
              </div>
            </div>
          </div>
        </div>
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
