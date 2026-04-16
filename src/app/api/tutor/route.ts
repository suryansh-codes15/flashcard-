import { NextResponse } from 'next/server';
import { aiTutor, TutorAction } from '@/lib/ai-generator';

export async function POST(req: Request) {
  try {
    const { action, front, back, context } = await req.json();

    if (!action || !front || !back) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await aiTutor(action as TutorAction, front, back, context || '');

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Tutor API Error:', error);
    return NextResponse.json({ error: 'Failed to generate tutor response' }, { status: 500 });
  }
}
