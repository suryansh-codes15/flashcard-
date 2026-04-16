import Groq from 'groq-sdk';
import type { PDFChunk, Flashcard, CardType, CardTemplateKey, ColorPalette, TutorAction } from '@/types';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Template selection rules injected into every prompt
const TEMPLATE_RULES = `
TEMPLATE SELECTION RULES (choose templateKey from this list only):
- "concept_glow"     → definitions, concepts, WHY/HOW explanations
- "comparison_split" → A vs B, differences, relationships between two things
- "timeline_steps"   → numbered sequences, processes, ordered steps
- "formula_dark"     → math formulas, code snippets, algorithms, equations
- "quote_hero"       → single key terms, vocabulary words, one-liner facts
- "scenario_story"   → case studies, real-world examples, narrative scenarios
- "warning_edge"     → exceptions, edge cases, common mistakes, gotchas
- "checklist"        → lists of criteria, requirements, best practices
- "data_table"       → statistics, data comparisons, structured data
- "mind_map"         → concepts with multiple sub-connections
- "exam_highlight"   → single highest-yield exam facts, must-know answers
- "minimal_dark"     → general fallback for anything else

COLOR PALETTE RULES (choose colorPalette from this list only):
- "indigo_violet"  → concept, definition, theory
- "emerald_teal"   → application, growth, process
- "rose_crimson"   → edge_case, warning, danger
- "amber_orange"   → example, scenario, energy
- "cyan_blue"      → formula, code, data, technical
- "slate_mono"     → minimal, fallback, neutral
`;

const SYSTEM_INSTRUCTION = `You are "The Elite Teacher" — a master of learning science and cognitive psychology. 
Your goal is to transform raw text into a deep learning system that challenges and inspires.

Flashcard Principles:
1. DESIRABLE DIFFICULTY: Never ask obvious questions. Force the brain to work. Prioritize conceptual "WHY" and "HOW" over "WHAT".
2. SMART MCQS: For complex topics, generate MCQs. Include 4 plausible options and a clear correct answer.
3. DECOR CORE: Every card MUST have an "Insight" (big picture), a "Mistake" (common pitfall), and an "Example" (real-world application).
4. MCQ EXPLANATION: For MCQs, the "back" must explain WHY the correct answer is right AND why the most common "Trap" option is wrong.

Required JSON Structure per card:
{
  "type": "concept | mcq",
  "difficulty": 1-5,
  "front": "A challenging question",
  "back": "Detailed answer (Flashcard) OR Explanation of correct/wrong options (MCQ)",
  "options": ["Option A", "Option B", "Option C", "Option D"], // Only for type: mcq
  "correctAnswer": "The exact text of the correct option", // Only for type: mcq
  "templateKey": "must choose from list",
  "colorPalette": "must choose from list",
  "insight": "Big picture connection",
  "mistake": "Common trap or misconception",
  "example": "Real-world scenario"
}

${TEMPLATE_RULES}`;

const TEMPLATES: Record<string, string> = {
  concept: `Create 4 to 6 deep learning cards. Mix classic conceptual questions with 1-2 MCQ type cards (25% ratio). 
Focus on the core mechanics and "how it works".`,
  
  exam: `Create 6 to 8 high-yield cards. Include 2-3 complex MCQs (30% ratio). 
Focus on critical exam points and common traps.`,

  problem: `Create 3 to 5 scenario-based cards. At least one should be an MCQ where the user chooses the best solution.
The 'example' should be another variant of this problem type.`,
};

interface RawCard {
  front: string;
  back: string;
  type?: CardType;
  difficulty?: number;
  templateKey?: CardTemplateKey;
  colorPalette?: ColorPalette;
  sourceContext?: string;
  insight?: string;
  mistake?: string;
  example?: string;
  options?: string[];
  correctAnswer?: string;
}

// Fallback template mapping if AI doesn't return one
const TYPE_TO_TEMPLATE: Record<string, CardTemplateKey> = {
  concept: 'concept_glow',
  definition: 'quote_hero',
  relationship: 'comparison_split',
  edge_case: 'warning_edge',
  application: 'checklist',
  example: 'scenario_story',
};

const TYPE_TO_PALETTE: Record<string, ColorPalette> = {
  concept: 'indigo_violet',
  definition: 'indigo_violet',
  relationship: 'cyan_blue',
  edge_case: 'rose_crimson',
  application: 'emerald_teal',
  example: 'amber_orange',
};

async function generateCardsForChunk(content: string, templateId: string): Promise<RawCard[]> {
  const template = TEMPLATES[templateId] || TEMPLATES.concept;
  const prompt = `${template}\n\nCONTENT:\n${content}`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: prompt },
    ],
    model: GROQ_MODEL,
    response_format: { type: 'json_object' },
    temperature: 0.65,
    max_tokens: 2500,
  });

  const text = completion.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(text);
  const cards = parsed.cards || (Array.isArray(parsed) ? parsed : []);
  return cards.filter((c: RawCard) => c.front && c.back);
}

function deduplicateCards(cards: RawCard[]): RawCard[] {
  const seen = new Set<string>();
  return cards.filter((card) => {
    const key = card.front.toLowerCase().trim().substring(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function generateFlashcards(
  deckId: string,
  chunks: PDFChunk[],
  fileName: string,
  templateId: 'concept' | 'exam' | 'problem' = 'concept',
  onProgress?: (update: { chunk: number; total: number; cards: number; message: string }) => void
): Promise<Flashcard[]> {
  const allRawCards: RawCard[] = [];

  // Process chunks in parallel with a smart concurrency limit
  const CONCURRENCY_LIMIT = 3;
  const chunkResults: RawCard[][] = new Array(chunks.length);
  
  // Create an array of indices to process
  const indices = Array.from({ length: chunks.length }, (_, i) => i);
  
  // Helper to process a chunk and update progress
  const processChunk = async (i: number) => {
    const chunk = chunks[i];
    if (onProgress) {
      onProgress({
        chunk: i + 1,
        total: chunks.length,
        cards: allRawCards.length,
        message: `Processing: ${chunk.sectionTitle || `Section ${i + 1}`}`,
      });
    }

    try {
      const rawCards = await generateCardsForChunk(chunk.content, templateId);
      chunkResults[i] = rawCards;
    } catch (err) {
      console.error(`Chunk ${i + 1} failed:`, err);
      chunkResults[i] = [];
    }
  };

  // Run in groups to respect concurrency limit
  for (let i = 0; i < chunks.length; i += CONCURRENCY_LIMIT) {
    const group = indices.slice(i, i + CONCURRENCY_LIMIT);
    await Promise.all(group.map(idx => processChunk(idx)));
  }

  // Flatten results
  for (const cards of chunkResults) {
    if (cards) allRawCards.push(...cards);
  }

  const deduplicated = deduplicateCards(allRawCards);
  const now = new Date().toISOString();

  const flashcards: Flashcard[] = deduplicated.map((rc, idx) => {
    const cardType = rc.type || 'concept';
    return {
      id: `card-${deckId}-${idx}-${Date.now() + idx}`,
      deckId,
      front: rc.front,
      back: rc.back,
      type: cardType,
      difficulty: Math.min(5, Math.max(1, rc.difficulty || 3)),
      // AI-assigned template, with smart fallback if AI didn't return one
      templateKey: rc.templateKey || TYPE_TO_TEMPLATE[cardType] || 'concept_glow',
      colorPalette: rc.colorPalette || TYPE_TO_PALETTE[cardType] || 'indigo_violet',
      sourceContext: rc.sourceContext || '',
      insight: rc.insight || '',
      mistake: rc.mistake || '',
      example: rc.example || '',
      options: rc.options,
      correctAnswer: rc.correctAnswer,
      tags: [],
      createdAt: now,
      interval: 1,
      easeFactor: 2.5,
      nextReviewDate: now,
      reviewCount: 0,
      lapseCount: 0,
    };
  });

  return flashcards;
}


export async function aiTutor(
  action: TutorAction,
  front: string,
  back: string,
  context: string
): Promise<string> {
  const prompts: Record<TutorAction, string> = {
    simpler: `Explain this concept to me as if I'm a bright 16-year-old. Use a simple analogy. Avoid jargon.
Concept: ${front}
Explanation: ${back}`,
    example: `Give me a totally different, concrete real-world example of this concept. 
Concept: ${front}
Original Answer: ${back}
Context: ${context}`,
    importance: `Why is this concept actually important to know? How does it connect to the real world or other ideas?
Concept: ${front}
Answer: ${back}`,
    harder: `I understand this concept well. Generate a much more challenging, multi-step conceptual question that tests the limits of my knowledge on this specific topic.
Concept: ${front}
Context: ${context}`,
    misunderstanding: `I rated this card as 'Again' (Hard). Analyze the relationship between the question and the correct answer. Explain WHY a student might have misunderstood this or what fundamental conceptual trap they likely fell into.
Question: ${front}
Correct Answer: ${back}
Context: ${context}`
  };

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompts[action] }],
      model: GROQ_MODEL,
      max_tokens: 600,
      temperature: 0.7,
    });
    return completion.choices[0]?.message?.content?.trim() || 'I encountered an error while trying to explain this.';
  } catch (err) {
    console.error('Tutor failed:', err);
    return 'The AI tutor is currently unavailable. Please try again later.';
  }
}

export async function regenerateCard(
  front: string,
  back: string,
  context: string
): Promise<{ front: string; back: string }> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{
        role: 'user',
        content: `Improve this flashcard to be more effective for learning.\n\nOriginal Front: ${front}\nOriginal Back: ${back}\nSource Context: ${context}\n\nReturn ONLY JSON: {"front":"...","back":"..."}`,
      }],
      model: GROQ_MODEL,
      response_format: { type: 'json_object' },
      max_tokens: 512,
    });
    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return { front: parsed.front || front, back: parsed.back || back };
  } catch {
    return { front, back };
  }
}

export async function generateSummary(
  stats: { easy: number; medium: number; hard: number; correctMCQ: number },
  deckName: string
): Promise<string> {
  const prompt = `Act as an Elite Teacher. Analyze the following session results for the deck "${deckName}" and provide a short, motivating, and highly insightful "Teacher's Note" (max 3 sentences).
  
  Results:
  - Easy (Mastered): ${stats.easy}
  - Medium (Familiar): ${stats.medium}
  - Hard (Struggled): ${stats.hard}
  - MCQ Accuracy: ${stats.correctMCQ} correct
  
  Give specific pedagogical advice based on these numbers. If they struggled, focus on concept-building. If they succeeded, focus on application.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: 'You are an Elite Teacher providing personalized feedback.' }, { role: 'user', content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 300,
    });
    return completion.choices[0]?.message?.content || 'Keep pushing! Mastery is a journey, not a destination.';
  } catch {
    return 'Great session today. Consistency is the key to deep learning.';
  }
}
