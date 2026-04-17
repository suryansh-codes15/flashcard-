'use client';

import { useState, useEffect } from 'react';

export default function XPFloatingScore() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setActive(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[110] flex items-center justify-center">
      <span className="text-3xl font-black text-purple-400 drop-shadow-[0_0_20px_rgba(167,139,250,0.6)] animate-[scoreFloat_1.5s_ease-out_forwards]">
        +10 XP
      </span>
    </div>
  );
}
