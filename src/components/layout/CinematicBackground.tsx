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
    const newStars = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 4}s`,
      size: `${1 + Math.random() * 2}px`,
      duration: `${1.5 + Math.random() * 2.5}s`
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
      
      {/* AURORA ORBS */}
      <div 
        className="absolute w-[700px] h-[700px] rounded-full mix-blend-screen opacity-100 blur-[100px] max-w-full animate-orb1 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(88,28,220,0.18) 0%, transparent 70%)',
          top: '-10%',
          left: '-5%',
        }}
      />
      <div 
        className="absolute w-[600px] h-[600px] rounded-full mix-blend-screen opacity-100 blur-[100px] max-w-full animate-orb2 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)',
          top: '5%',
          right: '-5%',
          display: subject === 'science' || subject === 'math' ? 'block' : 'none' // Conditional rendering for performance
        }}
      />
      <div 
        className="absolute w-[500px] h-[500px] rounded-full mix-blend-screen opacity-100 blur-[100px] max-w-full animate-orb3 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.09) 0%, transparent 70%)',
          bottom: '10%',
          left: '25%',
        }}
      />

      {/* SVG PERSPECTIVE GRID */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ perspective: '1000px' }}>
        <div 
          className="absolute w-[200%] h-[200%] left-[-50%] bottom-[-50%] animate-gridPulse opacity-5"
          style={{
            transform: 'rotateX(60deg)',
            transformOrigin: 'center center',
            backgroundImage: `
              linear-gradient(to right, rgba(139,92,246,0.25) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(139,92,246,0.25) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'linear-gradient(to top, black 30%, transparent 80%)',
            WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 80%)',
          }}
        />
      </div>

      {/* HORIZONTAL SCAN LINE */}
      <div 
        className="absolute w-full h-[2px] animate-scanLine pointer-events-none opacity-20"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.12) 40%, rgba(16,185,129,0.08) 60%, transparent)',
          zIndex: 10
        }}
      />

      {/* JS STAR FIELD - Static rendering */}
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute bg-white rounded-full animate-starTwinkle"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDuration: s.duration,
            animationDelay: s.delay,
            opacity: 0,
          }}
        />
      ))}

      {/* RISING PARTICLES - Capped at 20 */}
      {particles.map(p => (
        <div
          key={p.id}
          className={`absolute bottom-[-20px] rounded-full opacity-0 animate-particleRise ${p.color}`}
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
