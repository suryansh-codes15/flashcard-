'use client';

export type MascotSubject = 'math' | 'science' | 'geography' | 'history' | 'language';

interface Props {
  subject: MascotSubject;
  className?: string;
}

export default function MascotCharacter({ subject, className = "" }: Props) {
  const configs = {
    math: { color: "#059669", accent: "#fbbf24", name: "Nova 🧪" },      // Green + Amber
    science: { color: "#7c3aed", accent: "#fbbf24", name: "Sparky ⚡" },    // Purple + Amber
    geography: { color: "#2563eb", accent: "#f3f4f6", name: "Atlas 🌍" }, // Blue + White
    history: { color: "#db2777", accent: "#fbbf24", name: "Lexie 📝" },    // Pink + Amber
    language: { color: "#7c3aed", accent: "#f3f4f6", name: "Lingu 💬" },  // Default fallback
  };

  const { color, accent } = configs[subject] || configs.science;

  return (
    <div className={`relative flex flex-col items-center group ${className}`}>
      <svg viewBox="0 0 100 120" className="w-full h-full animate-mascot drop-shadow-[0_0_15px_rgba(124,58,237,0.3)]">
        {/* Shadow */}
        <ellipse cx="50" cy="110" rx="25" ry="5" fill="rgba(0,0,0,0.2)" />
        
        {/* Body (Matching colored blob) */}
        <path 
          d="M 20 80 Q 50 100 80 80 L 80 50 Q 50 40 20 50 Z" 
          fill={color} 
        />
        
        {/* Head (Chibi Round) */}
        <circle cx="50" cy="45" r="35" fill={accent} />
        
        {/* Eyes (Large with white glint) */}
        <g>
          <circle cx="38" cy="42" r="7" fill="white" />
          <circle cx="38" cy="42" r="4" fill="#111" />
          <circle cx="40" cy="40" r="1.5" fill="white" />
          
          <circle cx="62" cy="42" r="7" fill="white" />
          <circle cx="62" cy="42" r="4" fill="#111" />
          <circle cx="64" cy="40" r="1.5" fill="white" />
        </g>
        
        {/* Wide Smile Arc */}
        <path 
          d="M 38 60 Q 50 70 62 60" 
          fill="none" 
          stroke="rgba(0,0,0,0.3)" 
          strokeWidth="3" 
          strokeLinecap="round" 
        />

        {/* Level Indicator Wings/Ears */}
        {subject === 'science' && (
          <path d="M 15 25 L 10 10 L 30 15 Z M 85 25 L 90 10 L 70 15 Z" fill={color} />
        )}
        {subject === 'math' && (
          <path d="M 20 20 Q 15 10 30 15 M 80 20 Q 85 10 70 15" stroke={color} strokeWidth="4" fill="none" />
        )}
      </svg>
    </div>
  );
}
