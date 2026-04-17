'use client';

import { useState, useEffect, useMemo } from 'react';
import { MascotSubject } from '@/types';

interface Props {
  subject?: MascotSubject;
}

export default function CinematicBackground({ subject = 'science' }: Props) {
  const [stars, setStars] = useState<{ top: string; left: string; size: number; duration: number; delay: number }[]>([]);
  const [particles, setParticles] = useState<{ id: number; left: number; dx: number; color: string; size: number }[]>([]);

  // Subject Orb Color Mapping
  const orbColors = {
    science:   { orb1: 'rgba(139,92,246,.22)', orb2: 'rgba(16,185,129,.12)', orb3: 'rgba(236,72,153,.10)' },
    math:      { orb1: 'rgba(16,185,129,.18)', orb2: 'rgba(5,150,105,.12)', orb3: 'rgba(251,191,36,.10)' },
    geography: { orb1: 'rgba(37,99,235,.16)', orb2: 'rgba(59,130,246,.12)', orb3: 'rgba(243,244,246,.08)' },
    history:   { orb1: 'rgba(217,119,6,.15)', orb2: 'rgba(180,83,9,.10)', orb3: 'rgba(251,191,36,.06)' },
    language:  { orb1: 'rgba(219,39,119,.14)', orb2: 'rgba(190,24,93,.10)', orb3: 'rgba(244,114,182,.06)' },
  };

  const currentColors = orbColors[subject] || orbColors.science;

  // Initialize 60 stars
  useEffect(() => {
    const newStars = Array.from({ length: 60 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: 1 + Math.random() * 2,
      duration: 1.5 + Math.random() * 3,
      delay: Math.random() * 5,
    }));
    setStars(newStars);
  }, []);

  // Rising Particles System
  useEffect(() => {
    let particleId = 0;
    const colors = ['#a78bfa', '#2dd4bf', '#fbbf24', '#f472b6', '#60a5fa'];
    
    const interval = setInterval(() => {
      const newParticle = {
        id: particleId++,
        left: Math.random() * 100,
        dx: (Math.random() - 0.5) * 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 4,
      };
      
      setParticles(prev => [...prev.slice(-40), newParticle]);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#06040f] pointer-events-none transition-colors duration-1000">
      
      {/* 🌌 LAYER 1: AURORA ORBS */}
      <div 
        className="absolute w-[900px] h-[900px] top-[-25%] left-[-15%] rounded-full opacity-60 blur-[130px] animate-[orb1_12s_ease-in-out_infinite]"
        style={{ background: `radial-gradient(circle, ${currentColors.orb1} 0%, transparent 70%)` }}
      />
      <div 
        className="absolute w-[700px] h-[700px] top-[-15%] right-[-10%] rounded-full opacity-60 blur-[140px] animate-[orb2_18s_ease-in-out_infinite]"
        style={{ background: `radial-gradient(circle, ${currentColors.orb2} 0%, transparent 70%)` }}
      />
      <div 
        className="absolute w-[500px] h-[500px] bottom-[-20%] left-[25%] rounded-full opacity-60 blur-[120px] animate-[orb3_25s_ease-in-out_infinite]"
        style={{ background: `radial-gradient(circle, ${currentColors.orb3} 0%, transparent 70%)` }}
      />

      {/* 📏 LAYER 2: PERSPECTIVE GRID */}
      <div className="absolute inset-0 z-0 animate-[gridPulse_6s_ease-in-out_infinite]">
        <svg width="100%" height="100%" className="opacity-40">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(139,92,246,.35)" strokeWidth="0.5" />
            </pattern>
            <linearGradient id="grid-fade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="black" stopOpacity="0" />
              <stop offset="50%" stopColor="black" stopOpacity="1" />
              <stop offset="100%" stopColor="black" stopOpacity="0" />
            </linearGradient>
            <mask id="grid-mask">
              <rect width="100%" height="100%" fill="url(#grid-fade)" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" mask="url(#grid-mask)" />
        </svg>
      </div>

      {/* ✨ LAYER 3: STAR FIELD */}
      {stars.map((star, i) => (
        <div 
          key={i}
          className="absolute bg-white rounded-full animate-[starTwinkle_infinite]"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`
          }}
        />
      ))}

      {/* 📡 LAYER 4: SCAN LINE */}
      <div 
        className="absolute inset-0 z-10 opacity-[0.05] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,.15), rgba(16,185,129,.1), transparent)',
          height: '2px',
          width: '100%',
          animation: 'scanLine 8s linear infinite'
        }}
      />

      {/* 🎈 LAYER 5: RISING PARTICLES */}
      {particles.map((p) => (
        <div 
          key={p.id}
          className="absolute bg-white rounded-full animate-[risingParticle_7s_linear_forwards] blur-[1px]"
          style={{
            left: `${p.left}%`,
            bottom: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            '--dx': `${p.dx}px`,
            opacity: 0.5
          } as any}
        />
      ))}

      {/* Grainy Noise Overlay */}
      <div className="absolute inset-0 z-10 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
    </div>
  );
}
