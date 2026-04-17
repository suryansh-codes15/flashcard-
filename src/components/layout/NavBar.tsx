'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();

  const links = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Forge', path: '/upload' },
    { label: 'Stats', path: '/stats' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-[#1a1040] bg-[#0f0a1e]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)] group-hover:scale-110 transition-transform">
            <span className="text-lg">⚡</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">
            Flash<span className="text-purple-400">Forge</span>
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
            return (
              <Link 
                key={link.path} 
                href={link.path}
                className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.06em] transition-all
                  ${isActive 
                    ? 'bg-[#1a1040] text-purple-400 border border-purple-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Spacer / Placeholder */}
        <div className="md:hidden">
          <button className="p-2 text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
