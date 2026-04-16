import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function formatRelative(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getDeckEmoji(fileName: string): string {
  const name = fileName.toLowerCase();
  if (name.includes('math') || name.includes('calculus')) return '📐';
  if (name.includes('biology') || name.includes('bio')) return '🧬';
  if (name.includes('chemistry') || name.includes('chem')) return '⚗️';
  if (name.includes('physics')) return '⚛️';
  if (name.includes('history')) return '📜';
  if (name.includes('economics') || name.includes('finance')) return '📈';
  if (name.includes('programming') || name.includes('code')) return '💻';
  if (name.includes('psychology') || name.includes('psych')) return '🧠';
  if (name.includes('philosophy')) return '🤔';
  if (name.includes('literature') || name.includes('english')) return '📚';
  if (name.includes('law')) return '⚖️';
  if (name.includes('medical') || name.includes('medicine')) return '🏥';
  return '📄';
}
