'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LayoutDashboard, Upload, Moon, Sun, Menu, X, Plus } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload PDF', icon: Upload },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to change navbar style
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Dark pages (landing, practice) have a transparent start
  const isDarkPage = pathname === '/' || pathname.startsWith('/practice');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div
        className="px-4 sm:px-6 transition-all duration-500"
        style={{
          background: scrolled || !isDarkPage
            ? 'var(--glass)'
            : 'transparent',
          backdropFilter: scrolled || !isDarkPage ? 'blur(24px)' : 'none',
          WebkitBackdropFilter: scrolled || !isDarkPage ? 'blur(24px)' : 'none',
          borderBottom: scrolled || !isDarkPage ? '1px solid var(--border)' : '1px solid transparent',
        }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 6 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
              <Zap className="w-4.5 h-4.5 text-white" fill="white" />
            </motion.div>
            <span className="font-black text-lg tracking-tight hidden sm:block"
              style={{ fontFamily: 'Syne, sans-serif', color: isDarkPage && !scrolled ? 'white' : 'var(--text-primary)' }}>
              Flash<span style={{ color: '#818cf8' }}>Forge</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link key={href} href={href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-400'
                      : isDarkPage && !scrolled
                        ? 'text-white/60 hover:text-white hover:bg-white/8'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]'
                  )}>
                  <Icon className="w-4 h-4" />
                  {label}
                  {isActive && (
                    <motion.div layoutId="nav-active"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'rgba(99,102,241,0.1)' }} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{
                color: isDarkPage && !scrolled ? 'rgba(255,255,255,0.5)' : 'var(--text-secondary)',
                background: 'transparent',
              }}
              aria-label="Toggle theme">
              <AnimatePresence mode="wait">
                <motion.div key={theme}
                  initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                  transition={{ duration: 0.18 }}>
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* CTA */}
            <Link href="/upload" className="hidden sm:flex btn-brand text-sm py-2 px-4 gap-2">
              <Plus className="w-4 h-4" />
              New Deck
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ color: isDarkPage && !scrolled ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden px-4 pb-4 pt-2"
            style={{ background: 'var(--glass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border)' }}>
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold mb-1 transition-colors',
                  pathname === href
                    ? 'bg-indigo-500/12 text-indigo-400'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]'
                )}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <Link href="/upload" onClick={() => setMobileOpen(false)} className="btn-brand w-full justify-center text-sm py-2.5">
                <Plus className="w-4 h-4" />
                New Deck
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
