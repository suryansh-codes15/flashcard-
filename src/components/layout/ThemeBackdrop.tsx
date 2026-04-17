'use client';

export default function ThemeBackdrop() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0a0616]">
      {/* Drifting Orbs */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.15]"
        style={{ 
          background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          top: '-10%',
          left: '-5%',
          animation: 'orbDrift 40s linear infinite' 
        }}
      />
      <div 
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.12]"
        style={{ 
          background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)',
          bottom: '-15%',
          right: '-10%',
          animation: 'orbDrift 55s linear infinite reverse' 
        }}
      />

      {/* Sparkle Particles */}
      {[...Array(8)].map((_, i) => (
        <div 
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.4,
            animation: `sparkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{ 
          backgroundImage: 'linear-gradient(rgba(124, 58, 237, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 58, 237, 0.2) 1px, transparent 1px)', 
          backgroundSize: '80px 80px' 
        }}
      />
    </div>
  );
}
