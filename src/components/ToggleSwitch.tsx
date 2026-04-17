'use client';

interface Props {
  enabled: boolean;
  onChange: (val: boolean) => void;
  className?: string;
}

export default function ToggleSwitch({ enabled, onChange, className = "" }: Props) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-[42px] h-[24px] rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
        enabled ? 'bg-purple-600' : 'bg-[#1a1040] border border-white/10'
      } ${className}`}
    >
      <div
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${
          enabled ? 'translate-x-[18px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
