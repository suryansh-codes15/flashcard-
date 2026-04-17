import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { stats, accuracy, weakTopics, strongTopics, deckName } = await req.json();

    // Custom feedback generation logic simulator (Teacher Persona)
    // In a production environment, this would call Groq or Gemini
    let feedback = "";
    
    if (accuracy >= 90) {
      feedback = `Exceptional work on "${deckName}"! Your accuracy of ${accuracy}% suggests profound mastery. You've clearly grasped ${strongTopics.slice(0, 2).join(' and ') || 'the key concepts'} with surgical precision. Keep this momentum; you're ready for more advanced challenges!`;
    } else if (accuracy >= 75) {
      feedback = `Great session! You're really getting the hang of ${strongTopics[0] || 'the material'}. Your accuracy (${accuracy}%) is solid. Focus a bit more on ${weakTopics[0] || 'the trickier concepts'} in our next session to bridge the remaining gap to perfection!`;
    } else if (accuracy >= 50) {
      feedback = `Solid effort! You've got the basics down, but ${deckName} has some layers that need more attention, particularly ${weakTopics.slice(0, 2).join(' and ')}. I suggest reviewing the source material for those specific areas before your next practice.`;
    } else {
      feedback = `Valuable progress today. Learning ${deckName} is a journey, and today was a foundation-building step. Let's focus our next session on the fundamentals of ${weakTopics[0] || 'these concepts'}. Consistency is your greatest ally right now!`;
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Session feedback API error:', error);
    return NextResponse.json({ error: 'Failed to generate session feedback' }, { status: 500 });
  }
}
