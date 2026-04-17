'use client';

/* ──────────────────────────────────────────────────────────
   Sparky & Nova — FlashForge Mascot SVG Characters
   Each has a gentle floating animation (translateY -8px loop)
   ────────────────────────────────────────────────────────── */

export function Sparky() {
  return (
    <>
      <style>{`
        @keyframes sparkyFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes sparkyTailFlash {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 4px #FFD700); }
          50%       { opacity: 0.7; filter: drop-shadow(0 0 12px #FFD700); }
        }
        .sparky-root {
          animation: sparkyFloat 3s ease-in-out infinite;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
        }
        .sparky-tail {
          animation: sparkyTailFlash 1.8s ease-in-out infinite;
        }
      `}</style>

      <div className="sparky-root">
        <svg width="90" height="128" viewBox="0 0 90 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Drop shadow */}
          <ellipse cx="47" cy="124" rx="24" ry="4" fill="rgba(0,0,0,0.35)" />

          {/* Body */}
          <ellipse cx="45" cy="90" rx="26" ry="28" fill="#FF8C00" />
          {/* Belly patch */}
          <ellipse cx="45" cy="94" rx="14" ry="16" fill="#FFBB66" opacity="0.6" />

          {/* Feet */}
          <ellipse cx="32" cy="115" rx="9" ry="6" fill="#FF6600" />
          <ellipse cx="58" cy="115" rx="9" ry="6" fill="#FF6600" />

          {/* Head */}
          <circle cx="45" cy="46" r="28" fill="#FFA500" />

          {/* Ears */}
          <polygon points="18,28 7,4 30,20" fill="#FF6600" />
          <polygon points="18,28 10,10 26,22" fill="#FFBB77" />
          <polygon points="72,28 83,4 60,20" fill="#FF6600" />
          <polygon points="72,28 80,10 64,22" fill="#FFBB77" />

          {/* Eye whites */}
          <circle cx="35" cy="43" r="8"  fill="white" />
          <circle cx="55" cy="43" r="8"  fill="white" />
          {/* Pupils */}
          <circle cx="36" cy="44" r="4"  fill="#1a1a2e" />
          <circle cx="56" cy="44" r="4"  fill="#1a1a2e" />
          {/* Eye glints */}
          <circle cx="37.5" cy="42.5" r="1.5" fill="white" />
          <circle cx="57.5" cy="42.5" r="1.5" fill="white" />

          {/* Nose */}
          <ellipse cx="45" cy="52" rx="3" ry="2" fill="#CC4400" />

          {/* Smile */}
          <path d="M38 58 Q45 66 52 58" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Cheek blush */}
          <circle cx="22" cy="50" r="5" fill="#FF6060" opacity="0.3" />
          <circle cx="68" cy="50" r="5" fill="#FF6060" opacity="0.3" />

          {/* Lightning-bolt tail */}
          <g className="sparky-tail">
            <polyline
              points="63,95 74,78 66,78 80,58"
              stroke="#FFD700"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="63,95 74,78 66,78 80,58"
              stroke="#FFF8AA"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />
          </g>
        </svg>
      </div>
    </>
  );
}

export function Nova() {
  return (
    <>
      <style>{`
        @keyframes novaFloat {
          0%, 100% { transform: translateY(0px) rotate(0.5deg); }
          50%       { transform: translateY(-8px) rotate(-0.5deg); }
        }
        @keyframes novaEyeGlow {
          0%, 100% { filter: drop-shadow(0 0 4px #00FFFF); }
          50%       { filter: drop-shadow(0 0 12px #00FFFF); }
        }
        @keyframes novaChest {
          0%, 100% { opacity: 0.8; r: 5px; }
          50%       { opacity: 1; r: 7px; }
        }
        .nova-root {
          animation: novaFloat 3.5s ease-in-out infinite;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
        }
        .nova-eyes {
          animation: novaEyeGlow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="nova-root">
        <svg width="80" height="128" viewBox="0 0 80 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Drop shadow */}
          <ellipse cx="40" cy="124" rx="22" ry="4" fill="rgba(0,0,0,0.35)" />

          {/* Antenna stem */}
          <line x1="40" y1="8" x2="40" y2="26" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
          {/* Star antenna tip */}
          <polygon points="40,1 42,7 48,7 43,11 45,17 40,13 35,17 37,11 32,7 38,7" fill="#FFD700" />

          {/* Head */}
          <rect x="12" y="26" width="56" height="46" rx="12" fill="#6d28d9" />
          {/* Head highlight */}
          <rect x="12" y="26" width="56" height="18" rx="12" fill="#7c3aed" opacity="0.5" />

          {/* Eyes */}
          <g className="nova-eyes">
            <rect x="17" y="38" width="18" height="12" rx="4" fill="#00FFFF" />
            <rect x="45" y="38" width="18" height="12" rx="4" fill="#00FFFF" />
            {/* Pupil dots */}
            <circle cx="26" cy="44" r="3" fill="#003333" />
            <circle cx="54" cy="44" r="3" fill="#003333" />
            {/* Eye glints */}
            <circle cx="28" cy="41" r="1.5" fill="white" opacity="0.8" />
            <circle cx="56" cy="41" r="1.5" fill="white" opacity="0.8" />
          </g>

          {/* Mouth grille */}
          <rect x="22" y="56" width="36" height="8" rx="4" fill="#4c1d95" />
          <rect x="26" y="57.5" width="6" height="5" rx="1.5" fill="#00FFFF" opacity="0.9" />
          <rect x="35" y="57.5" width="6" height="5" rx="1.5" fill="#00FFFF" opacity="0.9" />
          <rect x="44" y="57.5" width="6" height="5" rx="1.5" fill="#00FFFF" opacity="0.9" />

          {/* Neck connector */}
          <rect x="32" y="70" width="16" height="6" rx="3" fill="#5b21b6" />

          {/* Body */}
          <rect x="10" y="76" width="60" height="44" rx="10" fill="#5b21b6" />
          {/* Body highlight */}
          <rect x="10" y="76" width="60" height="16" rx="10" fill="#6d28d9" opacity="0.5" />

          {/* Body panel lines */}
          <line x1="22" y1="84" x2="58" y2="84" stroke="#4c1d95" strokeWidth="1" opacity="0.6" />
          <line x1="22" y1="90" x2="58" y2="90" stroke="#4c1d95" strokeWidth="1" opacity="0.4" />

          {/* Chest reactor */}
          <circle cx="40" cy="100" r="10" fill="#7c3aed" />
          <circle cx="40" cy="100" r="7"  fill="#a78bfa" opacity="0.85" />
          <circle cx="40" cy="100" r="4"  fill="#c4b5fd" />
          <circle cx="40" cy="100" r="2"  fill="white"   opacity="0.8" />

          {/* Arms */}
          <rect x="0"  y="80" width="12" height="30" rx="6" fill="#4c1d95" />
          <rect x="68" y="80" width="12" height="30" rx="6" fill="#4c1d95" />
          {/* Hand joints */}
          <circle cx="6"  cy="112" r="6" fill="#3b0764" />
          <circle cx="74" cy="112" r="6" fill="#3b0764" />

          {/* Legs */}
          <rect x="18" y="118" width="18" height="10" rx="5" fill="#4c1d95" />
          <rect x="44" y="118" width="18" height="10" rx="5" fill="#4c1d95" />
        </svg>
      </div>
    </>
  );
}
