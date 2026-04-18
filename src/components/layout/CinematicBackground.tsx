'use client';

import { useEffect, useState } from 'react';
import { MascotSubject } from '../../types';

interface Props {
  subject?: MascotSubject;
}

export default function CinematicBackground({ subject = 'science' }: Props) {
  const [stars, setStars] = useState<{ id: number; left: string; top: string; delay: string; size: string; duration: string }[]>([]);
  const [particles, setParticles] = useState<{ id: number; left: string; color: string; duration: string }[]>([]);

  useEffect(() => {
    // Generate stars
    const newStars = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 4}s`,
      size: `${1 + Math.random() * 2}px`,
      duration: `${1.5 + Math.random() * 2.5}s`
    }));
    setStars(newStars);

    // Particle spawner
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
        
        return [...prev, newParticle];
      });
    }, 400);

    return () => {
      clearInterval(token);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#050510]">
      
      {/* AURORA ORBS */}
      <div 
        className="absolute w-[900px] h-[900px] rounded-full mix-blend-screen opacity-50 blur-[100px] max-w-full animate-orb1"
        style={{
          background: 'radial-gradient(circle, rgba(88,28,220,0.22) 0%, transparent 70%)',
          top: '-20%',
          left: '-10%',
        }}
      />
      <div 
        className="absolute w-[700px] h-[700px] rounded-full mix-blend-screen opacity-50 blur-[100px] max-w-full animate-orb2"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          top: '-10%',
          right: '-10%',
        }}
      />
      <div 
        className="absolute w-[500px] h-[500px] rounded-full mix-blend-screen opacity-50 blur-[100px] max-w-full animate-orb3"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
          bottom: '-10%',
          left: '30%',
        }}
      />

      {/* SVG PERSPECTIVE GRID */}
      <div className="absolute inset-0 preserve-3d" style={{ perspective: '1000px' }}>
        <div 
          className="absolute w-full h-[150%] bottom-0 transform-gpu animate-gridPulse"
          style={{
            transform: 'rotateX(75deg) translateY(100px) translateZ(-200px)',
            transformOrigin: 'bottom center',
            backgroundSize: '60px 60px',
            backgroundImage: `
              linear-gradient(to right, rgba(139,92,246,0.35) 0.5px, transparent 0.5px),
              linear-gradient(to bottom, rgba(139,92,246,0.35) 0.5px, transparent 0.5px)
            `,
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 20%, black 50%, transparent 100%)',
          }}
        />
      </div>

      {/* JS STAR FIELD */}
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

      {/* RISING PARTICLES */}
      {particles.map(p => (
        <div
          key={p.id}
          className={`absolute bottom-[-20px] rounded-full opacity-0 animate-particleRise ${p.color}`}
          style={{
            left: p.left,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            animationDuration: p.duration,
          }}
        />
      ))}

      {/* SCAN LINE */}
      <div 
        className="absolute top-0 left-0 w-full h-[2px] animate-scanLine"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), rgba(45,212,191,0.5), transparent)'
        }}
      />

    </div>
  );
}
