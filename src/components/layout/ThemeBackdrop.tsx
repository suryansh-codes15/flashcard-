'use client';

import { useState, useEffect } from 'react';

export default function ThemeBackdrop() {
  const [sparkles, setSparkles] = useState<{ top: string; left: string; size: number; delay: string; duration: string }[]>([]);

  useEffect(() => {
    const newSparkles = [...Array(8)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: 1,
      delay: `${Math.random() * 5}s`,
      duration: `${2 + Math.random() * 3}s`
    }));
    setSparkles(newSparkles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0a0616]">
      {/* Drifting Orbs */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.15]"
        style={{ 
          background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          top: '-10%',
          left: '-5%',
          animation: 'orbDrift 40s linear infinite' 
        }}
      />
      <div 
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.12]"
        style={{ 
          background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)',
          bottom: '-15%',
          right: '-10%',
          animation: 'orbDrift 55s linear infinite reverse' 
        }}
      />

      {/* Sparkle Particles */}
      {sparkles.map((s, i) => (
        <div 
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: s.top,
            left: s.left,
            opacity: 0.4,
            animation: `sparkle ${s.duration} ease-in-out infinite`,
            animationDelay: s.delay
          }}
        />
      ))}

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{ 
          backgroundImage: 'linear-gradient(rgba(124, 58, 237, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 58, 237, 0.2) 1px, transparent 1px)', 
          backgroundSize: '80px 80px' 
        }}
      />
    </div>
  );
}
