'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useStudyStats } from '@/hooks/useStudyStats';

export default function NavBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const stats = useStudyStats();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const links = [
    { label: 'Home',      path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Forge',     path: '/upload' },
    { label: 'Stats',     path: '/stats' },
    { label: 'Settings',  path: '/settings' },
  ];

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <>
      <nav className="sticky top-0 z-[100] w-full border-b border-[#1a1040] bg-[#0f0a1e]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Leftside: Logo + Stats */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
              <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)] group-hover:scale-110 transition-transform">
                <span className="text-lg">⚡</span>
              </div>
              <span className="text-xl font-bold tracking-tighter text-white hidden sm:inline">
                Flash<span className="text-purple-400">Forge</span>
              </span>
            </Link>

            {/* Live Stats */}
            {hydrated && (
              <div className="hidden sm:flex items-center gap-3">
                <div className="px-3 py-1 bg-[#1a1040] border border-white/5 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                  <span className="text-sm">🪙</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none translate-y-[0.5px]">
                    {stats.totalXP.toLocaleString()} XP
                  </span>
                </div>
                {stats.streak > 0 && (
                  <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-1.5">
                    <span className="text-sm">🔥</span>
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none translate-y-[0.5px]">
                      {stats.streak}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.06em] transition-all duration-200
                  ${isActive(link.path)
                    ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                    : 'text-gray-400 hover:text-purple-400 hover:bg-white/5'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile slide-down menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-[#1a1040]
            ${mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="px-4 py-3 flex flex-col gap-1 bg-[#0a0616]/95 backdrop-blur-xl">
             {hydrated && (
              <div className="flex items-center gap-3 mb-4 mt-2 px-4">
                <div className="px-3 py-1 bg-[#1a1040] border border-white/5 rounded-full flex items-center gap-1.5">
                  <span className="text-sm">🪙</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none translate-y-[0.5px]">
                    {stats.totalXP.toLocaleString()} XP
                  </span>
                </div>
                {stats.streak > 0 && (
                  <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-1.5">
                    <span className="text-sm">🔥</span>
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none translate-y-[0.5px]">
                      {stats.streak}
                    </span>
                  </div>
                )}
              </div>
            )}
            {links.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.06em] transition-all duration-200
                  ${isActive(link.path)
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-purple-400 hover:bg-white/5'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
