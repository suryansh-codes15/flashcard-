import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect API routes
  if (pathname.startsWith('/api/')) {
    // Basic security checks can go here
    // For example, ensuring only POST for certain routes
    if (pathname.startsWith('/api/generate-flashcards') && request.method !== 'POST') {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
  }

  const response = NextResponse.next();

  // Add more security headers if needed (redundant with next.config.js but good for edge)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
