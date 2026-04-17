'use client';

type MascotSubject = 'math' | 'science' | 'geography' | 'history' | 'language';

interface Props {
  subject: MascotSubject;
  className?: string;
}

export default function MascotSVG({ subject, className = "" }: Props) {
  const configs = {
    math: { color: "#f97316", accent: "#fb923c" },
    science: { color: "#a855f7", accent: "#c084fc" },
    geography: { color: "#3b82f6", accent: "#60a5fa" },
    history: { color: "#f59e0b", accent: "#fbbf24" },
    language: { color: "#ec4899", accent: "#f472b6" },
  };

  const { color, accent } = configs[subject] || configs.math;

  return (
    <div className={`relative mascot-bounce ${className}`}>
      <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-lg">
        {/* Shadow under character */}
        <ellipse cx="50" cy="92" rx="20" ry="4" fill="rgba(0,0,0,0.1)" />
        
        {/* Body */}
        <circle cx="50" cy="65" r="28" fill={color} />
        
        {/* Head/Face */}
        <circle cx="50" cy="45" r="35" fill={color} />
        
        {/* Eyes */}
        <g>
          {/* Left Eye */}
          <circle cx="38" cy="42" r="7" fill="white" />
          <circle cx="38" cy="42" r="4" fill="#1e293b" />
          <circle cx="40" cy="40" r="1.5" fill="white" /> {/* Glint */}
          
          {/* Right Eye */}
          <circle cx="62" cy="42" r="7" fill="white" />
          <circle cx="62" cy="42" r="4" fill="#1e293b" />
          <circle cx="64" cy="40" r="1.5" fill="white" /> {/* Glint */}
        </g>
        
        {/* Smile */}
        <path 
          d="M 38 58 Q 50 68 62 58" 
          fill="none" 
          stroke="rgba(0,0,0,0.2)" 
          strokeWidth="3" 
          strokeLinecap="round" 
        />
        
        {/* Subject Specific Props */}
        {subject === 'math' && (
          <g>
            {/* Cat Ears */}
            <path d="M 20 25 L 35 15 L 40 30 Z" fill={accent} />
            <path d="M 80 25 L 65 15 L 60 30 Z" fill={accent} />
            {/* Pencil */}
            <rect x="70" y="55" width="6" height="20" rx="1" fill="#fbbf24" transform="rotate(15 73 65)" />
            <path d="M 70 75 L 76 75 L 73 80 Z" fill="#475569" transform="rotate(15 73 65)" />
          </g>
        )}
        
        {subject === 'science' && (
          <g>
            {/* Goggles */}
            <rect x="25" y="32" width="50" height="18" rx="4" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="2" />
            <path d="M 45 41 L 55 41" stroke="white" strokeWidth="2" />
            {/* Flask */}
            <path d="M 75 60 L 85 85 L 65 85 Z" fill="#10b981" fillOpacity="0.8" />
            <rect x="73" y="55" width="4" height="10" fill="#94a3b8" />
          </g>
        )}
        
        {subject === 'geography' && (
          <g>
            {/* Grad Cap */}
            <path d="M 20 20 L 50 10 L 80 20 L 50 30 Z" fill="#1e293b" />
            <rect x="48" y="20" width="4" height="10" fill="#1e293b" />
            {/* Globe */}
            <circle cx="80" cy="75" r="12" fill="#3b82f6" />
            <path d="M 75 70 Q 80 80 85 70" fill="#10b981" />
          </g>
        )}
        
        {subject === 'history' && (
          <g>
            {/* Crown */}
            <path d="M 35 20 L 40 10 L 50 20 L 60 10 L 65 20 Z" fill="#fbbf24" />
            {/* Scroll */}
            <rect x="70" y="60" width="10" height="25" rx="2" fill="#ffedd5" stroke="#92400e" strokeWidth="1" />
            <path d="M 70 65 L 80 65" stroke="#92400e" strokeWidth="1" />
          </g>
        )}
        
        {subject === 'language' && (
          <g>
            {/* Speech Bubble Hands */}
            <path d="M 15 65 Q 5 65 5 75 Q 5 85 15 85 L 25 85 L 25 75 Z" fill="white" fillOpacity="0.8" />
            <path d="M 85 65 Q 95 65 95 75 Q 95 85 85 85 L 75 85 L 75 75 Z" fill="white" fillOpacity="0.8" />
          </g>
        )}
      </svg>
    </div>
  );
}
