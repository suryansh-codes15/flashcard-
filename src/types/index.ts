export interface PDFChunk {
  id: string;
  content: string;
  sectionTitle?: string;
  pageRange?: string;
  tokenCount?: number;
}

export type CardType =
  | 'concept'
  | 'example'
  | 'mcq'
  | 'insight'
  | 'problem'
  | 'summary'
  | 'visual'
  | 'fun';

export type ClassLevel = 'junior' | 'mid' | 'senior';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'again';

// Premium visual templates are now driven by the semantic 'type' field
export type CardTemplateKey =
  | 'concept'
  | 'example'
  | 'mcq'
  | 'insight'
  | 'problem'
  | 'summary'
  | 'visual'
  | 'fun';

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
  level: ClassLevel;        // Injected for contextual styling
  templateKey?: CardTemplateKey;
  colorPalette?: ColorPalette;
  tags?: string[];
  sourceContext?: string;
  insight?: string;    // Deep-dive insight from AI (Front)
  concept?: string;    // Conceptual breakdown (Back)
  mistake?: string;    // Common mistake/gotcha
  example?: string;    // Real-world application example
  // MCQ specific
  options?: string[];
  correctAnswer?: string;
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
  classLevel: ClassLevel; // The core context for the entire deck
  createdAt: string;
  updatedAt: string;
  cardCount: number;
  masteredCount: number;
  tags?: string[];
  templateId: TemplateId;
  emoji?: string;
  masteryPercentage?: number;
  dominantPalette?: ColorPalette;
}

export type TemplateId = 'concept' | 'exam' | 'problem';

export interface SRSRating {
  cardId: string;
  rating: DifficultyLevel;
  ratedAt: string;
}

export interface StudySession {
  id: string;
  deckId: string;
  deckName: string;
  startedAt: string;
  finishedAt: string;
  cardsStudied: number;
  cardsCorrect: number; 
  accuracy: number;
  stats: {
    easy: number;
    medium: number;
    hard: number;
    again: number;
  };
  weakTopics: string[];
  strongTopics: string[];
  improvement: number; 
  aiNote?: string;
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

export type TutorAction = 'simpler' | 'example' | 'importance' | 'harder' | 'misunderstanding';

export type MascotSubject = 'math' | 'science' | 'geography' | 'history' | 'language';

export type MascotState = 'idle' | 'reading' | 'dancing' | 'jumping' | 'sad';
