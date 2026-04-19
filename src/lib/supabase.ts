import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Library features will be disabled.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getGlobalStats() {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  try {
    // 1. Count Decks
    const { count: decksCount } = await supabase
      .from('decks')
      .select('*', { count: 'exact', head: true });

    // 2. Count Cards
    const { count: cardsCount } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true });

    // 3. Aggregate Total Reviews (Proxy: sum of review_count on all flashcards)
    // Note: client-side aggregation is limited, so we either need a RPC or 
    // we fetch a sample or just use the count of cards as a baseline.
    // For now, we'll fetch the sum of review_count if RLS allows.
    // Alternatively, we can use a fixed base for the "Cinematic" feel as discussed.
    
    return {
      totalDecks: decksCount || 0,
      totalCards: cardsCount || 0,
      // For reviews, we use a large base + real cards * avg review (e.g. 5) 
      // to keep the Landing Page feeling grand but reactive.
      estimatedReviews: (cardsCount || 0) * 8 + 2420000, 
      activeStreaks: 14 // Placeholder or average from profiles
    };
  } catch (err) {
    console.error('Failed to fetch global stats:', err);
    return null;
  }
}
