'use client';

// Topic detection from card text
function detectTopic(text = ''): string {
  const t = text.toLowerCase();
  if (/bio|cell|dna|gene|organ|plant|animal|species|evolut|photosyn|mitosis/.test(t)) return 'biology';
  if (/chem|molecule|atom|bond|reaction|element|compound|acid|base|periodic/.test(t)) return 'chemistry';
  if (/math|equation|calcul|integr|deriv|algebra|geometry|trigon|proof|vector|matrix/.test(t)) return 'math';
  if (/history|war|empire|ancient|century|revolution|king|queen|dynasty|civiliz|battle/.test(t)) return 'history';
  if (/space|planet|star|galaxy|orbit|cosmos|astro|universe|black hole|nebula|comet/.test(t)) return 'space';
  if (/code|program|function|class|array|algorithm|debug|javascript|python|loop|variable/.test(t)) return 'coding';
  if (/language|grammar|vocab|verb|noun|translate|french|spanish|latin|syntax|phrase/.test(t)) return 'language';
  return 'default';
}

const illustrations: Record<string, React.ReactNode> = {
  biology: (
    <svg viewBox="0 0 60 60" width="68" height="68">
      <ellipse cx="30" cy="30" rx="6" ry="22" fill="none" stroke="#4ade80" strokeWidth="2.5"/>
      <ellipse cx="30" cy="30" rx="14" ry="6" fill="none" stroke="#86efac" strokeWidth="2" transform="rotate(45 30 30)"/>
      <ellipse cx="30" cy="30" rx="14" ry="6" fill="none" stroke="#86efac" strokeWidth="2" transform="rotate(-45 30 30)"/>
      <circle cx="30" cy="10" r="3" fill="#4ade80"/>
      <circle cx="30" cy="50" r="3" fill="#4ade80"/>
      <circle cx="18" cy="22" r="2.5" fill="#86efac"/>
      <circle cx="42" cy="38" r="2.5" fill="#86efac"/>
    </svg>
  ),
  chemistry: (
    <svg viewBox="0 0 60 60" width="68" height="68">
      <rect x="26" y="8" width="8" height="14" rx="2" fill="#a78bfa"/>
      <path d="M18 22 L12 50 Q12 54 18 54 L42 54 Q48 54 48 50 L42 22 Z" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="2"/>
      <ellipse cx="30" cy="42" rx="10" ry="6" fill="rgba(0,255,200,0.3)"/>
      <circle cx="22" cy="38" r="3" fill="#00ffc8" opacity="0.8"/>
      <circle cx="36" cy="45" r="2" fill="#00ffc8" opacity="0.6"/>
      <circle cx="28" cy="48" r="2.5" fill="#00ffc8" opacity="0.7"/>
    </svg>
  ),
  math: (
    <svg viewBox="0 0 60 60" width="68" height="68">
      <text x="6" y="38" fontSize="36" fill="#fbbf24" fontWeight="bold" fontFamily="serif">Σ</text>
      <line x1="8" y1="48" x2="52" y2="48" stroke="#fbbf24" strokeWidth="2" opacity="0.4"/>
      <polyline points="8,46 18,30 28,38 40,18 52,24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  history: (
    <svg viewBox="0 0 60 60" width="68" height="68">
      <rect x="12" y="10" width="36" height="44" rx="4" fill="rgba(251,191,36,0.12)" stroke="#fbbf24" strokeWidth="2"/>
      <path d="M12 10 Q30 4 48 10" fill="rgba(251,191,36,0.25)" stroke="#fbbf24" strokeWidth="1.5"/>
      <path d="M12 54 Q30 60 48 54" fill="rgba(251,191,36,0.25)" stroke="#fbbf24" strokeWidth="1.5"/>
      <line x1="20" y1="22" x2="40" y2="22" stroke="#fbbf24" strokeWidth="1.5" opacity="0.7"/>
      <line x1="20" y1="30" x2="40" y2="30" stroke="#fbbf24" strokeWidth="1.5" opacity="0.7"/>
      <line x1="20" y1="38" x2="32" y2="38" stroke="#fbbf24" strokeWidth="1.5" opacity="0.7"/>
    </svg>
  ),
  space: (
    <svg viewBox="0 0 60 60" width="68" height="68">
      <circle cx="30" cy="30" r="14" fill="rgba(99,102,241,0.25)" stroke="#818cf8" strokeWidth="2"/>
      <ellipse cx="30" cy="30" rx="26" ry="9" fill="none" stroke="#a78bfa" strokeWidth="2" transform="rotate(-20 30 30)"/>
      <circle cx="30" cy="30" r="5" fill="#818cf8"/>
      <circle cx="10" cy="14" r="2" fill="white" opacity="0.8"/>
      <circle cx="50" cy="18" r="1.5" fill="white" opacity="0.6"/>
      <circle cx="46" cy="48" r="1.5" fill="white" opacity="0.7"/>
    </svg>
  ),
  coding: (
    <svg viewBox="0 0 60 60" width="68" height="68">
      <rect x="6" y="12" width="48" height="36" rx="6" fill="rgba(30,20,60,0.6)" stroke="#7c3aed" strokeWidth="2"/>
      <circle cx="14" cy="20" r="2.5" fill="#ff5f57"/>
      <circle cx="22" cy="20" r="2.5" fill="#fbbf24"/>
      <circle cx="30" cy="20" r="2.5" fill="#4ade80"/>
      <text x="10" y="38" fontSize="12" fill="#a78bfa" fontFamily="monospace">{'</>'}</text>
      <line x1="10" y1="43" x2="35" y2="43" stroke="#7c3aed" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  ),
  language: (
    <svg viewBox="0 0 60 60" width="68" height="68">
      <rect x="6" y="8" width="38" height="28" rx="8" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" strokeWidth="2"/>
      <polygon points="14,36 10,50 24,40" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" strokeWidth="1.5"/>
      <circle cx="16" cy="22" r="3" fill="#38bdf8"/>
      <circle cx="25" cy="22" r="3" fill="#38bdf8"/>
      <circle cx="34" cy="22" r="3" fill="#38bdf8"/>
    </svg>
  ),
  default: (
    <svg viewBox="0 0 60 60" width="68" height="68">
      <path d="M30 10 C18 10 12 20 14 28 C15 34 20 38 22 42 L38 42 C40 38 45 34 46 28 C48 20 42 10 30 10Z" fill="rgba(251,191,36,0.18)" stroke="#fbbf24" strokeWidth="2"/>
      <rect x="22" y="42" width="16" height="5" rx="2" fill="#fbbf24" opacity="0.7"/>
      <rect x="24" y="47" width="12" height="4" rx="2" fill="#fbbf24" opacity="0.5"/>
      <line x1="30" y1="28" x2="30" y2="38" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="30" cy="24" r="2" fill="#fbbf24"/>
    </svg>
  ),
};

interface Props {
  cardText: string;
}

export default function CardIllustration({ cardText }: Props) {
  const topic = detectTopic(cardText);
  return (
    <div
      className="absolute top-3 right-3 pointer-events-none select-none"
      style={{ opacity: 0.5, filter: 'drop-shadow(0 0 6px currentColor)' }}
      aria-hidden="true"
    >
      {illustrations[topic]}
    </div>
  );
}
