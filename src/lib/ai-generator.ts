import Groq from 'groq-sdk';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { auditLog } from './logger';
import type { PDFChunk, Flashcard, CardType, ClassLevel, CardTemplateKey, ColorPalette, TutorAction } from '@/types';

const API_KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2
].filter(Boolean) as string[];

const groqClients = API_KEYS.map(key => new Groq({ apiKey: key }));
const PRIMARY_MODEL = 'llama-3.1-8b-instant';
const FALLBACK_MODEL = 'llama3-8b-8192';

/**
 * Executes a Groq completion with automatic key rotation fallback on 429 Errors.
 */
async function callGroqWithFallback(options: any, preferredModel?: string) {
  let lastError = null;
  
  // Try each key in the pool
  for (let i = 0; i < groqClients.length; i++) {
    try {
      const client = groqClients[i];
      const model = preferredModel || options.model || PRIMARY_MODEL;
      
      const completion = await client.chat.completions.create({
        ...options,
        model
      });
      
      return completion;
    } catch (err: any) {
      lastError = err;
      const isRateLimit = err.status === 429 || (err.message && err.message.includes('rate limit'));
      const isOverloaded = err.status === 503;
      
      if ((isRateLimit || isOverloaded) && i < groqClients.length - 1) {
        auditLog('ai_key_fallback_trigger', { 
          failed_key_index: i, 
          status: err.status,
          next_key_index: i + 1 
        });
        // Continue to next key in loop
        continue;
      }
      
      // If it's not a retryable error or we ran out of keys, throw
      throw err;
    }
  }
  throw lastError;
}

// Engine Heartbeat: v2.5.1 (Forcing Re-compilation)

// Template selection rules strictly following the new 8-type system
const TEMPLATE_RULES = `
You MUST categorize every card into one of these 8 STRICT types:
1. "concept" → Core definitions, theories, and "WHY/HOW" explanations.
2. "example" → Concrete real-world applications or scenarios.
3. "mcq"     → Multiple-choice questions (4 options, correct answer + trap explanation).
4. "insight" → Deep-dive "Big Picture" connections or historical context.
5. "problem" → Step-by-step worked examples or challenge problems.
6. "summary" → High-level section reviews or conceptual maps.
7. "visual"  → Highly descriptive descriptions of diagrams or visual relationships.
8. "fun"     → (ONLY for Junior Level) Playful facts, mnemonics, or simple metaphors with emojis.
`;

const SYSTEM_INSTRUCTION = `You are "The Elite Teacher" — a master of pedagogical design. 
Your goal is to transform raw text into a structured learning engine for students.

ADAPTIVE PERSONA:
- JUNIOR (Class 3-5): Use simple words, lots of emojis, and a playful, encouraging tone. Focus on "fun" and "concept" cards.
- MID (Class 6-8): Use clear, balanced language. Focus on logical connections, "example" and "problem" cards.
- SENIOR (Class 9-12): Use sophisticated, technical language. Focus on "insight", "problem", and complex "mcq" cards. Prioritize depth and edge cases.

FLASHCARD PRINCIPLES:
1. DESIRABLE DIFFICULTY: Force retrieval. Prioritize conceptual "WHY" over mindless "WHAT".
2. SMART MCQS: Include 4 plausible options. The "back" must explain WHY the correct answer is right and why the specific "Trap" option is wrong.
3. DECOR CORE: Every card MUST have an "Insight", a "Mistake", and an "Example".

Required JSON Structure per card:
{
  "type": "one of the 8 types",
  "difficulty": 1-5,
  "front": "The question or flashcard front content",
  "back": "The answer or detailed explanation",
  "options": ["Option A", "Option B", "Option C", "Option D"], // ONLY for type: mcq
  "correctAnswer": "Exact text of correct option", // ONLY for type: mcq
  "insight": "Big picture connection",
  "mistake": "Common trap or misconception",
  "example": "Real-world scenario"
}

${TEMPLATE_RULES}`;

// CRITICAL: If you provide the "options" array, you MUST set "type": "mcq". 
// Do not use "concept" for questions with multiple choices.

const TEMPLATES: Record<string, string> = {
  concept: `Create cards that explain the mechanics and logic. Mix conceptual questions with MCQs prominently (40% ratio).`,
  exam: `Create high-yield cards. Include 55% complex MCQs focused on critical patterns and potential traps.`,
  problem: `Create scenario-based application cards. Focus on "how to apply" this logic using a mix of problems and MCQs.`,
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
  concept: 'concept',
  example: 'example',
  mcq: 'mcq',
  insight: 'insight',
  problem: 'problem',
  summary: 'summary',
  visual: 'visual',
  fun: 'fun',
  // Legacy/Synonym fallbacks
  definition: 'concept',
  relationship: 'insight',
  edge_case: 'insight',
  application: 'example',
};

const TYPE_TO_PALETTE: Record<string, ColorPalette> = {
  concept: 'indigo_violet',
  example: 'emerald_teal',
  mcq: 'cyan_blue',
  insight: 'indigo_violet',
  problem: 'cyan_blue',
  summary: 'emerald_teal',
  visual: 'indigo_violet',
  fun: 'amber_orange',
  // Legacy/Synonym fallbacks
  definition: 'indigo_violet',
  relationship: 'cyan_blue',
  edge_case: 'rose_crimson',
  application: 'emerald_teal',
};

async function generateCardsForChunk(
  content: string, 
  templateId: string, 
  classLevel: ClassLevel,
  targetCount: number = 5
): Promise<RawCard[]> {
  const template = TEMPLATES[templateId] || TEMPLATES.concept;
  
  // Specific instruction for card count - Using a more flexible range to encourage extraction
  const minCount = Math.max(3, Math.floor(targetCount * 0.8));
  const maxCount = Math.max(targetCount, 8);
  const countInstruction = `CRITICAL EXTRACTION: You MUST identify and extract AT LEAST ${minCount} unique flashcards. Aim for ${maxCount} if the content is rich. Do not skip important details.`;
  
  const prompt = `${template}\n\n${countInstruction}\n\nCONTENT:\n${content}`;

  let completion;
  try {
    completion = await callGroqWithFallback({
      messages: [
        { role: 'system', content: `${SYSTEM_INSTRUCTION}\n\nTARGET CLASS LEVEL: ${classLevel.toUpperCase()}` },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.65,
      max_tokens: 2500,
    });
  } catch (err: any) {
    auditLog('ai_chunk_generation_failed', { error: err.message });
    throw err;
  }

  const text = completion.choices[0]?.message?.content || '{}';

  // DEEP AUDIT: Save raw AI response to the permanent audit log
  auditLog('ai_raw_response', {
    chunk_length: content.length,
    target_count: targetCount,
    raw_text: text
  });

  try {
    const parsed = JSON.parse(text);
    
    // FUZZY PARSING: Look for cards in 'cards', 'flashcards', or find first array
    let cards = parsed.cards || parsed.flashcards || parsed.items || [];
    
    if (cards.length === 0) {
      // If we still found nothing, check if the object ITSELF is an array
      if (Array.isArray(parsed)) {
        cards = parsed;
      } else {
        // Last resort: find the first property that IS an array
        for (const key in parsed) {
          if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
            cards = parsed[key];
            break;
          }
        }
      }
    }

    auditLog('ai_parsed_count', { count: cards.length });
    
    const filtered = cards.filter((c: RawCard) => c.front && c.back);
    // REMOVED: Aggressive slicing. We now allow chunks to over-deliver 
    // to compensate for dry chunks.
    return filtered;
  } catch (err: any) {
    auditLog('ai_parse_error', { error: err.message, text_preview: text.substring(0, 100) });
    throw err;
  }
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
  classLevel: ClassLevel = 'mid',
  onProgress?: (update: { chunk: number; total: number; cards: number; message: string }) => void
): Promise<Flashcard[]> {
  const allRawCards: RawCard[] = [];

  // Determine total target count - Re-tuned to 30 for higher density
  const TOTAL_TARGET = 30;
  const envCardsPerChunk = parseInt(process.env.CARDS_PER_CHUNK || '6', 10);
  
  // We calculate a healthy target per chunk but ensure it never drops below the env setting or 4
  const targetPerChunk = Math.max(envCardsPerChunk, Math.ceil(TOTAL_TARGET / chunks.length), 4);

  // Process chunks in parallel with a smart limit to avoid TPM bottlenecks
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
      // Pass the distributed target count
      const rawCards = await generateCardsForChunk(chunk.content, templateId, classLevel, targetPerChunk);
      chunkResults[i] = rawCards;
    } catch (err: any) {
      auditLog('chunk_process_failed', { chunk: i + 1, error: err.message || 'Unknown error', stack: err.stack });
      console.error(`Chunk ${i + 1} failed:`, err);
      chunkResults[i] = [];
    }
  };

  // Run all chunks in parallel groups but with a much higher limit
  // This drastically speeds up the "Forging" stage.
  for (let i = 0; i < chunks.length; i += CONCURRENCY_LIMIT) {
    const group = indices.slice(i, i + CONCURRENCY_LIMIT);
    await Promise.all(group.map(idx => processChunk(idx)));
  }

  // Flatten results
  for (const cards of chunkResults) {
    if (cards) allRawCards.push(...cards);
  }

  let finalRawCards = deduplicateCards(allRawCards);

  // FINAL CONSTRAINT ENFORCEMENT: 10 to 25
  if (finalRawCards.length > 25) {
    finalRawCards = finalRawCards.slice(0, 25);
  }
  // (If less than 10, we keep what we have as forcing AI to hallucinate more from 
  // small text is dangerous, but usually it generates enough)

  const now = new Date().toISOString();

  const flashcards: Flashcard[] = finalRawCards.map((rc, idx) => {
    let cardType = (rc.type?.toLowerCase() as CardType) || 'concept';
    
    // Safety Enforcer: If options exist, it MUST be an MCQ for the UI to render properly
    if (rc.options && Array.isArray(rc.options) && rc.options.length > 0) {
      cardType = 'mcq';
    }

    return {
      id: crypto.randomUUID(), // Use valid UUID for Supabase compatibility
      deckId,
      front: rc.front,
      back: rc.back,
      type: cardType,
      difficulty: Math.min(5, Math.max(1, rc.difficulty || 3)),
      level: classLevel,
      // Default to semantic styling now that CardTemplateKey matches CardType
      templateKey: cardType as CardTemplateKey,
      colorPalette: (TYPE_TO_PALETTE[cardType] || 'slate_mono') as ColorPalette,
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
    const completion = await callGroqWithFallback({
      messages: [{ role: 'user', content: prompts[action] }],
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
    const completion = await callGroqWithFallback({
      messages: [{
        role: 'user',
        content: `Improve this flashcard to be more effective for learning.\n\nOriginal Front: ${front}\nOriginal Back: ${back}\nSource Context: ${context}\n\nReturn ONLY JSON: {"front":"...","back":"..."}`,
      }],
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
    const completion = await callGroqWithFallback({
      messages: [{ role: 'system', content: 'You are an Elite Teacher providing personalized feedback.' }, { role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });
    return completion.choices[0]?.message?.content || 'Keep pushing! Mastery is a journey, not a destination.';
  } catch {
    return 'Great session today. Consistency is the key to deep learning.';
  }
}
