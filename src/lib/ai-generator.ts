import Groq from 'groq-sdk';
import type { PDFChunk, Flashcard, CardType, CardTemplateKey, ColorPalette } from '@/types';

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

const SYSTEM_INSTRUCTION = `You are an expert educator, cognitive learning specialist, and UI/UX designer. You create premium flashcards that develop genuine understanding AND assign the perfect visual template to each card.

Rules:
- Cards are clear, pedagogically precise, and free of redundancy
- Each card gets the MOST fitting templateKey and colorPalette based on its content
- Return ONLY valid JSON. No text outside the JSON object.

${TEMPLATE_RULES}`;

const TEMPLATES: Record<string, string> = {
  concept: `Create 4 to 6 deeply educational flashcards from the content below.
Mix these card types: concept, definition, relationship, edge_case.

Return ONLY this JSON, with templateKey and colorPalette per card:
{"cards":[{"front":"...","back":"...","type":"concept|definition|relationship|edge_case","difficulty":1-5,"templateKey":"...","colorPalette":"...","sourceContext":"exact quote from text"}]}`,

  exam: `Create 5 to 7 high-yield exam-prep flashcards from the content below.
Mix these card types: definition, application, example.

Return ONLY this JSON, with templateKey and colorPalette per card:
{"cards":[{"front":"...","back":"...","type":"definition|application|example","difficulty":1-5,"templateKey":"...","colorPalette":"...","sourceContext":"exact quote from text"}]}`,

  problem: `Create 3 to 5 problem-solving flashcards from the content below.
Structure: problem/scenario on front → step-by-step solution on back.
Mix these card types: application, example.

Return ONLY this JSON, with templateKey and colorPalette per card:
{"cards":[{"front":"...","back":"...","type":"application|example","difficulty":1-5,"templateKey":"...","colorPalette":"...","sourceContext":"exact quote from text"}]}`,
};

interface RawCard {
  front: string;
  back: string;
  type?: CardType;
  difficulty?: number;
  templateKey?: CardTemplateKey;
  colorPalette?: ColorPalette;
  sourceContext?: string;
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

  for (let i = 0; i < chunks.length; i++) {
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
      allRawCards.push(...rawCards);
    } catch (err) {
      console.error(`Chunk ${i + 1} failed:`, err);
    }
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

export async function explainSimpler(content: string): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{
        role: 'user',
        content: `Explain this to me as if I'm a bright 16-year-old. Use simple language, relatable analogies, and avoid jargon. Keep the full meaning but make it easy.\n\n"${content}"\n\nRespond with ONLY the simplified explanation text.`,
      }],
      model: GROQ_MODEL,
      max_tokens: 512,
    });
    return completion.choices[0]?.message?.content?.trim() || content;
  } catch {
    return content;
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
