'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

/* ──────────────────────────────────────────────────────────────
   useXP  —  Hook: manages XP state, confetti burst, popup
   ────────────────────────────────────────────────────────────── */
export function useXP() {
  const [xp, setXp]       = useState(0);
  const [popup, setPopup] = useState<{ id: number; amount: number } | null>(null);

  // Load persisted XP from localStorage on mount
  useEffect(() => {
    const saved = parseInt(localStorage.getItem('flashforge_xp') || '0', 10);
    setXp(isNaN(saved) ? 0 : saved);
  }, []);

  const gainXP = useCallback((amount = 10) => {
    // Canvas-confetti burst
    confetti({
      particleCount: 90,
      spread:        75,
      origin:        { y: 0.62 },
      colors:        ['#a78bfa', '#00FFFF', '#FFD700', '#f472b6', '#34d399'],
      gravity:       1.1,
      scalar:        0.9,
    });

    setXp(prev => {
      const next = prev + amount;
      localStorage.setItem('flashforge_xp', String(next));
      return next;
    });

    setPopup({ id: Date.now(), amount });
    setTimeout(() => setPopup(null), 1300);
  }, []);

  return { xp, gainXP, popup };
}

/* ──────────────────────────────────────────────────────────────
   XPBar  —  Fixed top bar with level, progress, glow on gain
   ────────────────────────────────────────────────────────────── */
interface XPBarProps {
  xp:        number;
  className?: string;
}

export function XPBar({ xp, className = '' }: XPBarProps) {
  const level    = Math.floor(xp / 100) + 1;
  const progress = xp % 100;
  const prevXp   = useRef(xp);
  const [glowing, setGlowing] = useState(false);

  useEffect(() => {
    if (xp > prevXp.current) {
      setGlowing(true);
      setTimeout(() => setGlowing(false), 900);
    }
    prevXp.current = xp;
  }, [xp]);

  return (
    <>
      <style>{`
        @keyframes xpBarPulse {
          0%,100% { box-shadow: 0 0 6px #a78bfa55, 0 0 20px #7c3aed33; }
          50%      { box-shadow: 0 0 16px #a78bfacc, 0 0 40px #7c3aed88; }
        }
        @keyframes xpFill {
          from { opacity:0.5; }
          to   { opacity:1; }
        }
        .xp-bar-glow {
          animation: xpBarPulse 0.9s ease-in-out;
        }
      `}</style>

      <div
        style={{
          position:       'fixed',
          top:            0,
          left:           0,
          right:          0,
          zIndex:         120,
          background:     'rgba(8,4,24,0.88)',
          padding:        '7px 20px',
          display:        'flex',
          alignItems:     'center',
          gap:            '14px',
          backdropFilter: 'blur(12px)',
          borderBottom:   '1px solid rgba(124,58,237,0.18)',
        }}
        className={className}
      >
        {/* Level badge */}
        <div style={{
          background:   'linear-gradient(135deg,#7c3aed,#4c1d95)',
          borderRadius: '999px',
          padding:      '3px 12px',
          boxShadow:    '0 0 10px rgba(124,58,237,0.5)',
        }}>
          <span style={{ color: '#FFD700', fontWeight: 900, fontSize: 11, letterSpacing: '0.12em' }}>
            ⚡ LV.{level}
          </span>
        </div>

        {/* Progress track */}
        <div style={{ flex: 1, background: '#1e1b4b', borderRadius: 8, height: 10, overflow: 'hidden', border: '1px solid rgba(124,58,237,0.25)' }}>
          <div
            className={glowing ? 'xp-bar-glow' : ''}
            style={{
              width:        `${progress}%`,
              height:       '100%',
              borderRadius: 8,
              background:   'linear-gradient(90deg, #7c3aed, #a78bfa, #00FFFF)',
              transition:   'width 0.5s cubic-bezier(.4,0,.2,1)',
              boxShadow:    glowing ? '0 0 14px #a78bfa' : '0 0 6px rgba(167,139,250,0.4)',
            }}
          />
        </div>

        {/* XP label */}
        <span style={{ color: '#a78bfa', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
          {xp.toLocaleString()} XP
        </span>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
   XPPopup  —  Animated "+N XP ⚡" flies upward and fades
   ────────────────────────────────────────────────────────────── */
interface XPPopupProps {
  popup: { id: number; amount: number } | null;
}

export function XPPopup({ popup }: XPPopupProps) {
  if (!popup) return null;

  return (
    <>
      <style>{`
        @keyframes xpfly {
          0%   { opacity:1; transform: translateX(-50%) translateY(0) scale(1); }
          60%  { opacity:1; transform: translateX(-50%) translateY(-50px) scale(1.08); }
          100% { opacity:0; transform: translateX(-50%) translateY(-90px) scale(0.85); }
        }
        .xp-popup-text {
          position:        fixed;
          bottom:          38%;
          left:            50%;
          transform:       translateX(-50%);
          color:           #FFD700;
          font-weight:     900;
          font-size:       32px;
          pointer-events:  none;
          animation:       xpfly 1.3s ease-out forwards;
          z-index:         300;
          text-shadow:     0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(124,58,237,0.6);
          letter-spacing:  0.04em;
          white-space:     nowrap;
        }
      `}</style>
      <div key={popup.id} className="xp-popup-text">
        +{popup.amount} XP ⚡
      </div>
    </>
  );
}
