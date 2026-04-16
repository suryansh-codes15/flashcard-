export interface PDFChunk {
  id: string;
  content: string;
  sectionTitle?: string;
  pageRange?: string;
  tokenCount?: number;
}

export type CardType =
  | 'concept'
  | 'definition'
  | 'application'
  | 'example'
  | 'relationship'
  | 'edge_case';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// 12 premium visual templates the AI assigns per card
export type CardTemplateKey =
  | 'concept_glow'      // Indigo aurora — definitions, concepts
  | 'comparison_split'  // Two-panel glass — A vs B, relationships
  | 'timeline_steps'    // Numbered steps — processes, sequences
  | 'formula_dark'      // VSCode-dark mono — math, code, formulas
  | 'quote_hero'        // Giant serif text — key terms, vocabulary
  | 'scenario_story'    // Narrative card — case studies, examples
  | 'warning_edge'      // Red caution — edge cases, exceptions
  | 'checklist'         // Animated checks — applications, criteria
  | 'data_table'        // Grid cells — stats, comparisons
  | 'mind_map'          // Branching — interconnected ideas
  | 'exam_highlight'    // Yellow marker — high-yield exam facts
  | 'minimal_dark';     // Ultra-clean black — all-purpose fallback

export type ColorPalette =
  | 'indigo_violet'   // Deep focus — concept, definition
  | 'emerald_teal'    // Growth — application, example
  | 'rose_crimson'    // Warning — edge_case
  | 'amber_orange'    // Energy — example, scenario
  | 'cyan_blue'       // Technical — formula, data
  | 'slate_mono';     // Neutral — minimal, fallback

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  type: CardType;
  difficulty: number;       // 1-5 from AI assessment
  templateKey?: CardTemplateKey;
  colorPalette?: ColorPalette;
  tags?: string[];
  sourceContext?: string;
  createdAt: string;
  // SRS Fields
  interval: number;
  easeFactor: number;
  nextReviewDate: string;
  reviewCount: number;
  lapseCount: number;
  lastRating?: DifficultyLevel;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
  cardCount: number;
  masteredCount: number;
  tags?: string[];
  templateId: TemplateId;
  emoji?: string;
  dominantPalette?: ColorPalette;
}

export type TemplateId = 'concept' | 'exam' | 'problem';

export interface SRSRating {
  cardId: string;
  rating: DifficultyLevel;
  ratedAt: string;
}

export interface StudySession {
  deckId: string;
  startedAt: string;
  cardsStudied: number;
  cardsCorrect: number;
  cardsHard: number;
}

export interface GenerationProgress {
  type: 'start' | 'progress' | 'complete' | 'error';
  total?: number;
  chunk?: number;
  cards?: number;
  progress?: number;
  message?: string;
  flashcards?: Flashcard[];
  error?: string;
}
