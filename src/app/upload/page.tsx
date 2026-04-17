'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, FileText, Sparkles, AlertCircle, CheckCircle2, 
  Loader2, X, ChevronRight, Brain, Zap, Rocket
} from 'lucide-react';
import { useFlashcardStore } from '@/store/flashcard-store';
import { generateId, getDeckEmoji } from '@/lib/utils';
import type { GenerationProgress, Flashcard, ClassLevel } from '@/types';
import MascotCharacter from '@/components/MascotCharacter';
import SampleLibrary from '@/components/forge/SampleLibrary';

const MODES = [
  { id: 'concept', label: 'Deep Learning', emoji: '🧠', desc: 'Core concept & definitions', mascot: 'science', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
  { id: 'exam', label: 'Exam Prep', emoji: '🎓', desc: 'High-yield prep & examples', mascot: 'history', color: 'text-pink-400', border: 'border-pink-500/30', bg: 'bg-pink-500/10' },
  { id: 'problem', label: 'Advanced Logic', emoji: '⚡', desc: 'Step-by-step logic labs', mascot: 'math', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
] as const;

export default function UploadPage() {
  const router = useRouter();
  const { addDeck, addCards } = useFlashcardStore();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [template, setTemplate] = useState<'concept' | 'exam' | 'problem'>('concept');
  const [classLevel, setClassLevel] = useState<ClassLevel>('mid');
  const [stage, setStage] = useState<'idle' | 'uploading' | 'generating' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');
  const [cardCount, setCardCount] = useState(0);
  const [newDeckId, setNewDeckId] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith('.pdf')) setFile(dropped);
    else setError('Please upload a valid PDF file.');
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.name.endsWith('.pdf')) setFile(selected);
  };

  const handleLibrarySelect = async (url: string, name: string) => {
    try {
      setStage('uploading');
      setStatusMsg('Downloading library sample...');
      const response = await fetch(`/api/proxy-download?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error('Failed to download from proxy');
      }
      
      const blob = await response.blob();
      const libraryFile = new File([blob], `${name}.pdf`, { type: 'application/pdf' });
      setFile(libraryFile);
      // Wait for state to settle then trigger generate
      setTimeout(() => {
        const forgeBtn = document.getElementById('forge-btn');
        forgeBtn?.click();
      }, 500);
    } catch (err) {
      console.error('Failed to load library sample:', err);
      setError('Failed to download library sample.');
      setStage('error');
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    setError('');
    setStage('uploading');
    setProgress(5);
    setStatusMsg('Extracting tactical data from PDF...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
      
      const deckId = generateId();
      const deck = {
        id: deckId,
        name: file.name.replace('.pdf', '').replace(/[-_]/g, ' '),
        fileName: file.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cardCount: 0,
        masteredCount: 0,
        masteryPercentage: 0,
        templateId: template,
        classLevel: classLevel,
        emoji: getDeckEmoji(file.name),
        description: `Generated Forge from ${file.name}`,
      };
      addDeck(deck);
      setNewDeckId(deckId);

      setStage('generating');
      setStatusMsg('AI Forge is crafting visual templates...');

      const genRes = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckId, chunks: uploadData.chunks, fileName: file.name, templateId: template, classLevel }),
      });

      if (!genRes.ok) throw new Error('Generation failed');

      const reader = genRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = JSON.parse(line.slice(6)) as GenerationProgress;

          if (data.type === 'progress') {
            setProgress(data.progress || 0);
            setStatusMsg(data.message || 'Forging...');
            if (data.cards) setCardCount(data.cards);
          } else if (data.type === 'complete') {
            const cards = data.flashcards as Flashcard[];
            addCards(cards);
            setCardCount(cards.length);
            setProgress(100);
            setStage('done');
          } else if (data.type === 'error') {
            throw new Error(data.error || 'Generation failed');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Forge Engine Failure');
      setStage('error');
    }
  };

  return (
    <div className="min-h-screen py-16 px-6 max-w-4xl mx-auto space-y-12">
      
      {/* 🚀 FORGE HEADER */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none">
          <Sparkles className="w-3 h-3" />
          Engine: AI Art Director v2
        </div>
        <h1 className="text-5xl font-black text-white tracking-tight">
          Forge New <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Collection</span>
        </h1>
        <p className="text-gray-500 text-sm font-medium tracking-wide max-w-lg mx-auto">
          Upload any PDF. Our AI Forge will extract the core logic and auto-assign 
          beautiful visual templates to every card.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: CONFIG */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* MODE SELECT */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/30 px-2">Forge Mode</h3>
            <div className="grid grid-cols-1 gap-3">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setTemplate(mode.id)}
                  className={`flex items-center gap-5 p-5 rounded-[24px] border-2 transition-all group text-left
                    ${template === mode.id 
                      ? `${mode.border} ${mode.bg} shadow-[0_0_30px_rgba(0,0,0,0.3)]` 
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                    }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all
                    ${template === mode.id ? 'bg-white/10 scale-110' : 'bg-white/5'}`}>
                    <MascotCharacter 
                      subject={mode.mascot} 
                      side="left"
                      name={mode.label}
                      state="idle"
                      className="w-8 h-8" 
                    />
                  </div>
                  <div className="flex-1">
                    <div className={`font-black uppercase tracking-widest text-[11px] mb-1 ${mode.color}`}>
                      {mode.label} {mode.emoji}
                    </div>
                    <div className="text-xs font-bold text-gray-500 leading-none">{mode.desc}</div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                    ${template === mode.id ? 'border-purple-400 bg-purple-400/20' : 'border-white/10'}`}>
                    {template === mode.id && <div className="w-2 h-2 rounded-full bg-purple-400" />}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* LEVEL SELECT */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/30 px-2">Academic Calibration</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'junior' as const, label: 'Junior', level: 'Classes 3-5', color: 'text-pink-400' },
                { id: 'mid' as const, label: 'Standard', level: 'Classes 6-10', color: 'text-blue-400' },
                { id: 'senior' as const, label: 'Senior', level: 'Classes 11-12+', color: 'text-purple-400' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setClassLevel(lvl.id)}
                  className={`flex flex-col gap-1 p-5 rounded-[24px] border-2 transition-all text-left
                    ${classLevel === lvl.id 
                      ? 'border-white/20 bg-white/10 shadow-lg' 
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                    }`}
                >
                  <div className={`text-[10px] font-black uppercase tracking-widest ${classLevel === lvl.id ? lvl.color : 'text-gray-500'}`}>
                    {lvl.label}
                  </div>
                  <div className="text-[9px] font-bold text-gray-600">{lvl.level}</div>
                </button>
              ))}
            </div>
          </section>

          {/* LIBRARY SECTION */}
          <div className="pt-4">
            <SampleLibrary onSelect={handleLibrarySelect} />
          </div>

        </div>

        {/* RIGHT COLUMN: CAPTURE AREA */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 space-y-6">
            
            {/* DROP ZONE */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative h-[400px] rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center gap-6 cursor-pointer transition-all overflow-hidden
                ${isDragging ? 'border-purple-500 bg-purple-500/10 scale-[1.02]' : 'border-white/10 bg-white/[0.02] hover:border-purple-500/30'}
                ${(stage === 'uploading' || stage === 'generating') ? 'pointer-events-none' : ''}
              `}
            >
              <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
              
              {stage === 'idle' ? (
                <>
                  <div className="w-20 h-20 rounded-3xl bg-purple-600/20 border border-purple-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(124,58,237,0.15)] animate-antigravity">
                    <Upload className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="text-center space-y-1 px-8">
                    <p className="text-sm font-black text-white uppercase tracking-widest">
                      {file ? file.name : 'Target Acquired'}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-relaxed">
                      {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · Ready for Forge` : 'Drop PDF or Click to browse'}
                    </p>
                  </div>
                  {file && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </>
              ) : stage === 'uploading' || stage === 'generating' ? (
                <div className="flex flex-col items-center gap-6 px-10 text-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-purple-500/10 border-t-purple-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-purple-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-black text-white">{progress}%</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 animate-pulse">{statusMsg}</div>
                  </div>
                  {cardCount > 0 && (
                    <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                      {cardCount} Cards Forged
                    </div>
                  )}
                </div>
              ) : stage === 'done' ? (
                <div className="flex flex-col items-center gap-6 px-10 text-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white">Forge Complete!</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                      {cardCount} Tactical cards are ready for your study session
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      if (newDeckId) router.push(`/practice/${newDeckId}`);
                    }}
                    className="mt-4 px-8 py-4 rounded-2xl bg-emerald-600 text-white font-black flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-emerald-900/20"
                  >
                    <Rocket className="w-5 h-5" />
                    Launch Practice
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 px-10 text-center">
                  <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-rose-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-white uppercase">Forge Error</p>
                    <p className="text-[10px] text-rose-400/60 font-medium">{error}</p>
                  </div>
                  <button onClick={() => setStage('idle')} className="text-[10px] font-black uppercase text-white/40 hover:text-white underline underline-offset-4">Retry Forge</button>
                </div>
              )}
            </div>

            {/* ACTION BUTTON */}
            {stage === 'idle' && file && (
              <button 
                id="forge-btn"
                onClick={handleGenerate}
                className="w-full py-6 rounded-[24px] bg-purple-600 text-white font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-purple-900/40"
              >
                <Sparkles className="w-6 h-6" />
                Forge with AI Art Director
                <ChevronRight className="w-5 h-5 opacity-40 ml-2" />
              </button>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
