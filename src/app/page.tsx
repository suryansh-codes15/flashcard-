'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, ArrowRight, Brain, Zap, Trophy, BookOpen, Shield, BarChart3, Upload } from 'lucide-react';

const TEMPLATE_PREVIEWS = [
  { key: 'concept_glow', label: 'Concept Glow', color: '#6366f1', bg: 'linear-gradient(135deg, #0d0d1a, #13104a)', icon: '🧠', text: 'What is Spaced Repetition?', sub: 'Definition' },
  { key: 'warning_edge', label: 'Warning Edge', color: '#ef4444', bg: 'linear-gradient(135deg, #1a0508, #2d0a0f)', icon: '⚠️', text: 'Common Edge Cases', sub: 'Edge Case' },
  { key: 'formula_dark', label: 'Formula Dark', color: '#06b6d4', bg: '#0d1117', icon: '💻', text: 'f(x) = eˣ • sin(x)', sub: 'Formula' },
  { key: 'exam_highlight', label: 'Exam Highlight', color: '#fbbf24', bg: 'linear-gradient(135deg, #1a1200, #291c00)', icon: '⭐', text: 'Must-Know Exam Fact', sub: 'High Yield' },
  { key: 'timeline_steps', label: 'Timeline Steps', color: '#10b981', bg: 'linear-gradient(135deg, #051a10, #062b18)', icon: '📋', text: '1. Define → 2. Apply → 3. Review', sub: 'Process' },
  { key: 'comparison_split', label: 'Comparison', color: '#8b5cf6', bg: 'linear-gradient(135deg, #050d1f, #0a1628)', icon: '⚖️', text: 'Meiosis vs Mitosis', sub: 'Relationship' },
];

const FEATURES = [
  { icon: Brain, title: 'AI Art Director', desc: 'The AI reads content and assigns the perfect visual template — not just generic white cards.', color: '#6366f1' },
  { icon: Sparkles, title: '12 Premium Templates', desc: 'From Formula Dark to Exam Highlight — every card looks stunning and contextually relevant.', color: '#8b5cf6' },
  { icon: Zap, title: 'Instant Generation', desc: 'Upload any PDF and get a complete, beautifully designed deck in under 60 seconds.', color: '#f59e0b' },
  { icon: BarChart3, title: 'SM-2 Spaced Repetition', desc: 'Scientifically proven algorithm schedules every card at the optimal moment for memory.', color: '#10b981' },
  { icon: Shield, title: 'Offline Fallback', desc: 'Premium demo decks load instantly even if the API is down — zero downtime ever.', color: '#06b6d4' },
  { icon: Trophy, title: 'Mastery Tracking', desc: 'Beautiful analytics show your progress, mastered cards, and study streaks.', color: '#f43f5e' },
];

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 20);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count.toLocaleString()}{suffix}</>;
}

export default function LandingPage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, -60]);
  const heroOpacity = useTransform(scrollY, [0, 350], [1, 0]);

  return (
    <div className="relative overflow-x-hidden" style={{ background: '#09090f' }}>

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center overflow-hidden">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0">
          <motion.div className="absolute w-[900px] h-[900px] rounded-full top-[-20%] left-[-20%] opacity-25"
            style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 65%)', filter: 'blur(60px)' }}
            animate={{ scale: [1, 1.1, 1], x: [0, 30, 0], y: [0, 20, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute w-[700px] h-[700px] rounded-full bottom-[-15%] right-[-15%] opacity-20"
            style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 65%)', filter: 'blur(80px)' }}
            animate={{ scale: [1, 1.08, 1], x: [0, -20, 0], y: [0, -30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute w-[500px] h-[500px] rounded-full top-[30%] right-[10%] opacity-10"
            style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 65%)', filter: 'blur(80px)' }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          <div className="noise-overlay" />
        </div>

        <motion.div className="relative z-10 max-w-4xl mx-auto" style={{ y: heroY, opacity: heroOpacity }}>
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 text-sm font-bold"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#a5bbfd', border: '1px solid rgba(99,102,241,0.3)' }}>
            <Sparkles className="w-4 h-4" />
            AI Art Director · 12 Visual Templates · SM-2 SRS
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold font-display leading-[0.92] tracking-tight mb-6">
            <span className="text-white">Flash</span>
            <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #c4b5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Forge</span>
            <br />
            <span className="text-white/30 text-3xl sm:text-4xl font-bold">Your Magical Learning Companion</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="text-xl sm:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            Upload your study materials and watch our friendly AI create{' '}
            <span className="text-white/80 font-semibold">beautiful, engaging flashcards</span>{' '}
            — designed to make learning fun, fast, and incredibly effective for everyone!
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <motion.button whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-black text-lg"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 40px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                <Upload className="w-5 h-5" />
                Upload a PDF
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/dashboard">
              <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
                <BookOpen className="w-5 h-5" />
                View Library
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-14">
            {[
              { val: 12, suffix: '', label: 'Visual Templates' },
              { val: 95, suffix: '%', label: 'Retention Rate' },
              { val: 60, suffix: 's', label: 'To Generate' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-white">
                  <AnimatedCounter target={stat.val} suffix={stat.suffix} />
                </div>
                <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center pt-1">
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </div>
        </motion.div>
      </section>

      {/* ═══════ TEMPLATE SHOWCASE ═══════ */}
      <section className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-4 text-white/50">12 AI-Selected Templates</p>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mb-4 tracking-tight">
              Every card looks{' '}
              <span style={{ background: 'linear-gradient(135deg, #818cf8, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                different
              </span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
              The AI reads the content and assigns the most fitting visual template — so your brain actually remembers.
            </p>
          </motion.div>

          {/* Template grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEMPLATE_PREVIEWS.map((t, i) => (
              <motion.div key={t.key}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative h-44 rounded-3xl overflow-hidden cursor-pointer"
                style={{ background: t.bg }}>
                {/* Ambient glow */}
                <div className="absolute inset-0 opacity-20"
                  style={{ background: `radial-gradient(ellipse at 30% 30%, ${t.color} 0%, transparent 65%)` }} />
                <div className="relative p-5 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: `${t.color}25`, color: t.color, border: `1px solid ${t.color}35` }}>
                      {t.sub}
                    </span>
                    <span className="text-xl">{t.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-white text-base leading-snug mb-1">{t.text}</p>
                    <p className="text-xs" style={{ color: `${t.color}80` }}>{t.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section className="py-24 px-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-4 text-white/50">Why FlashForge</p>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
              Built for deep learning
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-3xl transition-all glass-panel">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}18` }}>
                  <f.icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-28 px-4 text-center">
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute inset-0 -z-10"
            style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-4 text-white/50">Get Started Free</p>
            <h2 className="text-5xl sm:text-6xl font-bold font-display text-white mb-6 tracking-tight">
              Ready to study smarter?
            </h2>
            <p className="text-xl mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Drop any PDF. The AI handles the rest.
            </p>
            <Link href="/upload">
              <motion.button whileHover={{ y: -3, scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-white font-black text-xl"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 12px 50px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                <Sparkles className="w-6 h-6" />
                Start for Free
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
          FlashForge · AI-Powered Flashcard Engine · Built with Groq + Next.js
        </p>
      </footer>

    </div>
  );
}
