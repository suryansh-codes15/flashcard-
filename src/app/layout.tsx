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

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FlashForge — Premium AI Flashcard Engine',
  description: 'Transform any PDF into deeply intelligent flashcards. Powered by AI with spaced repetition and a cinematic study experience.',
  keywords: ['flashcards', 'AI', 'study', 'spaced repetition', 'PDF', 'learning'],
  openGraph: {
    title: 'FlashForge — Premium AI Flashcard Engine',
    description: 'Transform PDFs into intelligent flashcards with AI.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${jakarta.variable} ${inter.variable} ${syne.variable} font-sans antialiased text-[var(--text-primary)] relative min-h-screen bg-transparent`}>
        <CinematicBackground />
        <ThemeProvider>
          <Navbar />
          <main className="relative z-10">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
