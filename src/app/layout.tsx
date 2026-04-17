import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, Syne } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { CinematicBackground } from '@/components/layout/CinematicBackground';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FlashForge — AI Master Study Engine',
  description: 'Privacy-first, AI-powered flashcards with deep space kinematics.',
};

import ThemeBackdrop from '@/components/layout/ThemeBackdrop';
import NavBar from '@/components/layout/NavBar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="custom-scrollbar">
      <body className={`${inter.variable} font-sans antialiased bg-[#0a0616]`}>
        <ThemeBackdrop />
        <div className="relative z-10 flex flex-col min-h-screen">
          <NavBar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
