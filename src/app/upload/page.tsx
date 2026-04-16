'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Sparkles, AlertCircle, CheckCircle2,
  Loader2, X, BookOpen, GraduationCap, Wrench, ChevronRight, Zap
} from 'lucide-react';
import { useFlashcardStore } from '@/store/flashcard-store';
import { generateId, getDeckEmoji } from '@/lib/utils';
import type { GenerationProgress, Flashcard, ClassLevel } from '@/types';

const TEMPLATES = [
  {
    id: 'concept' as const,
    label: 'Deep Learning',
    emoji: '🧠',
    icon: BookOpen,
    desc: 'Concepts, definitions, relationships & edge cases',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.3)',
    bg: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))',
    border: 'rgba(99,102,241,0.35)',
  },
  {
    id: 'exam' as const,
    label: 'Exam Prep',
    emoji: '🎓',
    icon: GraduationCap,
    desc: 'High-yield definitions, applications & examples',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.3)',
    bg: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.06))',
    border: 'rgba(245,158,11,0.35)',
  },
  {
    id: 'problem' as const,
    label: 'Problem Solving',
    emoji: '⚡',
    icon: Zap,
    desc: 'Step-by-step worked examples & case studies',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.3)',
    bg: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(20,184,166,0.06))',
    border: 'rgba(16,185,129,0.35)',
  },
];

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

  const selectedTemplate = TEMPLATES.find(t => t.id === template)!;

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

  const resetFile = () => {
    setFile(null);
    setStage('idle');
    setError('');
    setProgress(0);
    setStatusMsg('');
  };

  const handleGenerate = async () => {
    if (!file) return;
    setError('');
    setStage('uploading');
    setProgress(5);
    setStatusMsg('Extracting text from PDF...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
      if (!uploadData.chunks?.length) throw new Error('No readable text found in PDF.');

      const deckId = generateId();
      const deck = {
        id: deckId,
        name: file.name.replace('.pdf', '').replace(/[-_]/g, ' '),
        fileName: file.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cardCount: 0,
        masteredCount: 0,
        templateId: template,
        classLevel: classLevel,
        emoji: getDeckEmoji(file.name),
        description: `Generated from ${file.name} with ${uploadData.chunks.length} sections`,
      };
      addDeck(deck);
      setNewDeckId(deckId);

      setStage('generating');
      setProgress(10);
      setStatusMsg('AI is reading your PDF & assigning visual templates...');

      const genRes = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckId, chunks: uploadData.chunks, fileName: file.name, templateId: template, classLevel }),
      });

      if (!genRes.ok) {
        const err = await genRes.json();
        throw new Error(err.error || 'Generation failed');
      }

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
            setStatusMsg(data.message || 'Generating...');
            if (data.cards) setCardCount(data.cards);
          } else if (data.type === 'complete') {
            const cards = data.flashcards as Flashcard[];
            addCards(cards);
            setCardCount(cards.length);
            setProgress(100);
            setStage('done');
            setStatusMsg(`Created ${cards.length} cards!`);
          } else if (data.type === 'error') {
            throw new Error(data.error || 'Generation failed');
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStage('error');
    }
  };

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div className="absolute w-[800px] h-[800px] rounded-full top-[-20%] left-[-15%] opacity-[0.07]"
          style={{ background: `radial-gradient(circle, ${selectedTemplate.color} 0%, transparent 70%)`, filter: 'blur(80px)' }}
          animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute w-[600px] h-[600px] rounded-full bottom-[-10%] right-[-10%] opacity-[0.05]"
          style={{ background: `radial-gradient(circle, ${selectedTemplate.color} 0%, transparent 70%)`, filter: 'blur(100px)' }}
          animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 12, repeat: Infinity }} />
      </div>

      <div className="relative z-10 min-h-screen pt-28 pb-20 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-sm font-semibold"
              style={{ background: `${selectedTemplate.color}15`, color: selectedTemplate.color, border: `1px solid ${selectedTemplate.color}30` }}>
              <Sparkles className="w-4 h-4" />
              AI Art Director Mode
            </div>
            <h1 className="text-5xl font-black mb-3 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Create a New{' '}
              <span style={{ background: `linear-gradient(135deg, ${selectedTemplate.color}, ${selectedTemplate.color}88)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Deck
              </span>
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              AI reads your PDF and auto-assigns beautiful visual templates to every card
            </p>
          </motion.div>

          {/* Template Selection */}
          <motion.div className="mb-7" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
              Choose Study Mode
            </p>
            <div className="grid grid-cols-3 gap-3">
              {TEMPLATES.map((t) => (
                <motion.button key={t.id} onClick={() => setTemplate(t.id)}
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                  className="relative p-4 rounded-2xl text-left transition-all duration-300 overflow-hidden"
                  style={{
                    background: template === t.id ? t.bg : 'var(--bg-card)',
                    border: `1px solid ${template === t.id ? t.border : 'var(--border-strong)'}`,
                    boxShadow: template === t.id ? `0 8px 32px ${t.glow}` : 'none',
                  }}>
                  {template === t.id && (
                    <motion.div className="absolute inset-0 opacity-30" layoutId="template-glow"
                      style={{ background: t.bg }} />
                  )}
                  <div className="relative">
                    <div className="text-2xl mb-2">{t.emoji}</div>
                    <div className="font-bold text-sm mb-1" style={{ color: template === t.id ? t.color : 'var(--text-primary)' }}>
                      {t.label}
                    </div>
                    <div className="text-xs leading-relaxed hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                      {t.desc}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Class Level Selection */}
          <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
              Select Academic Level
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'junior' as const, label: 'Junior', sub: 'Class 3–5', emoji: '🎈', color: '#f472b6' },
                { id: 'mid' as const, label: 'Mid', sub: 'Class 6–8', emoji: '🌱', color: '#60a5fa' },
                { id: 'senior' as const, label: 'Senior', sub: 'Class 9–12', emoji: '🎓', color: '#818cf8' },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => setClassLevel(l.id)}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    classLevel === l.id 
                      ? 'border-white/20 bg-white/5 shadow-lg' 
                      : 'border-white/5 bg-transparent hover:bg-white/5 opacity-60'
                  }`}
                >
                  <div className="text-xl mb-1">{l.emoji}</div>
                  <div className="font-bold text-sm" style={{ color: classLevel === l.id ? l.color : 'white' }}>{l.label}</div>
                  <div className="text-[10px] uppercase font-black tracking-widest opacity-40">{l.sub}</div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Drop Zone */}
          <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {!file ? (
              <motion.div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
                className="relative border-2 border-dashed rounded-3xl p-14 text-center cursor-pointer transition-all duration-300"
                style={{
                  borderColor: isDragging ? selectedTemplate.color : 'var(--border-strong)',
                  background: isDragging ? `${selectedTemplate.color}08` : 'var(--bg-card)',
                }}>
                <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                <motion.div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${selectedTemplate.color}, ${selectedTemplate.color}aa)`, boxShadow: `0 12px 40px ${selectedTemplate.glow}` }}
                  animate={{ rotate: isDragging ? 12 : 0 }}
                  whileHover={{ rotate: 8, scale: 1.08 }}>
                  <Upload className="w-8 h-8 text-white" />
                </motion.div>
                <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {isDragging ? '✦ Drop to unlock your PDF ✦' : 'Drop your PDF here'}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  or click to browse · Max 20 MB · Any academic PDF
                </p>

                {/* Template preview pills */}
                <div className="flex flex-wrap gap-2 justify-center mt-5">
                  {['Concept Glow', 'Timeline Steps', 'Formula Dark', 'Warning Edge', 'Exam Highlight'].map(name => (
                    <span key={name} className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: `${selectedTemplate.color}15`, color: selectedTemplate.color, border: `1px solid ${selectedTemplate.color}25` }}>
                      {name}
                    </span>
                  ))}
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                    +7 more
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-3xl flex items-center gap-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}>
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                {stage === 'idle' && (
                  <button onClick={resetFile}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-red-500/10"
                    style={{ color: 'var(--text-muted)' }}>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="mb-5 p-4 rounded-2xl flex items-center gap-3"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generation Progress */}
          <AnimatePresence>
            {(stage === 'uploading' || stage === 'generating') && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-6 rounded-3xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: `${selectedTemplate.color}20` }}>
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: selectedTemplate.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{statusMsg}</p>
                      {cardCount > 0 && (
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{cardCount} cards crafted so far</p>
                      )}
                    </div>
                  </div>
                  <span className="text-2xl font-black" style={{ color: selectedTemplate.color }}>{progress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <motion.div className="h-full rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: 'easeOut', duration: 0.5 }}
                    style={{ background: `linear-gradient(90deg, ${selectedTemplate.color}, ${selectedTemplate.color}99)`, boxShadow: `0 0 16px ${selectedTemplate.glow}` }} />
                </div>
                {/* Shimmer hint text */}
                <p className="text-xs mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
                  🎨 AI Art Director is assigning visual templates per card
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success */}
          <AnimatePresence>
            {stage === 'done' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-8 rounded-3xl text-center"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>
                  {cardCount} Cards Created!
                </h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Each card has a unique visual template chosen by the AI Art Director.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button onClick={() => router.push(`/practice/${newDeckId}`)}
                    whileHover={{ y: -2 }} className="btn-brand">
                    <Sparkles className="w-4 h-4" />
                    Start Studying
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                  <button onClick={() => router.push('/dashboard')} className="btn-secondary">
                    Go to Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate Button */}
          {(stage === 'idle' || stage === 'error') && file && (
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              className="w-full py-5 rounded-2xl text-white font-black text-base flex items-center justify-center gap-3 transition-all"
              style={{
                background: `linear-gradient(135deg, ${selectedTemplate.color}, ${selectedTemplate.color}cc)`,
                boxShadow: `0 8px 32px ${selectedTemplate.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
              }}>
              <Sparkles className="w-5 h-5" />
              Generate with AI Art Director
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}

        </div>
      </div>
    </div>
  );
}
