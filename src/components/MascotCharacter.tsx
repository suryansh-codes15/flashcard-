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
  
  // Animation timing offset based on side
  const offsetDelay = side === 'right' ? '0.5s' : '0s';

  // Dynamic Animation Class mapping
  const animationClass = {
    idle: `animate-[charIdle_3.5s_ease-in-out_infinite]`,
    reading: `animate-[charRead_3.2s_ease-in-out_infinite]`,
    dancing: `animate-[charDance_2s_ease-in-out_infinite]`,
    jumping: 'animate-[charJump_0.7s_ease-out]',
    sad: 'rotate-[12deg] translate-y-1.5 opacity-80 transition-all duration-400',
  }[state];

  // Unique Features Rendering
  const renderHeadFeature = () => {
    switch(subject) {
      case 'science': // Sparky - Star Crown
        return <path d="M 44 2 L 48 10 L 56 10 L 50 16 L 52 24 L 44 19 L 36 24 L 38 16 L 32 10 L 40 10 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />;
      case 'math': // Nova - Cat Ears
        return (
          <g>
            <path d="M 22 18 L 12 5 L 32 15 Z" fill={body} />
            <path d="M 66 18 L 76 5 L 56 15 Z" fill={body} />
          </g>
        );
      case 'geography': // Atlas - Graduation Cap
        return (
          <g transform="translate(14, -10)">
            <rect x="0" y="5" width="60" height="15" rx="2" fill="#1e293b" />
            <path d="M 0 12 L 30 0 L 60 12 L 30 24 Z" fill="#1e293b" />
            <line x1="60" y1="12" x2="60" y2="25" stroke="#fbbf24" strokeWidth="2" />
            <circle cx="60" cy="25" r="3" fill="#fbbf24" />
          </g>
        );
      case 'history': // Lexie - Scroll Crown
        return (
          <g transform="translate(24, 0)">
             <rect x="0" y="0" width="40" height="12" rx="6" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
             <path d="M 35 0 C 45 0 45 12 35 12" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
          </g>
        );
      default: return null;
    }
  };

  const renderProps = () => {
    switch(subject) {
      case 'science': // Book
        return (
          <g transform="translate(20, 55)">
            <rect x="0" y="0" width="48" height="25" rx="2" fill="white" stroke={body} strokeWidth="1" />
            <line x1="24" y1="2" x2="24" y2="23" stroke={body} strokeWidth="1" />
            <g opacity="0.4">
              <line x1="6" y1="8" x2="18" y2="8" stroke="#1e293b" strokeWidth="1" />
              <line x1="6" y1="14" x2="18" y2="14" stroke="#1e293b" strokeWidth="1" />
              <line x1="30" y1="8" x2="42" y2="8" stroke="#1e293b" strokeWidth="1" />
              <line x1="30" y1="14" x2="42" y2="14" stroke="#1e293b" strokeWidth="1" />
            </g>
            {/* Hands */}
            <rect x="-8" y="5" width="12" height="8" rx="4" fill={body} />
            <rect x="44" y="5" width="12" height="8" rx="4" fill={body} />
          </g>
        );
      case 'math': // Pom-poms
        return (
          <g className="animate-[pomPomWave_1.5s_ease-in-out_infinite]">
            <g transform="translate(10, 65)">
               <circle cx="0" cy="0" r="8" fill={body} opacity="0.8" />
               <circle cx="-4" cy="-4" r="6" fill="#fb7185" />
               <circle cx="4" cy="-4" r="6" fill="#6ee7b7" />
            </g>
            <g transform="translate(78, 65)">
               <circle cx="0" cy="0" r="8" fill={body} opacity="0.8" />
               <circle cx="-4" cy="-4" r="6" fill="#6ee7b7" />
               <circle cx="4" cy="-4" r="6" fill="#fb7185" />
            </g>
          </g>
        );
      case 'geography': // Globe
        return (
          <g transform="translate(24, 55)">
            <circle cx="20" cy="15" r="15" fill="#3b82f6" stroke="white" strokeWidth="1" />
            <path d="M 5 15 Q 20 15 35 15 M 20 0 Q 20 15 20 30" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <rect x="-5" y="10" width="10" height="8" rx="4" fill={body} />
            <rect x="35" y="10" width="10" height="8" rx="4" fill={body} />
          </g>
        );
      case 'history': // Scroll
        return (
          <g transform="translate(24, 60)">
             <rect x="0" y="0" width="40" height="15" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
             <rect x="-4" y="2" width="12" height="11" rx="4" fill={body} />
             <rect x="32" y="2" width="12" height="11" rx="4" fill={body} />
          </g>
        );
      default: return null;
    }
  };

  const renderExpression = () => {
    switch(subject) {
      case 'science': // Focused
        return (
          <g>
            <path d="M 30 28 Q 34 26 38 28" fill="none" stroke="#1e293b" strokeWidth="1.5" />
            <path d="M 50 28 Q 54 26 58 28" fill="none" stroke="#1e293b" strokeWidth="1.5" />
            <path d="M 38 48 Q 44 52 50 48" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case 'math': // Huge smile + Cheeks
        return (
          <g>
            <circle cx="22" cy="45" r="5" fill="#fb7185" opacity="0.5" />
            <circle cx="66" cy="45" r="5" fill="#fb7185" opacity="0.5" />
            <path d="M 32 48 Q 44 62 56 48" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      case 'geography': // Wise smile
        return <path d="M 36 50 Q 44 55 52 50" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />;
      case 'history': // Curious
        return (
          <g>
            <path d="M 30 25 Q 34 20 38 25" fill="none" stroke="#1e293b" strokeWidth="1.5" />
            <path d="M 36 50 Q 44 53 52 50" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      default: return <path d="M 36 50 Q 44 58 52 50" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />;
    }
  };

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`relative w-[88px] h-[110px] cursor-pointer transition-all duration-300 ${animationClass} ${className} group`}
      style={{ filter: `drop-shadow(0 0 15px ${body}55)` }}
    >
      <svg viewBox="0 0 88 110" className="w-full h-full overflow-visible">
        {/* Ground Shadow */}
        <ellipse cx="44" cy="106" rx="30" ry="4" fill="rgba(0,0,0,0.4)" />

        <g>
          {/* Leg animations sync with group */}
          <rect x="28" y="85" width="10" height="15" rx="5" fill={body} />
          <rect x="50" y="85" width="10" height="15" rx="5" fill={body} />

          {/* Body */}
          <rect x="20" y="45" width="48" height="45" rx="14" fill={body} />

          {/* Head & Features */}
          <g>
            <circle cx="44" cy="38" r="28" fill={face} />
            {renderHeadFeature()}
          </g>

          {/* Eyes Group with Blinking */}
          <g className="origin-center animate-[eyeBlink_4s_ease-in-out_infinite]" style={{ animationDelay: offsetDelay }}>
            <ellipse cx="34" cy="35" rx="4" ry="6" fill="#1e293b" />
            <circle cx="35" cy="32" r="1.5" fill="white" />
            
            <ellipse cx="54" cy="35" rx="4" ry="6" fill="#1e293b" />
            <circle cx="55" cy="32" r="1.5" fill="white" />
          </g>

          {/* Expression */}
          {state === 'sad' ? (
            <path d="M 36 52 Q 44 47 52 52" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          ) : renderExpression()}

          {/* Props */}
          {renderProps()}
        </g>
      </svg>
      
      {/* Subject Name Label */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {name}
      </span>
    </div>
  );
}
