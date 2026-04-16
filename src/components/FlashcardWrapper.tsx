'use client';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import type { Flashcard, ClassLevel, CardType } from '@/types';

// Dynamically load the 8 core templates
const ConceptCard = dynamic(() => import('./templates/ConceptCard'));
const ExampleCard = dynamic(() => import('./templates/ExampleCard'));
const MCQCard     = dynamic(() => import('./templates/MCQCard'));
const InsightCard = dynamic(() => import('./templates/InsightCard'));
const ProblemCard = dynamic(() => import('./templates/ProblemCard'));
const SummaryCard = dynamic(() => import('./templates/SummaryCard'));
const VisualCard  = dynamic(() => import('./templates/VisualCard'));
const FunCard     = dynamic(() => import('./templates/FunCard'));

interface Props {
  card: Flashcard;
  side: 'front' | 'back';
  selectedOption?: string | null;
  onSelect?: (option: string) => void;
}

export default function FlashcardWrapper({ card, side, selectedOption, onSelect }: Props) {
  const { type, level } = card;

  // Level-based global variants for Framer Motion
  const levelVariants = {
    junior: { scale: 1.05, rotate: 1, transition: { type: 'spring', stiffness: 300 } },
    mid: { scale: 1.02, rotate: 0, transition: { type: 'spring', stiffness: 200 } },
    senior: { scale: 1.01, rotate: 0, transition: { ease: 'easeInOut', duration: 0.4 } },
  };

  const currentLevel: ClassLevel = level || 'mid';

  const renderTemplate = (s: 'front' | 'back') => {
    const props = { card, level: currentLevel, side: s, selectedOption, onSelect };
    
    switch (type) {
      case 'concept': return <ConceptCard {...props} />;
      case 'example': return <ExampleCard {...props} />;
      case 'mcq':     return <MCQCard     {...props} />;
      case 'insight': return <InsightCard {...props} />;
      case 'problem': return <ProblemCard {...props} />;
      case 'summary': return <SummaryCard {...props} />;
      case 'visual':  return <VisualCard  {...props} />;
      case 'fun':     return <FunCard     {...props} />;
      default:        return <ConceptCard {...props} />;
    }
  };

  return (
    <motion.div
      whileHover={levelVariants[currentLevel]}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative w-full h-[450px] cursor-pointer perspective-1000 ${
        currentLevel === 'junior' ? 'rounded-[3rem]' : 
        currentLevel === 'mid' ? 'rounded-[2.5rem]' : 'rounded-[1.5rem]'
      }`}
    >
      <div 
        className="w-full h-full relative transition-all duration-700 preserve-3d"
        style={{ transform: side === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front Face */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          {renderTemplate('front')}
        </div>
        
        {/* Back Face */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          {renderTemplate('back')}
        </div>
      </div>
    </motion.div>
  );
}
