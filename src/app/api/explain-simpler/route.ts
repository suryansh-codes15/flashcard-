import { NextRequest, NextResponse } from 'next/server';
import { explainSimpler } from '@/lib/ai-generator';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const { content } = await request.json();
        if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        if (!process.env.GROQ_API_KEY) return NextResponse.json({ error: 'AI not configured' }, { status: 503 });

        const explanation = await explainSimpler(content);
        return NextResponse.json({ explanation });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to simplify' }, { status: 500 });
    }
}
