'use client';
import { motion } from 'framer-motion';
import type { Flashcard } from '@/types';

interface Props { card: Flashcard; side: 'front' | 'back'; }

export default function DataTable({ card, side }: Props) {
  const text = side === 'front' ? card.front : card.back;
  const lines = text.split('\n').filter(l => l.trim());
  const isTable = lines.length > 2 && side === 'back';

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col p-6"
      style={{ background: 'linear-gradient(145deg, #020d1f 0%, #041329 100%)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-full opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      <div className="relative flex items-center gap-2 mb-4">
        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
          style={{ background: 'rgba(6,182,212,0.2)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.3)' }}>
          {card.type.replace('_', ' ')}
        </span>
        <div className="ml-auto flex gap-1">
          {[1,2,3,4,5].map(d => (
            <div key={d} className="w-1.5 h-1.5 rounded-full"
              style={{ background: d <= card.difficulty ? '#06b6d4' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
      </div>

      {isTable ? (
        <div className="relative flex-1 overflow-auto">
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(6,182,212,0.2)' }}>
            {lines.map((line, i) => (
              <motion.div key={i} className="flex items-center px-4 py-2.5"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                style={{ background: i % 2 === 0 ? 'rgba(6,182,212,0.05)' : 'transparent', borderBottom: i < lines.length - 1 ? '1px solid rgba(6,182,212,0.1)' : 'none' }}>
                <span className="text-xs font-mono w-5 mr-3 text-right flex-shrink-0" style={{ color: '#06b6d4' }}>{i + 1}</span>
                <span className="text-sm" style={{ color: '#e2e8f0' }}>
                  {line.replace(/^\d+[\.\)]\s*/, '').replace(/^[-•]\s*/, '')}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div className="relative flex-1 flex items-center justify-center"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className={`text-center leading-relaxed font-semibold ${text.length > 120 ? 'text-lg' : 'text-2xl'}`}
            style={{ color: '#f1f5f9' }}>
            {text}
          </p>
        </motion.div>
      )}

      <div className="relative mt-3 text-center text-xs" style={{ color: 'rgba(6,182,212,0.3)' }}>
        {side === 'front' ? '⊞ Data card — tap to view' : `${lines.length} data points`}
      </div>
    </div>
  );
}
