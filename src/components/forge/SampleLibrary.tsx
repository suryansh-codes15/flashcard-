'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Brain, ArrowRight, Zap, Loader2 } from 'lucide-react';
import MascotCharacter from '@/components/MascotCharacter';

interface SampleItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  pdf_url: string;
  difficulty_tag: string;
  subject_mascot: string;
}

interface SampleLibraryProps {
  onSelect: (url: string, name: string) => void;
}

export default function SampleLibrary({ onSelect }: SampleLibraryProps) {
  const [samples, setSamples] = useState<SampleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSamples() {
      try {
        const { data, error } = await supabase
          .from('sample_library')
          .select('*');

        if (error) throw error;
        setSamples(data || []);
      } catch (err) {
        console.error('Failed to fetch library:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSamples();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500/50" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Accessing Cloud Library...</p>
      </div>
    );
  }

  if (samples.length === 0) return null;

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
          <Zap className="w-3 h-3 text-amber-400" />
          The FlashForge Library
        </h3>
        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Public Samples</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {samples.map((sample) => (
          <button
            key={sample.id}
            onClick={() => onSelect(sample.pdf_url, sample.name)}
            className="group relative flex items-start gap-4 p-5 rounded-[32px] bg-[#0f0a1e]/50 border border-white/5 hover:border-purple-500/40 hover:bg-[#1a1040]/40 transition-all text-left"
          >
            {/* Mascot Icon */}
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MascotCharacter subject={sample.subject_mascot as any} className="w-8 h-8" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">{sample.emoji}</span>
                <h4 className="font-black text-white text-sm group-hover:text-purple-300 transition-colors uppercase tracking-tight">
                  {sample.name}
                </h4>
              </div>
              <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                {sample.description}
              </p>
              <div className="pt-2 flex items-center gap-3">
                <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase text-gray-400 tracking-widest">
                  {sample.difficulty_tag}
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[9px] font-black text-purple-400 uppercase tracking-widest transition-opacity">
                  Instant Forge <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
