'use client';

import { useEffect, useState, memo } from 'react';

export default function CinematicBackground() {
  const [stars, setStars] = useState<{ id: number; left: string; top: string; size: string; delay: string; duration: string }[]>([]);
  const [particles, setParticles] = useState<{ id: string; x: string; dx: number; color: string; duration: string; size: string }[]>([]);

  useEffect(() => {
    // PART 1: STAR FIELD GENERATION
    const newStars = Array.from({ length: 75 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 85}%`, // Keep stars in upper area
      size: `${1 + Math.random() * 1.8}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${1.5 + Math.random() * 3.5}s`
    }));
    setStars(newStars);

    // PART 2: RISING PARTICLES SPAWNER
    const colors = ['rgba(139,92,246,0.7)', 'rgba(16,185,129,0.6)', 'rgba(6,182,212,0.5)'];
    
    const interval = setInterval(() => {
      const count = Math.floor(Math.random() * 2) + 1; // 1-2 particles at a time
      const newBatch = Array.from({ length: count }, () => ({
        id: Math.random().toString(36).substring(7),
        x: `${Math.random() * 100}%`,
        dx: Math.random() * 80 - 40, // -40px to +40px drift
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: `${3 + Math.random() * 4}s`,
        size: `${2 + Math.random() * 3}px`
      }));

      setParticles(prev => [...prev.slice(-15), ...newBatch]);
    }, 350);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#050510]">
      
      {/* 🔮 ADVANCED CIRCLE GLOW: LEFT (VIBRANT PURPLE) */}
      <div 
        className="absolute w-[900px] h-[900px] rounded-full left-[-15%] top-[5%] animate-orb1 opacity-[0.7]"
        style={{
          background: 'radial-gradient(circle at center, rgba(167,139,250,0.5) 0%, rgba(139,92,246,0.2) 35%, rgba(124,58,237,0.05) 60%, transparent 80%)',
          filter: 'blur(100px)',
        }}
      />

      {/* 🔮 ADVANCED CIRCLE GLOW: RIGHT (VIBRANT GREEN/CYAN) */}
      <div 
        className="absolute w-[900px] h-[900px] rounded-full right-[-15%] bottom-[5%] animate-orb2 opacity-[0.65]"
        style={{
          background: 'radial-gradient(circle at center, rgba(52,211,153,0.4) 0%, rgba(16,185,129,0.15) 35%, rgba(6,182,212,0.05) 60%, transparent 80%)',
          filter: 'blur(100px)',
        }}
      />

      {/* ✨ JS STAR FIELD */}
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-starTwinkle"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}

      {/* 🔮 UNIFIED 3D SYNTHWAVE GRID */}
      <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none">
        <div className="w-full h-full" style={{ perspective: '800px', perspectiveOrigin: '50% 40%' }}>
          <div 
            className="absolute w-[200%] h-[150%] left-[-50%] top-[40%] animate-gridGlow"
            style={{
              transformOrigin: 'top center',
              transform: 'rotateX(72deg)',
              backgroundImage: `
                linear-gradient(rgba(139,92,246,0.15) 1.5px, transparent 1.5px),
                linear-gradient(90deg, rgba(139,92,246,0.15) 1.5px, transparent 1.5px)
              `,
              backgroundSize: '100px 100px',
              maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 10%, rgba(0,0,0,0.8) 40%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 10%, rgba(0,0,0,0.8) 40%, black 100%)',
            }}
          />
        </div>
      </div>

      {/* 🫧 RISING PARTICLES */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: p.x,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            '--dx': `${p.dx}px`,
            animation: `risingParticle ${p.duration} ease-out forwards`,
          } as any}
        />
      ))}

      {/* 📡 SCAN LINE */}
      <div 
        className="absolute inset-x-0 h-[1.5px] animate-scanLine z-[10]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.18), transparent)',
        }}
      />

    </div>
  );
}

