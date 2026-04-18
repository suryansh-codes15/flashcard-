'use client';

import { useEffect, useState, memo } from 'react';
import { MascotSubject } from '../../types';

interface Props {
  subject?: MascotSubject;
}

function CinematicBackgroundComponent({ subject = 'science' }: Props) {
  const [stars, setStars] = useState<{ id: number; left: string; top: string; delay: string; size: string; duration: string }[]>([]);
  const [particles, setParticles] = useState<{ id: number; left: string; color: string; duration: string }[]>([]);

  useEffect(() => {
    // Generate stars - stationary, only once on mount
    const newStars = Array.from({ length: 250 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      size: `${1 + Math.random() * 2}px`,
      duration: `${3 + Math.random() * 4}s`
    }));
    setStars(newStars);

    // Particle spawner - throttled for performance
    const colors = ['bg-purple-500', 'bg-teal-500', 'bg-amber-500', 'bg-pink-500'];
    let particleId = 0;
    
    const token = setInterval(() => {
      setParticles(prev => {
        const id = particleId++;
        const newParticle = {
          id,
          left: `${Math.random() * 100}%`,
          color: colors[Math.floor(Math.random() * colors.length)],
          duration: `${4 + Math.random() * 3}s`
        };
        
        // Remove particle after 7s to free DOM node
        setTimeout(() => {
          setParticles(current => current.filter(p => p.id !== id));
        }, 7000);
        
        // Cap particles at 20 for performance "fasy" mode
        return [...prev.slice(-19), newParticle];
      });
    }, 600); // Slower spawn rate for better performance

    return () => {
      clearInterval(token);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#050510]">
      {/* 🎭 LAYER 0: GRAINY NOISE OVERLAY */}
      <div className="noise-overlay" />
      
      {/* 🎭 LAYER 1: CINEMATIC VIGNETTE (Post-process) */}
      <div 
        className="absolute inset-0 z-[10] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(5,5,16,0.92) 100%)',
        }}
      />

      {/* 🎭 LAYER 1.5: REFINED HORIZON GLOW (Integrated with vanishing point) */}
      <div 
        className="absolute top-[44%] left-1/2 -translate-x-1/2 w-[120%] h-[150px] z-[3] pointer-events-none opacity-[0.4]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.5) 0%, rgba(124,58,237,0.1) 40%, transparent 80%)',
          filter: 'blur(35px)',
          transform: 'translateX(-50%)',
        }}
      />
      
      {/* AURORA ORBS (Atmosphere Base) */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full mix-blend-screen opacity-100 blur-[100px] max-w-full animate-orb1 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
          top: '-10%',
          left: '-5%',
        }}
      />
      <div 
        className="absolute w-[800px] h-[800px] rounded-full mix-blend-screen opacity-100 blur-[100px] max-w-full animate-orb2 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
          top: '5%',
          right: '-5%',
        }}
      />
      <div 
        className="absolute w-[600px] h-[600px] rounded-full mix-blend-screen opacity-100 blur-[90px] max-w-full animate-orb3 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
          bottom: '10%',
          left: '25%',
        }}
      />

      {/* 🔮 LAYER 2: 3D MOVING BRIDGE GRID */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[4]" style={{ perspective: '1000px' }}>
        <div 
          className="absolute w-[200%] h-[200%] left-[-50%] bottom-[-50%] animate-grid-flow will-change-transform"
          style={{
            transform: 'rotateX(74deg)',
            transformOrigin: 'center center',
            backfaceVisibility: 'hidden',
          }}
        >
          <svg width="100%" height="100%" className="w-full h-full opacity-[0.9]" shapeRendering="geometricPrecision">
            <defs>
              <linearGradient id="grid-stroke-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="1" />
              </linearGradient>
              <pattern id="bridge-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse" y="0">
                <path 
                   d="M 40 0 L 0 0 0 40" 
                   fill="none" 
                   stroke="url(#grid-stroke-grad)" 
                   strokeWidth="1.2" 
                   opacity="1" 
                   strokeLinecap="round" 
                   style={{ filter: 'drop-shadow(0 0 4px rgba(34,211,238,0.7))' }}
                />
              </pattern>
              <linearGradient id="bridge-grid-fade" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="20%" stopColor="white" stopOpacity="0.8" />
                <stop offset="45%" stopColor="white" />
                <stop offset="100%" stopColor="white" />
              </linearGradient>
              <mask id="bridge-grid-mask">
                <rect width="100%" height="100%" fill="url(#bridge-grid-fade)" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="url(#bridge-grid-pattern)" mask="url(#bridge-grid-mask)" />
          </svg>
        </div>
      </div>


      {/* JS STAR FIELD (Distant) */}
      {stars.map(s => (
          <div
            key={s.id}
            className="absolute bg-white rounded-full animate-starTwinkle z-[2]"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDuration: s.duration,
              animationDelay: s.delay,
              opacity: 0.7, 
              backgroundColor: parseInt(s.left) % 5 === 0 ? '#a78bfa' : parseInt(s.left) % 7 === 0 ? '#22d3ee' : '#fff',
              boxShadow: '0 0 4px rgba(255,255,255,0.4)',
            }}
          />
      ))}

      {/* RISING PARTICLES (Medium Distance) */}
      {particles.map(p => (
        <div
          key={p.id}
          className={`absolute bottom-[-20px] rounded-full opacity-0 animate-particleRise ${p.color} z-[5]`}
          style={{
            left: p.left,
            width: '3px',
            height: '3px',
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

const CinematicBackground = memo(CinematicBackgroundComponent);
export default CinematicBackground;
