import { useState, useEffect } from 'react';
import { useFlashcardStore } from '@/store/flashcard-store';

export function useStudyStats() {
  const [stats, setStats] = useState({
    streak: 0,
    longestStreak: 0,
    totalXP: 0,
    level: 1,
    totalCards: 0,
    accuracy: 0,
    dueNow: 0,
    cardsReviewed: 0,
    weeklyData: [0, 0, 0, 0, 0, 0, 0], // Mon-Sun
    mastered: 0,
    learning: 0,
    newShaky: 0,
  });

  const store = useFlashcardStore();

  useEffect(() => {
    const { flashcards, sessions, xp } = store;

    // Streaks
    const sessionDays = new Set(
      sessions.map((s) => {
        const d = new Date(s.startedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );
    
    // Compute current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    let checkDay = new Date(today);
    if (!sessionDays.has(checkDay.getTime())) {
      checkDay.setDate(checkDay.getDate() - 1);
    }
    while (sessionDays.has(checkDay.getTime())) {
      currentStreak++;
      checkDay.setDate(checkDay.getDate() - 1);
    }

    // Compute longest streak
    const sortedDays = Array.from(sessionDays).sort((a, b) => a - b);
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDay = 0;
    for (const day of sortedDays) {
      if (prevDay === 0) {
        tempStreak = 1;
      } else {
        const diffDays = (day - prevDay) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      prevDay = day;
    }

    // Level
    const level = Math.floor(xp / 200) + 1;

    // Accuracy
    let totalCorrect = 0;
    let totalStudied = 0;
    sessions.forEach(s => {
      totalCorrect += s.cardsCorrect;
      totalStudied += s.cardsStudied;
    });
    const accuracy = totalStudied > 0 ? Math.round((totalCorrect / totalStudied) * 100) : 0;

    // Cards Breakdown
    const mastered = flashcards.filter(c => c.interval >= 21).length;
    const learning = flashcards.filter(c => c.interval > 1 && c.interval < 21).length;
    const newShaky = flashcards.filter(c => c.interval <= 1 || !c.interval).length;

    // Due Now
    const now = new Date();
    const dueNow = flashcards.filter(c => new Date(c.nextReviewDate) <= now).length;

    // Weekly Data (Mon-Sun)
    const weeklyData = [0, 0, 0, 0, 0, 0, 0];
    const msInDay = 1000 * 60 * 60 * 24;
    // Get start of this week (Monday)
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday
    const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const pastMonday = new Date(today);
    pastMonday.setDate(today.getDate() - daysSinceMonday);
    
    sessions.forEach(s => {
      const d = new Date(s.startedAt);
      d.setHours(0, 0, 0, 0);
      const diff = Math.floor((d.getTime() - pastMonday.getTime()) / msInDay);
      if (diff >= 0 && diff < 7) {
        weeklyData[diff] += s.cardsStudied;
      }
    });

    setStats({
      streak: currentStreak,
      longestStreak: longestStreak,
      totalXP: xp,
      level,
      totalCards: flashcards.length,
      accuracy,
      dueNow,
      cardsReviewed: totalStudied,
      weeklyData,
      mastered,
      learning,
      newShaky,
    });
  }, [store.flashcards, store.sessions, store.xp]);

  return stats;
}
