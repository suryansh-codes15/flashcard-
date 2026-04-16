import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Flashcard, Deck, StudySession, DifficultyLevel } from '@/types';
import { generateId } from '@/lib/utils';

// SM-2 adjusted algorithm
function calculateNextReview(card: Flashcard, rating: DifficultyLevel): Partial<Flashcard> {
    const qualityMap: Record<DifficultyLevel, number> = { easy: 5, medium: 3, hard: 1 };
    const quality = qualityMap[rating];

    let { easeFactor, interval, lapseCount, reviewCount } = card;

    // Update ease factor (SM-2 formula)
    const newEase = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    let newInterval: number;
    let newLapse = lapseCount;

    if (quality < 3) {
        // Hard: reset interval, track lapse
        newInterval = 1;
        newLapse = lapseCount + 1;
    } else if (reviewCount === 0) {
        newInterval = 1;
    } else if (reviewCount === 1) {
        newInterval = 6;
    } else {
        newInterval = Math.round(interval * newEase);
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);

    return {
        easeFactor: newEase,
        interval: newInterval,
        nextReviewDate: nextDate.toISOString(),
        lapseCount: newLapse,
        reviewCount: reviewCount + 1,
        lastRating: rating,
    };
}

interface FlashcardStore {
    decks: Deck[];
    flashcards: Flashcard[];
    sessions: StudySession[];

    // Deck operations
    addDeck: (deck: Deck) => void;
    deleteDeck: (deckId: string) => void;
    getDeck: (deckId: string) => Deck | undefined;

    // Card operations
    addCards: (cards: Flashcard[]) => void;
    updateCard: (cardId: string, updates: Partial<Flashcard>) => void;
    deleteCard: (cardId: string) => void;
    getDeckCards: (deckId: string) => Flashcard[];
    getCardsForReview: (deckId: string) => Flashcard[];

    // SRS
    rateCard: (cardId: string, rating: DifficultyLevel) => void;

    // Study sessions
    addSession: (session: StudySession) => void;
    getStats: () => { totalCards: number; totalDecks: number; masteredCards: number; streak: number };
}

export const useFlashcardStore = create<FlashcardStore>()(
    persist(
        (set, get) => ({
            decks: [],
            flashcards: [],
            sessions: [],

            addDeck: (deck) => set((state) => ({ decks: [...state.decks, deck] })),

            deleteDeck: (deckId) => set((state) => ({
                decks: state.decks.filter((d) => d.id !== deckId),
                flashcards: state.flashcards.filter((c) => c.deckId !== deckId),
            })),

            getDeck: (deckId) => get().decks.find((d) => d.id === deckId),

            addCards: (cards) => set((state) => {
                const newCards = [...state.flashcards, ...cards];
                const newDecks = state.decks.map((deck) => {
                    const count = newCards.filter((c) => c.deckId === deck.id).length;
                    return { ...deck, cardCount: count };
                });
                return { flashcards: newCards, decks: newDecks };
            }),

            updateCard: (cardId, updates) => set((state) => ({
                flashcards: state.flashcards.map((c) => c.id === cardId ? { ...c, ...updates } : c),
            })),

            deleteCard: (cardId) => set((state) => ({
                flashcards: state.flashcards.filter((c) => c.id !== cardId),
            })),

            getDeckCards: (deckId) => get().flashcards.filter((c) => c.deckId === deckId),

            getCardsForReview: (deckId) => {
                const now = new Date();
                const cards = get().flashcards.filter((c) => c.deckId === deckId);
                return cards.sort((a, b) => {
                    const aDue = new Date(a.nextReviewDate) <= now ? -1 : 1;
                    const bDue = new Date(b.nextReviewDate) <= now ? -1 : 1;
                    if (aDue !== bDue) return aDue - bDue;
                    return a.easeFactor - b.easeFactor; // hardest cards first
                });
            },

            rateCard: (cardId, rating) => {
                const card = get().flashcards.find((c) => c.id === cardId);
                if (!card) return;
                const updates = calculateNextReview(card, rating);
                get().updateCard(cardId, updates);

                // Update deck mastered count
                const masteredCards = get().flashcards.filter(
                    (c) => c.deckId === card.deckId && c.interval >= 21
                ).length;
                set((state) => ({
                    decks: state.decks.map((d) =>
                        d.id === card.deckId ? { ...d, masteredCount: masteredCards } : d
                    ),
                }));
            },

            addSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),

            getStats: () => {
                const { flashcards, decks, sessions } = get();
                const masteredCards = flashcards.filter((c) => c.interval >= 21).length;

                // Calculate streak
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const sessionDays = new Set(
                    sessions.map((s) => {
                        const d = new Date(s.startedAt);
                        d.setHours(0, 0, 0, 0);
                        return d.getTime();
                    })
                );
                let streak = 0;
                let checkDay = new Date(today);
                while (sessionDays.has(checkDay.getTime())) {
                    streak++;
                    checkDay.setDate(checkDay.getDate() - 1);
                }

                return {
                    totalCards: flashcards.length,
                    totalDecks: decks.length,
                    masteredCards,
                    streak,
                };
            },
        }),
        {
            name: 'flashforge-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
