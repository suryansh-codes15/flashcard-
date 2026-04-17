'use client';

import { useState, useEffect } from 'react';

export default function VictoryConfetti() {
  const [pieces, setPieces] = useState<any[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 800,
      y: (Math.random() - 0.5) * 800,
      color: ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'][Math.floor(Math.random() * 6)],
      size: 8 + Math.random() * 8,
      delay: Math.random() * 0.5,
      radius: Math.random() > 0.5 ? '50%' : '2px',
    }));
    setPieces(newPieces);
    
    const timer = setTimeout(() => setPieces([]), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
      {pieces.map((p) => (
        <div 
          key={p.id}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.radius,
            '--tw-translate-x': `${p.x}px`,
            '--tw-translate-y': `${p.y}px`,
            animation: `confettiFly 2s ease-out forwards`,
            animationDelay: `${p.delay}s`,
          } as any}
        />
      ))}
    </div>
  );
}
