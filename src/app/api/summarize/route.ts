import { NextResponse } from 'next/server';
import { generateSummary } from '@/lib/ai-generator';

export async function POST(req: Request) {
  try {
    const { stats, deckName } = await req.json();

    if (!stats || !deckName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const aiNote = await generateSummary(stats, deckName);

    return NextResponse.json({ aiNote });
  } catch (error) {
    console.error('Summarize API Error:', error);
    return NextResponse.json({ error: 'Failed to generate summary Note' }, { status: 500 });
  }
}
