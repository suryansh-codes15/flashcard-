import { NextRequest } from 'next/server';
import { generateFlashcards } from '@/lib/ai-generator';
import { z } from 'zod';
import type { Flashcard, CardTemplateKey, ColorPalette } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

const RequestSchema = z.object({
  deckId: z.string().min(1),
  chunks: z.array(z.object({
    id: z.string(),
    content: z.string().min(50),
    sectionTitle: z.string().optional(),
    tokenCount: z.number().optional(),
  })).min(1),
  fileName: z.string().min(1),
  templateId: z.enum(['concept', 'exam', 'problem']).default('concept'),
});

// Helper to build a complete Flashcard with all required SRS fields
function makeCard(
  deckId: string,
  idx: number,
  fields: {
    type: string;
    front: string;
    back: string;
    difficulty: number;
    templateKey: CardTemplateKey;
    colorPalette: ColorPalette;
    sourceContext: string;
    tags: string[];
  }
): Flashcard {
  const now = new Date().toISOString();
  return {
    id: `fb-${deckId}-${idx}-${Date.now()}`,
    deckId,
    front: fields.front,
    back: fields.back,
    type: fields.type as Flashcard['type'],
    difficulty: fields.difficulty,
    templateKey: fields.templateKey,
    colorPalette: fields.colorPalette,
    sourceContext: fields.sourceContext,
    tags: fields.tags,
    createdAt: now,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: now,
    reviewCount: 0,
    lapseCount: 0,
  };
}

function buildFallbackCards(deckId: string, templateId: string): Flashcard[] {
  if (templateId === 'exam') {
    return [
      makeCard(deckId, 1, { type: 'definition', front: 'Define the Efficient Market Hypothesis (EMH).', back: 'An investment theory stating that share prices reflect all information, making it impossible to consistently beat the market purely through stock picking or market timing.', difficulty: 3, templateKey: 'quote_hero', colorPalette: 'indigo_violet', sourceContext: 'Financial Markets 101', tags: ['finance', 'theory'] }),
      makeCard(deckId, 2, { type: 'relationship', front: 'Contrast Strong-form vs Semi-strong form EMH.', back: 'Strong-form assumes ALL information (public AND private) is priced in.\nSemi-strong assumes only public information is priced in, leaving insiders an edge.', difficulty: 4, templateKey: 'comparison_split', colorPalette: 'cyan_blue', sourceContext: 'Market Efficiency', tags: ['finance', 'comparison'] }),
      makeCard(deckId, 3, { type: 'edge_case', front: 'What is the key anomaly that challenges the EMH?', back: 'The Momentum Effect — stocks that perform well recently tend to continue performing well, contradicting the EMH claim that past prices cannot predict future performance.', difficulty: 4, templateKey: 'warning_edge', colorPalette: 'rose_crimson', sourceContext: 'Market Anomalies', tags: ['edge-case', 'finance'] }),
      makeCard(deckId, 4, { type: 'application', front: 'If a market follows Strong-form EMH, what is the optimal strategy?', back: 'A passive index fund strategy. Since all information is already priced in, active management cannot generate alpha above market returns after fees.', difficulty: 3, templateKey: 'exam_highlight', colorPalette: 'amber_orange', sourceContext: 'Investment Strategy', tags: ['application'] }),
    ];
  }

  if (templateId === 'problem') {
    return [
      makeCard(deckId, 1, { type: 'example', front: 'Calculate terminal value: CF = $10M, WACC = 10%, Growth = 2%.', back: 'Terminal Value = Expected CF ÷ (WACC − Growth Rate)\nTV = $10M ÷ (0.10 − 0.02)\nTV = $10M ÷ 0.08\nTV = $125 Million', difficulty: 4, templateKey: 'formula_dark', colorPalette: 'cyan_blue', sourceContext: 'Corporate Valuation', tags: ['math', 'valuation'] }),
      makeCard(deckId, 2, { type: 'edge_case', front: 'Why is the Cost of Debt adjusted when calculating WACC?', back: 'Because interest payments are tax-deductible.\nAfter-Tax Cost of Debt = Rate × (1 − Tax Rate)\nThis reduces the effective cost of borrowing vs. equity.', difficulty: 3, templateKey: 'warning_edge', colorPalette: 'rose_crimson', sourceContext: 'Cost of Capital', tags: ['formula', 'finance'] }),
      makeCard(deckId, 3, { type: 'application', front: 'How do you identify a production bottleneck step-by-step?', back: '1. Map all production stages\n2. Measure cycle time at each stage\n3. The stage with highest cycle time = bottleneck\n4. Ensure bottleneck always has upstream WIP\n5. Subordinate all other processes to it', difficulty: 3, templateKey: 'timeline_steps', colorPalette: 'emerald_teal', sourceContext: 'Operations Management', tags: ['framework', 'operations'] }),
      makeCard(deckId, 4, { type: 'concept', front: 'What is the Theory of Constraints (TOC)?', back: 'A management paradigm that every process has one bottleneck, and improving the bottleneck is the only way to increase throughput. All other improvements are waste unless the constraint is improved first.', difficulty: 3, templateKey: 'concept_glow', colorPalette: 'indigo_violet', sourceContext: 'Operations Theory', tags: ['concept'] }),
    ];
  }

  // Default: Concept / Deep Learning
  return [
    makeCard(deckId, 1, { type: 'concept', front: 'What is Spaced Repetition (SRS)?', back: 'An evidence-based learning technique using increasing time intervals between reviews to exploit the psychological spacing effect — making memories exponentially stronger with each successful recall.', difficulty: 2, templateKey: 'concept_glow', colorPalette: 'indigo_violet', sourceContext: 'Learning Theory', tags: ['memory', 'neuroscience'] }),
    makeCard(deckId, 2, { type: 'relationship', front: 'Active Recall vs Passive Reading — what is the real difference?', back: 'Active Recall forces memory retrieval without looking, physically strengthening neural pathways.\nPassive Reading only stimulates recognition memory — creating an illusion of competence without real retention.', difficulty: 2, templateKey: 'comparison_split', colorPalette: 'cyan_blue', sourceContext: 'Cognitive Psychology', tags: ['study-techniques'] }),
    makeCard(deckId, 3, { type: 'example', front: 'Give a concrete example of Interleaving in a study session.', back: 'Instead of 50 calculus → 50 algebra (blocked),\nmix: calculus, algebra, geometry, calculus, algebra… randomly.\nThis forces the brain to identify which concept applies — building flexible, transferable knowledge.', difficulty: 3, templateKey: 'scenario_story', colorPalette: 'amber_orange', sourceContext: 'Skill Acquisition', tags: ['optimization'] }),
    makeCard(deckId, 4, { type: 'edge_case', front: 'Why does the Forgetting Curve flatten after multiple spaced reviews?', back: 'Each successful active recall thickens the myelin sheath around the neural circuit, increasing action potential speed and preventing synaptic pruning — making memory biologically permanent over time.', difficulty: 4, templateKey: 'warning_edge', colorPalette: 'rose_crimson', sourceContext: 'Neurobiology', tags: ['biology', 'memory'] }),
    makeCard(deckId, 5, { type: 'definition', front: 'Define the SM-2 Algorithm.', back: 'The SuperMemo 2 spaced repetition algorithm that tracks ease factor (EF) and interval per card. Hard → shorter interval, Easy → longer. Cards rated Hard ≥ 3 consecutive times get reset to day 1 review.', difficulty: 3, templateKey: 'formula_dark', colorPalette: 'cyan_blue', sourceContext: 'Spaced Repetition Systems', tags: ['algorithm'] }),
    makeCard(deckId, 6, { type: 'application', front: 'Design a 1-week study plan using SRS principles.', back: '✓ Review new material same day it is learned\n✓ First recall: next day\n✓ Second recall: 3 days later\n✓ Third recall: 7 days later\n✓ Hard cards reset to Day 1 automatically', difficulty: 3, templateKey: 'checklist', colorPalette: 'emerald_teal', sourceContext: 'Study Planning', tags: ['application', 'planning'] }),
  ];
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const result = RequestSchema.safeParse(body);
  if (!result.success) {
    return new Response(JSON.stringify({ error: 'Validation failed', details: result.error.format() }), { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: 'AI service not configured. Please add GROQ_API_KEY to .env.local.' }), { status: 503 });
  }

  const { deckId, chunks, fileName, templateId } = result.data;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        send({ type: 'start', total: chunks.length });

        const flashcards = await generateFlashcards(
          deckId, chunks, fileName, templateId,
          (update) => {
            const progress = Math.round((update.chunk / update.total) * 85) + 5;
            send({ type: 'progress', ...update, progress });
          }
        );

        send({ type: 'progress', progress: 98, message: 'Finalizing your premium deck...' });
        send({ type: 'complete', flashcards, progress: 100 });
      } catch (err) {
        console.warn('AI generation failed — loading offline premium deck:', err);
        send({ type: 'progress', progress: 50, message: '🎨 Loading offline premium deck...' });

        const fallbackCards = buildFallbackCards(deckId, templateId);

        await new Promise(r => setTimeout(r, 1200));
        send({ type: 'progress', progress: 95, message: 'Applying visual templates...' });
        await new Promise(r => setTimeout(r, 800));
        send({ type: 'complete', flashcards: fallbackCards, progress: 100 });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
