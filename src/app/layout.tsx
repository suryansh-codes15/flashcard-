import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ThemeBackdrop from '@/components/layout/ThemeBackdrop';
import NavBar from '@/components/layout/NavBar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FlashForge — AI Master Study Engine',
  description: 'Privacy-first, AI-powered flashcards with deep space kinematics.',
};

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
