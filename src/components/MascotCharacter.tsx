'use client';

import { MascotSubject } from '../types';

export type MascotState = 'idle' | 'reading' | 'dancing' | 'jumping' | 'sad';

interface Props {
  side: 'left' | 'right';
  name: string;
  subject: MascotSubject;
  state: MascotState;
  onClick?: () => void;
  className?: string;
}

export default function MascotCharacter({ side, name, subject, state, onClick, className = "" }: Props) {
  // Enhanced Color Map for all characters
  const colors = {
    science:   { body: '#8b5cf6', face: '#fbbf24' }, // Sparky (Purple)
    math:      { body: '#10b981', face: '#fbbf24' }, // Nova (Green)
    geography: { body: '#3b82f6', face: '#f8fafc' }, // Atlas (Blue)
    history:   { body: '#f59e0b', face: '#fbbf24' }, // Lexie (Orange)
    language:  { body: '#ec4899', face: '#f8fafc' }, // Pink
  };

  const { body, face } = colors[subject] || colors.science;
  
  // High-level "Home Page" logic: Everyone gets the Sparky crown/book if side is 'left'
  const isSparkyStyle = side === 'left';

  // Dynamic Animation Class mapping
  const animationClass = {
    idle: side === 'left' ? 'animate-[charRead_3s_ease-in-out_infinite]' : 'animate-[charIdle_2.5s_ease-in-out_infinite]',
    reading: 'animate-[charRead_3s_ease-in-out_infinite]',
    dancing: 'animate-[charIdle_2s_ease-in-out_infinite]',
    jumping: 'animate-[charJump_0.7s_ease-out]',
    sad: side === 'left' ? 'rotate-[15deg] translate-y-2' : 'translate-x-[var(--dx)] animate-[shake_0.3s_linear_infinite]',
  }[state];

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`relative w-[88px] h-[110px] cursor-pointer transition-all duration-300 ${animationClass} ${className} group`}
      style={{ filter: `drop-shadow(0 0 15px ${body}55)` }}
    >
      <svg viewBox="0 0 88 110" className="w-full h-full">
        {/* Ground Shadow */}
        <ellipse cx="44" cy="106" rx="30" ry="4" fill="rgba(0,0,0,0.4)" />

        {/* Character Group */}
        <g>
          {/* Legs */}
          <rect x="28" y="85" width="8" height="15" rx="4" fill={body} />
          <rect x="52" y="85" width="8" height="15" rx="4" fill={body} />

          {/* Body */}
          <rect x="20" y="45" width="48" height="45" rx="12" fill={body} />

          {/* Head */}
          <circle cx="44" cy="38" r="28" fill={face} />

          {/* Eyes Group with Blinking */}
          <g className={`origin-center animate-[eyeBlink_4s_ease-in-out_infinite] ${side === 'right' ? 'animation-delay-[500ms]' : ''}`}>
            <ellipse cx="34" cy="35" rx="4" ry="6" fill="#1e293b" />
            <circle cx="35" cy="33" r="1.5" fill="white" />
            
            <ellipse cx="54" cy="35" rx="4" ry="6" fill="#1e293b" />
            <circle cx="55" cy="33" r="1.5" fill="white" />
          </g>

          {/* Mouth / Smile */}
          <path 
            d={state === 'sad' ? "M 36 50 Q 44 45 52 50" : "M 34 48 Q 44 58 54 48"} 
            fill="none" 
            stroke="#1e293b" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />

          {/* Cheek Blush */}
          <circle cx="24" cy="45" r="4" fill="#fb7185" opacity="0.4" />
          <circle cx="64" cy="45" r="4" fill="#fb7185" opacity="0.4" />

          {/* ARMS / PROPS */}
          {isSparkyStyle ? (
            /* Crown + Book Style (Sparky/Atlas/Lexie model) */
            <g>
              {/* Star Crown */}
              <path d="M 44 2 L 47 10 L 55 10 L 49 16 L 51 24 L 44 19 L 37 24 L 39 16 L 33 10 L 41 10 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              
              {/* Hands holding the Book */}
              <g transform="translate(14, 55) rotate(-10)">
                <rect x="0" y="0" width="12" height="6" rx="2" fill={body} />
                <g transform="translate(30, 0) rotate(20)">
                   <rect x="0" y="0" width="12" height="6" rx="2" fill={body} />
                </g>
                {/* The Book */}
                <g transform="translate(10, -5)">
                  <rect x="0" y="0" width="28" height="18" rx="2" fill="white" stroke={body} strokeWidth="1" />
                  <line x1="14" y1="2" x2="14" y2="16" stroke={body} strokeWidth="1" />
                  <line x1="4" y1="6" x2="10" y2="6" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="4" y1="10" x2="10" y2="10" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="18" y1="6" x2="24" y2="6" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="18" y1="10" x2="24" y2="10" stroke="#94a3b8" strokeWidth="1" />
                </g>
              </g>
            </g>
          ) : (
            /* Nova's original Pom-pom style (Variant with Ears) */
            <g>
              {/* Cat Ears */}
              <path d="M 22 18 L 12 5 L 32 15 Z" fill={body} />
              <path d="M 66 18 L 76 5 L 56 15 Z" fill={body} />
              
              {/* Pom-poms */}
              <g transform="translate(10, 65) rotate(-20)">
                <rect x="0" y="0" width="8" height="6" rx="2" fill={body} />
                <circle cx="0" cy="0" r="4" fill="#10b981" />
                <circle cx="4" cy="-3" r="4" fill="#f472b6" />
                <circle cx="-4" cy="-3" r="4" fill="#10b981" />
              </g>
              <g transform="translate(70, 65) rotate(20)">
                <rect x="0" y="0" width="8" height="6" rx="2" fill={body} />
                <circle cx="8" cy="0" r="4" fill="#f472b6" />
                <circle cx="4" cy="-3" r="4" fill="#10b981" />
                <circle cx="12" cy="-3" r="4" fill="#f472b6" />
              </g>
            </g>
          )}
        </g>
      </svg>
      
      {/* Subject Name Label (Visible on Hover or forced) */}
      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-white/30 uppercase tracking-[0.2em] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {name}
      </span>
    </div>
  );
}
