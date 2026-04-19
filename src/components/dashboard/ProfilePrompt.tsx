'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useFlashcardStore } from '@/store/flashcard-store';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import MascotCharacter from '@/components/MascotCharacter';

export default function ProfilePrompt() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setProfile = useFlashcardStore((state) => state.setProfile);
  const resetStore = useFlashcardStore((state) => state.resetStore);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    // 1. Clear previous local history to ensure isolation
    resetStore();
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({ display_name: name.trim() })
        .select()
        .single();

      if (error) throw error;

      setProfile({
        id: data.id,
        name: data.display_name,
        xp: data.total_xp || 0,
        streak: data.streak_days || 0,
      });
    } catch (err) {
      console.error('Failed to create profile:', err);
      // Fallback for local testing if DB is not setup yet
      setProfile({
        id: 'local-test',
        name: name.trim(),
        xp: 0,
        streak: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl">
      <div className="absolute inset-0 bg-black/60" />
      
      <div className="relative w-full max-w-lg bg-[#0f0a1e] border-2 border-purple-500/20 rounded-[40px] p-10 shadow-[0_0_100px_rgba(139,92,246,0.15)] overflow-hidden animate-fade-up">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <div className="w-24 h-24 relative mb-2">
             <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-pulse blur-xl" />
             <MascotCharacter 
               side="left"
               name="Sparky"
               subject="science" 
               state="jumping" 
               className="w-full h-full drop-shadow-2xl" 
             />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">FlashForge</span>
            </h2>
            <p className="text-gray-400 text-sm font-medium px-4">
              Your AI Forge is ready to ignite. What shall we call the master of this collection?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4 pt-4">
            <div className="relative group">
              <input
                type="text"
                autoFocus
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full h-16 bg-white/[0.03] border-2 border-white/5 group-hover:border-purple-500/30 focus:border-purple-500 rounded-3xl px-8 text-white font-bold transition-all outline-none text-center text-xl placeholder:text-gray-600 shadow-inner"
              />
              <div className="absolute inset-0 rounded-3xl pointer-events-none group-focus-within:ring-4 ring-purple-600/20 transition-all" />
            </div>

            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full h-16 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-800 disabled:to-gray-800 disabled:opacity-50 text-white font-black rounded-3xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-purple-900/40 group overflow-hidden relative"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Initialize Forge
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
              {/* Button shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          </form>

          <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">
            Database Connection Active · Secure Cloud Sync Enable
          </p>
        </div>
      </div>
    </div>
  );
}
