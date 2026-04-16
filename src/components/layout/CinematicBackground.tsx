export function CinematicBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#030305] pointer-events-none">
      {/* Subtle Noise Texture */}
      <div 
        className="absolute inset-0 z-10 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      ></div>
      
      {/* Animated Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-600/20 blur-[120px] animate-float-slow mix-blend-screen"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-accent-600/20 blur-[130px] animate-float-medium mix-blend-screen" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-cyan-600/15 blur-[100px] animate-float-slow mix-blend-screen" style={{ animationDelay: '4s' }}></div>
    </div>
  );
}
