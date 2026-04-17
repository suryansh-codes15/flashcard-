'use client';

import { useEffect, useRef } from 'react';
import { MascotSubject } from '@/types';

interface Props {
  subject?: MascotSubject;
}

// Subject-specific aurora orb palettes
const subjectOrbs: Record<string, { color: string; phase: number }[]> = {
  science: [
    { color: 'rgba(120,40,255,',   phase: 0 },
    { color: 'rgba(0,200,255,',    phase: 1 },
    { color: 'rgba(60,0,180,',     phase: 2 },
    { color: 'rgba(0,255,180,',    phase: 3 },
  ],
  math: [
    { color: 'rgba(16,185,129,',   phase: 0 },
    { color: 'rgba(5,150,105,',    phase: 1.2 },
    { color: 'rgba(251,191,36,',   phase: 2.5 },
    { color: 'rgba(0,200,180,',    phase: 3.8 },
  ],
  geography: [
    { color: 'rgba(37,99,235,',    phase: 0 },
    { color: 'rgba(59,130,246,',   phase: 1.3 },
    { color: 'rgba(0,180,255,',    phase: 2.6 },
    { color: 'rgba(100,60,255,',   phase: 3.9 },
  ],
  history: [
    { color: 'rgba(217,119,6,',    phase: 0 },
    { color: 'rgba(180,83,9,',     phase: 1.1 },
    { color: 'rgba(251,191,36,',   phase: 2.2 },
    { color: 'rgba(255,80,0,',     phase: 3.3 },
  ],
  language: [
    { color: 'rgba(219,39,119,',   phase: 0 },
    { color: 'rgba(190,24,93,',    phase: 1.4 },
    { color: 'rgba(244,114,182,',  phase: 2.8 },
    { color: 'rgba(160,0,200,',    phase: 4.2 },
  ],
};

const orbLayout = [
  { x: 0.15, y: 0.25, r: 0.38 },
  { x: 0.72, y: 0.18, r: 0.32 },
  { x: 0.50, y: 0.60, r: 0.42 },
  { x: 0.85, y: 0.72, r: 0.28 },
];

export default function CinematicBackground({ subject = 'science' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const subjectRef = useRef(subject);

  useEffect(() => {
    subjectRef.current = subject;
  }, [subject]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let t = 0;

    // ── Star field (100 stars) ─────────────────────────────────────
    const stars = Array.from({ length: 100 }, () => ({
      x:     Math.random(),
      y:     Math.random(),
      r:     Math.random() * 1.3 + 0.25,
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 1.4,
    }));

    // ── Tiny rising particles ──────────────────────────────────────
    const particleColors = ['#a78bfa', '#2dd4bf', '#fbbf24', '#f472b6', '#60a5fa'];
    interface Particle { x: number; y: number; vy: number; vx: number; alpha: number; r: number; color: string; }
    const particles: Particle[] = [];
    let particleTimer = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      t += 0.003;
      particleTimer += 0.003;

      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // ── Base ──────────────────────────────────────────────────────
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, W, H);

      // ── Aurora Orbs ───────────────────────────────────────────────
      const palette = subjectOrbs[subjectRef.current] ?? subjectOrbs.science;
      palette.forEach((orb, i) => {
        const layout = orbLayout[i];
        const ox = (layout.x + Math.sin(t * 0.9 + orb.phase) * 0.09) * W;
        const oy = (layout.y + Math.cos(t * 0.65 + orb.phase) * 0.07) * H;
        const radius = layout.r * Math.min(W, H);
        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
        grad.addColorStop(0, orb.color + '0.22)');
        grad.addColorStop(0.5, orb.color + '0.08)');
        grad.addColorStop(1, orb.color + '0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      });

      // ── Perspective Vanishing-Point Grid ──────────────────────────
      const horizon = H * 0.72;
      const vpX = W / 2;
      ctx.strokeStyle = 'rgba(100,60,255,0.14)';
      ctx.lineWidth = 1;

      // Radial lines (vanishing point)
      for (let i = -14; i <= 14; i++) {
        ctx.beginPath();
        ctx.moveTo(vpX + i * (W / 12), H);
        ctx.lineTo(vpX, horizon);
        ctx.stroke();
      }

      // Horizontal cross-lines (perspective curve)
      for (let j = 0; j < 10; j++) {
        const y = horizon + (H - horizon) * Math.pow(j / 9, 1.6);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // ── Star Field ────────────────────────────────────────────────
      stars.forEach(s => {
        const alpha = 0.35 + 0.65 * Math.abs(Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
        ctx.fill();
      });

      // ── Rising Particles ──────────────────────────────────────────
      if (particleTimer > 0.15) {
        particles.push({
          x:     Math.random() * W,
          y:     H + 10,
          vy:    -(0.4 + Math.random() * 0.7),
          vx:    (Math.random() - 0.5) * 0.5,
          alpha: 0.6,
          r:     1 + Math.random() * 2.5,
          color: particleColors[Math.floor(Math.random() * particleColors.length)],
        });
        particleTimer = 0;
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y     += p.vy;
        p.x     += p.vx;
        p.alpha -= 0.003;
        if (p.alpha <= 0 || p.y < -20) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }

      // ── Scan Line ─────────────────────────────────────────────────
      const scanY = ((t * 0.07) % 1.2 - 0.1) * H;
      const scanGrad = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
      scanGrad.addColorStop(0,   'rgba(139,92,246,0)');
      scanGrad.addColorStop(0.5, 'rgba(139,92,246,0.04)');
      scanGrad.addColorStop(1,   'rgba(139,92,246,0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 2, W, 4);

      animFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []); // run once; subject changes handled via ref

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100vw',
        height:        '100vh',
        zIndex:        -1,
        pointerEvents: 'none',
      }}
    />
  );
}
